import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserProfile, ChatSession, Message, SessionAnalysis, ContextSummary
from app.schemas import (
    SessionCreateRequest,
    SessionResponse,
    SessionListResponse,
    SessionDetailResponse,
    MessageSendRequest,
    MessageResponse,
    AnalysisResponse,
    ErrorResponse,
)
from app.auth import get_current_user
from app.prompts import build_system_prompt
from app.services.claude_service import stream_chat_response
from app.services.analysis_service import (
    extract_analysis,
    generate_session_summary,
    update_context_summary,
)
from app.services.pdf_service import generate_pdf_report

router = APIRouter(prefix="/sessions", tags=["sessions"])

MAX_ACTIVE_SESSIONS = 5
MAX_MESSAGES_PER_SESSION = 30
FORCE_ANALYSIS_AFTER = 15


def _get_session_or_404(
    session_id: str, user_id: str, db: Session
) -> ChatSession:
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return session


@router.get("", response_model=SessionListResponse)
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.started_at.desc())
        .all()
    )
    return SessionListResponse(
        sessions=[SessionResponse.model_validate(s) for s in sessions]
    )


@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    responses={429: {"model": ErrorResponse}},
)
def create_session(
    data: SessionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    active_count = (
        db.query(ChatSession)
        .filter(
            ChatSession.user_id == current_user.id,
            ChatSession.status == "active",
        )
        .count()
    )
    if active_count >= MAX_ACTIVE_SESSIONS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Maximum {MAX_ACTIVE_SESSIONS} active sessions allowed. End an existing session first.",
        )

    session = ChatSession(
        user_id=current_user.id,
        title=data.title or "New Session",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return SessionResponse.model_validate(session)


@router.get(
    "/{session_id}",
    response_model=SessionDetailResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_session_or_404(session_id, current_user.id, db)
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.message_order.asc())
        .all()
    )
    return SessionDetailResponse(
        session=SessionResponse.model_validate(session),
        messages=[MessageResponse.model_validate(m) for m in messages],
    )


@router.post(
    "/{session_id}/message",
    responses={404: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
)
async def send_message(
    session_id: str,
    data: MessageSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_session_or_404(session_id, current_user.id, db)

    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is no longer active",
        )

    # Count existing messages
    msg_count = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .count()
    )
    if msg_count >= MAX_MESSAGES_PER_SESSION:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Maximum {MAX_MESSAGES_PER_SESSION} messages per session reached.",
        )

    # Save user message
    user_msg = Message(
        session_id=session_id,
        user_id=current_user.id,
        role="user",
        content=data.content,
        message_order=msg_count + 1,
    )
    db.add(user_msg)
    session.questions_asked_count = session.questions_asked_count + 1
    db.commit()

    # Load all messages for context
    all_messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.message_order.asc())
        .all()
    )
    chat_history = [{"role": m.role, "content": m.content} for m in all_messages]

    # Build system prompt with user profile + context summary
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    ctx_summary = db.query(ContextSummary).filter(
        ContextSummary.user_id == current_user.id
    ).first()

    # Count assistant messages for force-analysis check
    assistant_msg_count = sum(1 for m in all_messages if m.role == "assistant")
    force_analysis = assistant_msg_count >= FORCE_ANALYSIS_AFTER

    system_prompt = build_system_prompt(
        user=current_user,
        profile=profile,
        context_summary=ctx_summary,
        force_analysis=force_analysis,
    )

    # Capture context needed for post-stream DB operations
    user_id = current_user.id
    new_msg_order = msg_count + 2

    # Stream response — collect full text, do DB work in finally block
    full_response_chunks = []
    stream_completed = False

    async def event_generator():
        nonlocal full_response_chunks, stream_completed
        try:
            async for chunk in stream_chat_response(system_prompt, chat_history):
                full_response_chunks.append(chunk)
                yield f"event: message\ndata: {json.dumps({'text': chunk})}\n\n"

            stream_completed = True
            yield "event: done\ndata: {}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

        finally:
            # Always save the assistant message if we got any response
            if full_response_chunks:
                try:
                    complete_text = "".join(full_response_chunks)
                    assistant_msg = Message(
                        session_id=session_id,
                        user_id=user_id,
                        role="assistant",
                        content=complete_text,
                        message_order=new_msg_order,
                    )
                    db.add(assistant_msg)
                    db.commit()

                    # Check for analysis tags
                    analysis_data = extract_analysis(complete_text)
                    if analysis_data:
                        analysis = SessionAnalysis(
                            session_id=session_id,
                            user_id=user_id,
                            analysis_json=analysis_data.get("analysis_json"),
                            analysis_markdown=analysis_data.get("analysis_markdown"),
                            roadmap_json=analysis_data.get("roadmap_json"),
                        )
                        db.add(analysis)

                        # Mark session as completed
                        session_obj = db.query(ChatSession).filter(
                            ChatSession.id == session_id
                        ).first()
                        if session_obj:
                            session_obj.status = "completed"
                            session_obj.ended_at = datetime.now(timezone.utc).isoformat()
                            session_obj.analysis_generated = 1

                            # Generate session summary
                            summary = await generate_session_summary(chat_history + [
                                {"role": "assistant", "content": complete_text}
                            ])
                            session_obj.session_summary = summary

                            # Update rolling context summary
                            await update_context_summary(db, user_id, summary)

                        db.commit()

                except Exception:
                    db.rollback()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/{session_id}/end",
    response_model=SessionResponse,
    responses={404: {"model": ErrorResponse}},
)
async def end_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_session_or_404(session_id, current_user.id, db)

    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is already ended",
        )

    session.status = "completed"
    session.ended_at = datetime.now(timezone.utc).isoformat()

    # Generate summary from messages
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.message_order.asc())
        .all()
    )
    if messages:
        chat_history = [{"role": m.role, "content": m.content} for m in messages]
        summary = await generate_session_summary(chat_history)
        session.session_summary = summary
        await update_context_summary(db, current_user.id, summary)

    db.commit()
    db.refresh(session)

    return SessionResponse.model_validate(session)


@router.get(
    "/{session_id}/analysis",
    response_model=AnalysisResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_analysis(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_session_or_404(session_id, current_user.id, db)

    analysis = db.query(SessionAnalysis).filter(
        SessionAnalysis.session_id == session_id,
        SessionAnalysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found for this session",
        )
    return AnalysisResponse.model_validate(analysis)


@router.get(
    "/{session_id}/report",
    responses={404: {"model": ErrorResponse}},
)
def download_report(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_session_or_404(session_id, current_user.id, db)

    analysis = db.query(SessionAnalysis).filter(
        SessionAnalysis.session_id == session_id,
        SessionAnalysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No analysis available to generate report",
        )

    pdf_bytes = generate_pdf_report(
        user=current_user,
        session=session,
        analysis=analysis,
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="iklavya-report-{session_id[:8]}.pdf"',
        },
    )

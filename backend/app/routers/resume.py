import json
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserProfile, ResumeSession, ResumeMessage, Resume
from app.schemas import (
    ResumeSessionCreateRequest,
    ResumeSessionResponse,
    ResumeSessionListResponse,
    ResumeSessionDetailResponse,
    ResumeMessageSendRequest,
    ResumeMessageResponse,
    ResumeResponse,
    ResumeTemplateUpdateRequest,
    ResumeListResponse,
    ErrorResponse,
)
from app.auth import get_current_user
from app.prompts import build_resume_system_prompt
from app.services.claude_service import stream_chat_response
from app.services.resume_pdf_service import generate_resume_pdf

router = APIRouter(prefix="/resume", tags=["resume"])

MAX_RESUME_SESSIONS = 10
MAX_MESSAGES_PER_SESSION = 25
FORCE_RESUME_AFTER = 12


def _extract_resume_json(response_text: str) -> str | None:
    """Extract and validate resume JSON from Claude's response."""
    match = re.search(
        r"<resume_json>\s*(.*?)\s*</resume_json>",
        response_text,
        re.DOTALL,
    )
    if not match:
        return None
    raw = match.group(1).strip()
    try:
        data = json.loads(raw)
        if "personal_info" not in data or "education" not in data:
            return None
        return raw
    except json.JSONDecodeError:
        return None


def _get_session_or_404(
    session_id: str, user_id: str, db: Session
) -> ResumeSession:
    session = db.query(ResumeSession).filter(
        ResumeSession.id == session_id,
        ResumeSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume session not found",
        )
    return session


@router.get("/sessions", response_model=ResumeSessionListResponse)
def list_resume_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(ResumeSession)
        .filter(ResumeSession.user_id == current_user.id)
        .order_by(ResumeSession.started_at.desc())
        .all()
    )
    return ResumeSessionListResponse(
        sessions=[ResumeSessionResponse.model_validate(s) for s in sessions]
    )


@router.post(
    "/sessions",
    response_model=ResumeSessionResponse,
    status_code=status.HTTP_201_CREATED,
    responses={429: {"model": ErrorResponse}},
)
def create_resume_session(
    data: ResumeSessionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    active_count = (
        db.query(ResumeSession)
        .filter(
            ResumeSession.user_id == current_user.id,
            ResumeSession.status == "active",
        )
        .count()
    )
    if active_count >= MAX_RESUME_SESSIONS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Maximum {MAX_RESUME_SESSIONS} active resume sessions allowed.",
        )

    session = ResumeSession(
        user_id=current_user.id,
        title=data.title or "New Resume",
        template=data.template or "professional",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return ResumeSessionResponse.model_validate(session)


@router.get(
    "/sessions/{session_id}",
    response_model=ResumeSessionDetailResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_resume_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_session_or_404(session_id, current_user.id, db)
    messages = (
        db.query(ResumeMessage)
        .filter(ResumeMessage.session_id == session_id)
        .order_by(ResumeMessage.message_order.asc())
        .all()
    )
    return ResumeSessionDetailResponse(
        session=ResumeSessionResponse.model_validate(session),
        messages=[ResumeMessageResponse.model_validate(m) for m in messages],
    )


@router.post(
    "/sessions/{session_id}/message",
    responses={404: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
)
async def send_resume_message(
    session_id: str,
    data: ResumeMessageSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_session_or_404(session_id, current_user.id, db)

    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume session is no longer active",
        )

    msg_count = (
        db.query(ResumeMessage)
        .filter(ResumeMessage.session_id == session_id)
        .count()
    )
    if msg_count >= MAX_MESSAGES_PER_SESSION:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Maximum {MAX_MESSAGES_PER_SESSION} messages per resume session reached.",
        )

    # Save user message
    user_msg = ResumeMessage(
        session_id=session_id,
        user_id=current_user.id,
        role="user",
        content=data.content,
        message_order=msg_count + 1,
    )
    db.add(user_msg)
    session.message_count = msg_count + 1
    db.commit()

    # Load all messages for context
    all_messages = (
        db.query(ResumeMessage)
        .filter(ResumeMessage.session_id == session_id)
        .order_by(ResumeMessage.message_order.asc())
        .all()
    )
    chat_history = [{"role": m.role, "content": m.content} for m in all_messages]

    # Build system prompt
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    assistant_msg_count = sum(1 for m in all_messages if m.role == "assistant")
    force_resume = assistant_msg_count >= FORCE_RESUME_AFTER

    system_prompt = build_resume_system_prompt(
        user=current_user,
        profile=profile,
        force_resume=force_resume,
    )

    user_id = current_user.id
    new_msg_order = msg_count + 2

    full_response_chunks = []

    async def event_generator():
        nonlocal full_response_chunks
        try:
            async for chunk in stream_chat_response(system_prompt, chat_history):
                full_response_chunks.append(chunk)
                yield f"event: message\ndata: {json.dumps({'text': chunk})}\n\n"

            # Stream complete — check for resume data
            complete_text = "".join(full_response_chunks)
            resume_json_str = _extract_resume_json(complete_text)

            if resume_json_str:
                # Use pre-selected template from the session
                session_for_template = db.query(ResumeSession).filter(
                    ResumeSession.id == session_id
                ).first()
                selected_template = session_for_template.template if session_for_template else "professional"

                resume = Resume(
                    session_id=session_id,
                    user_id=user_id,
                    resume_json=resume_json_str,
                    template=selected_template,
                )
                db.add(resume)

                session_obj = db.query(ResumeSession).filter(
                    ResumeSession.id == session_id
                ).first()
                if session_obj:
                    session_obj.status = "completed"
                    session_obj.ended_at = datetime.now(timezone.utc).isoformat()

                db.commit()
                db.refresh(resume)

                yield f"event: resume_ready\ndata: {json.dumps({'resume_id': resume.id, 'resume_json': resume_json_str})}\n\n"

            yield "event: done\ndata: {}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

        finally:
            if full_response_chunks:
                try:
                    complete_text = "".join(full_response_chunks)
                    assistant_msg = ResumeMessage(
                        session_id=session_id,
                        user_id=user_id,
                        role="assistant",
                        content=complete_text,
                        message_order=new_msg_order,
                    )
                    db.add(assistant_msg)

                    session_obj = db.query(ResumeSession).filter(
                        ResumeSession.id == session_id
                    ).first()
                    if session_obj:
                        session_obj.message_count = new_msg_order

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


@router.get(
    "/by-session/{session_id}",
    response_model=ResumeResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_resume_by_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(
        Resume.session_id == session_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found for this session",
        )
    return ResumeResponse.model_validate(resume)


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )
    return ResumeResponse.model_validate(resume)


@router.patch(
    "/{resume_id}/template",
    response_model=ResumeResponse,
    responses={404: {"model": ErrorResponse}},
)
def update_resume_template(
    resume_id: str,
    data: ResumeTemplateUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    resume.template = data.template
    resume.updated_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    db.refresh(resume)

    return ResumeResponse.model_validate(resume)


@router.get(
    "/{resume_id}/download",
    responses={404: {"model": ErrorResponse}},
)
def download_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    pdf_bytes = generate_resume_pdf(
        resume.resume_json,
        resume.template,
        profile_image_url=current_user.profile_image,
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="iklavya-resume-{resume_id[:8]}.pdf"',
        },
    )

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import MentorSession, MentorMessage, Mentor, User, utc_now
from app.routers.mentor_auth import get_current_mentor
from app.routers.notifications import create_notification
from app.email import send_mentor_session_accepted_email
from app.schemas import (
    SessionBookRequest,
    SessionRespondRequest,
    MentorMessageCreate,
    MentorSessionResponse,
    MentorSessionListResponse,
    MentorSessionDetailResponse,
    MentorMessageResponse,
    UnreadCountResponse,
)

router = APIRouter(tags=["mentor-sessions"])


# ─── Helpers ──────────────────────────────────────────────


def _build_session_response(
    session: MentorSession,
    student_name: str,
    mentor_name: str,
    unread_count: int,
) -> MentorSessionResponse:
    return MentorSessionResponse(
        id=session.id,
        student_id=session.student_id,
        mentor_id=session.mentor_id,
        topic=session.topic,
        student_message=session.student_message,
        preferred_date=session.preferred_date,
        preferred_time=session.preferred_time,
        status=session.status,
        mentor_note=session.mentor_note,
        created_at=session.created_at,
        updated_at=session.updated_at,
        student_name=student_name,
        mentor_name=mentor_name,
        unread_count=unread_count,
    )


def _get_unread_count_for_student(db: Session, session: MentorSession) -> int:
    """Count mentor messages the student hasn't read yet."""
    q = db.query(func.count(MentorMessage.id)).filter(
        MentorMessage.session_id == session.id,
        MentorMessage.sender_type == "mentor",
    )
    if session.student_last_read_at:
        q = q.filter(MentorMessage.created_at > session.student_last_read_at)
    return q.scalar() or 0


def _get_unread_count_for_mentor(db: Session, session: MentorSession) -> int:
    """Count student messages the mentor hasn't read yet."""
    q = db.query(func.count(MentorMessage.id)).filter(
        MentorMessage.session_id == session.id,
        MentorMessage.sender_type == "student",
    )
    if session.mentor_last_read_at:
        q = q.filter(MentorMessage.created_at > session.mentor_last_read_at)
    return q.scalar() or 0


def _get_messages(
    db: Session, session_id: str, after: str | None = None
) -> list[MentorMessage]:
    q = db.query(MentorMessage).filter(MentorMessage.session_id == session_id)
    if after:
        q = q.filter(MentorMessage.created_at > after)
    return q.order_by(MentorMessage.message_order.asc()).all()


def _build_message_response(
    msg: MentorMessage, names: dict[str, str]
) -> MentorMessageResponse:
    sender_name = names.get(msg.sender_id, "Unknown")
    return MentorMessageResponse(
        id=msg.id,
        session_id=msg.session_id,
        sender_type=msg.sender_type,
        sender_id=msg.sender_id,
        sender_name=sender_name,
        content=msg.content,
        message_order=msg.message_order,
        created_at=msg.created_at,
    )


def _next_order(db: Session, session_id: str) -> int:
    max_order = (
        db.query(func.max(MentorMessage.message_order))
        .filter(MentorMessage.session_id == session_id)
        .scalar()
    )
    return (max_order or 0) + 1


# ─── Student Endpoints ───────────────────────────────────


@router.post(
    "/mentor-sessions/request",
    response_model=MentorSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def book_session(
    body: SessionBookRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mentor = db.query(Mentor).filter(Mentor.id == body.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    if mentor.is_verified != 1:
        raise HTTPException(status_code=400, detail="Mentor is not verified yet")
    if mentor.is_available != 1:
        raise HTTPException(status_code=400, detail="Mentor is currently unavailable")

    # Check for duplicate pending request
    existing = (
        db.query(MentorSession)
        .filter(
            MentorSession.student_id == user.id,
            MentorSession.mentor_id == body.mentor_id,
            MentorSession.status == "requested",
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="You already have a pending request with this mentor",
        )

    session = MentorSession(
        student_id=user.id,
        mentor_id=body.mentor_id,
        topic=body.topic,
        student_message=body.student_message,
        preferred_date=body.preferred_date,
        preferred_time=body.preferred_time,
    )
    db.add(session)

    # Notify mentor about new session request
    create_notification(
        db, "mentor", body.mentor_id, "session_requested",
        f"New session request from {user.name}",
        f"Topic: {body.topic}",
        "/mentor/dashboard",
    )

    db.commit()
    db.refresh(session)

    return _build_session_response(session, user.name, mentor.name, 0)


@router.get("/mentor-sessions/my", response_model=MentorSessionListResponse)
def list_my_sessions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(MentorSession)
        .filter(MentorSession.student_id == user.id)
        .order_by(MentorSession.updated_at.desc())
        .all()
    )

    result = []
    for s in sessions:
        mentor = db.query(Mentor).filter(Mentor.id == s.mentor_id).first()
        mentor_name = mentor.name if mentor else "Unknown"
        unread = _get_unread_count_for_student(db, s)
        result.append(_build_session_response(s, user.name, mentor_name, unread))

    return MentorSessionListResponse(sessions=result)


@router.get("/mentor-sessions/unread-count", response_model=UnreadCountResponse)
def student_unread_count(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(MentorSession)
        .filter(
            MentorSession.student_id == user.id,
            MentorSession.status.in_(["accepted", "requested"]),
        )
        .all()
    )
    total = sum(_get_unread_count_for_student(db, s) for s in sessions)
    return UnreadCountResponse(count=total)


@router.get("/mentor-sessions/{session_id}", response_model=MentorSessionDetailResponse)
def get_session_detail_student(
    session_id: str,
    after: str | None = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
    if not session or session.student_id != user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    mentor = db.query(Mentor).filter(Mentor.id == session.mentor_id).first()
    mentor_name = mentor.name if mentor else "Unknown"
    unread = _get_unread_count_for_student(db, session)

    messages = _get_messages(db, session_id, after)
    # Build name lookup
    names: dict[str, str] = {user.id: user.name}
    if mentor:
        names[mentor.id] = mentor.name

    return MentorSessionDetailResponse(
        session=_build_session_response(session, user.name, mentor_name, unread),
        messages=[_build_message_response(m, names) for m in messages],
    )


@router.post(
    "/mentor-sessions/{session_id}/messages",
    response_model=MentorMessageResponse,
)
def student_send_message(
    session_id: str,
    body: MentorMessageCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
    if not session or session.student_id != user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "accepted":
        raise HTTPException(
            status_code=400,
            detail="Cannot send messages — session is not accepted",
        )

    msg = MentorMessage(
        session_id=session_id,
        sender_type="student",
        sender_id=user.id,
        content=body.content,
        message_order=_next_order(db, session_id),
    )
    db.add(msg)
    # Update session timestamp
    session.updated_at = utc_now()
    # Auto mark-read for sender
    session.student_last_read_at = utc_now()

    # Notify mentor about new message
    preview = body.content[:80] + ("..." if len(body.content) > 80 else "")
    create_notification(
        db, "mentor", session.mentor_id, "mentor_reply",
        f"New message from {user.name}",
        preview,
        f"/mentor/dashboard/sessions/{session_id}",
    )

    db.commit()
    db.refresh(msg)

    return MentorMessageResponse(
        id=msg.id,
        session_id=msg.session_id,
        sender_type=msg.sender_type,
        sender_id=msg.sender_id,
        sender_name=user.name,
        content=msg.content,
        message_order=msg.message_order,
        created_at=msg.created_at,
    )


@router.post("/mentor-sessions/{session_id}/read")
def student_mark_read(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
    if not session or session.student_id != user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    session.student_last_read_at = utc_now()
    db.commit()
    return {"message": "Marked as read"}


@router.post("/mentor-sessions/{session_id}/complete")
def student_complete_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
    if not session or session.student_id != user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status not in ("accepted",):
        raise HTTPException(status_code=400, detail="Session cannot be completed")

    session.status = "completed"
    session.updated_at = utc_now()
    db.commit()
    return {"message": "Session completed"}


# ─── Mentor Endpoints ────────────────────────────────────


@router.get("/mentor-sessions/inbox", response_model=MentorSessionListResponse)
def mentor_inbox(
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(MentorSession)
        .filter(MentorSession.mentor_id == mentor.id)
        .order_by(MentorSession.updated_at.desc())
        .all()
    )

    result = []
    for s in sessions:
        student = db.query(User).filter(User.id == s.student_id).first()
        student_name = student.name if student else "Unknown"
        unread = _get_unread_count_for_mentor(db, s)
        result.append(_build_session_response(s, student_name, mentor.name, unread))

    return MentorSessionListResponse(sessions=result)


@router.post("/mentor-sessions/{session_id}/respond")
def mentor_respond(
    session_id: str,
    body: SessionRespondRequest,
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
    if not session or session.mentor_id != mentor.id:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "requested":
        raise HTTPException(status_code=400, detail="Session is not in requested state")

    student = db.query(User).filter(User.id == session.student_id).first()
    student_name = student.name if student else "Student"

    if body.action == "accept":
        session.status = "accepted"
        session.mentor_note = body.mentor_note
        # Notify student
        create_notification(
            db, "student", session.student_id, "session_accepted",
            f"Session accepted by {mentor.name}!",
            f"Your mentorship session on \"{session.topic}\" has been accepted. You can now start chatting.",
            f"/dashboard/mentorship/chat/{session.id}",
        )
        # Send email
        if student:
            send_mentor_session_accepted_email(student.name, student.email, mentor.name, session.topic)
    else:
        session.status = "rejected"
        session.mentor_note = body.mentor_note
        create_notification(
            db, "student", session.student_id, "session_rejected",
            f"Session declined by {mentor.name}",
            body.mentor_note or "Your mentorship request was declined.",
            "/dashboard/mentorship",
        )

    session.updated_at = utc_now()
    db.commit()

    return {
        "message": f"Session {body.action}ed",
        "status": session.status,
    }


@router.get(
    "/mentor-sessions/{session_id}/detail",
    response_model=MentorSessionDetailResponse,
)
def get_session_detail_mentor(
    session_id: str,
    after: str | None = Query(default=None),
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
    if not session or session.mentor_id != mentor.id:
        raise HTTPException(status_code=404, detail="Session not found")

    student = db.query(User).filter(User.id == session.student_id).first()
    student_name = student.name if student else "Unknown"
    unread = _get_unread_count_for_mentor(db, session)

    messages = _get_messages(db, session_id, after)
    names: dict[str, str] = {mentor.id: mentor.name}
    if student:
        names[student.id] = student.name

    return MentorSessionDetailResponse(
        session=_build_session_response(session, student_name, mentor.name, unread),
        messages=[_build_message_response(m, names) for m in messages],
    )


@router.post(
    "/mentor-sessions/{session_id}/send",
    response_model=MentorMessageResponse,
)
def mentor_send_message(
    session_id: str,
    body: MentorMessageCreate,
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
    if not session or session.mentor_id != mentor.id:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "accepted":
        raise HTTPException(
            status_code=400,
            detail="Cannot send messages — session is not accepted",
        )

    msg = MentorMessage(
        session_id=session_id,
        sender_type="mentor",
        sender_id=mentor.id,
        content=body.content,
        message_order=_next_order(db, session_id),
    )
    db.add(msg)
    session.updated_at = utc_now()
    session.mentor_last_read_at = utc_now()

    # Notify student about new message
    preview = body.content[:80] + ("..." if len(body.content) > 80 else "")
    create_notification(
        db, "student", session.student_id, "mentor_reply",
        f"New message from {mentor.name}",
        preview,
        f"/dashboard/mentorship/chat/{session_id}",
    )

    db.commit()
    db.refresh(msg)

    return MentorMessageResponse(
        id=msg.id,
        session_id=msg.session_id,
        sender_type=msg.sender_type,
        sender_id=msg.sender_id,
        sender_name=mentor.name,
        content=msg.content,
        message_order=msg.message_order,
        created_at=msg.created_at,
    )


@router.post("/mentor-sessions/{session_id}/mark-read")
def mentor_mark_read(
    session_id: str,
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
    if not session or session.mentor_id != mentor.id:
        raise HTTPException(status_code=404, detail="Session not found")

    session.mentor_last_read_at = utc_now()
    db.commit()
    return {"message": "Marked as read"}


@router.post("/mentor-sessions/{session_id}/close")
def mentor_close_session(
    session_id: str,
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    session = db.query(MentorSession).filter(MentorSession.id == session_id).first()
    if not session or session.mentor_id != mentor.id:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status not in ("accepted",):
        raise HTTPException(status_code=400, detail="Session cannot be closed")

    session.status = "completed"
    session.updated_at = utc_now()
    db.commit()
    return {"message": "Session closed"}


@router.get("/mentor-sessions/mentor-unread", response_model=UnreadCountResponse)
def mentor_unread_count(
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(MentorSession)
        .filter(
            MentorSession.mentor_id == mentor.id,
            MentorSession.status.in_(["accepted", "requested"]),
        )
        .all()
    )
    total = sum(_get_unread_count_for_mentor(db, s) for s in sessions)
    return UnreadCountResponse(count=total)

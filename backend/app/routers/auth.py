import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    RegisterRequest,
    LoginRequest,
    EventEntryRequest,
    AuthResponse,
    UserResponse,
    ErrorResponse,
    PromoteUserRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
)
from app.auth import hash_password, verify_password, create_token, get_current_user
from app.email import send_welcome_email, send_password_reset_email
from app.routers.notifications import create_notification

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ErrorResponse}},
)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        college=data.college,
    )
    db.add(user)
    db.flush()

    # Welcome notification
    create_notification(
        db, "student", user.id, "welcome",
        "Welcome to IKLAVYA!",
        "Your account is ready. Explore courses, build your resume, and start your career journey.",
        "/dashboard",
    )

    db.commit()
    db.refresh(user)

    token = create_token(user.id, user.email, user.role)

    # Send welcome email (non-blocking, fails silently)
    send_welcome_email(user.name, user.email)

    return AuthResponse(user=UserResponse.model_validate(user), token=token)


@router.post(
    "/login",
    response_model=AuthResponse,
    responses={401: {"model": ErrorResponse}},
)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_token(user.id, user.email, user.role)
    return AuthResponse(user=UserResponse.model_validate(user), token=token)


# ── TEMPORARY: Event entry (remove after 2026-03-24) ──
@router.post(
    "/event-entry",
    response_model=AuthResponse,
)
def event_entry(data: EventEntryRequest, db: Session = Depends(get_db)):
    """Temporary endpoint for public event — auto-creates user, no password needed."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        user = User(
            name=data.name,
            email=data.email,
            phone=data.phone or "",
            password_hash=hash_password("event-guest-2024"),
            college=data.college,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_token(user.id, user.email, user.role)
    return AuthResponse(user=UserResponse.model_validate(user), token=token)
# ── END TEMPORARY ──


@router.get(
    "/me",
    response_model=UserResponse,
    responses={401: {"model": ErrorResponse}},
)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post(
    "/promote",
    responses={403: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def promote_user(
    body: PromoteUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    target = db.query(User).filter(User.email == body.email).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target.role = "admin"
    db.commit()
    return {"message": f"{target.email} promoted to admin"}


# ─── Password Reset ──────────────────────────────────────


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send password reset email. Always returns 200 to not reveal if email exists."""
    user = db.query(User).filter(User.email == body.email).first()
    if user:
        token = secrets.token_urlsafe(32)
        expiry = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
        user.reset_token = token
        user.reset_token_expiry = expiry
        db.commit()
        send_password_reset_email(user.name, user.email, token)

    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using a valid reset token."""
    user = db.query(User).filter(User.reset_token == body.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Check expiry
    if user.reset_token_expiry:
        expiry = datetime.fromisoformat(user.reset_token_expiry)
        if datetime.now(timezone.utc) > expiry:
            user.reset_token = None
            user.reset_token_expiry = None
            db.commit()
            raise HTTPException(status_code=400, detail="Reset token has expired")

    user.password_hash = hash_password(body.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()

    return {"message": "Password has been reset successfully"}


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change password for logged-in user."""
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password_hash = hash_password(body.new_password)
    db.commit()

    return {"message": "Password changed successfully"}

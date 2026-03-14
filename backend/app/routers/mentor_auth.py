import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Mentor, User
from app.auth import hash_password, verify_password, get_current_user, decode_token
from app.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_DAYS
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.schemas import (
    MentorRegisterRequest, MentorLoginRequest, MentorProfileUpdateRequest,
    MentorAuthResponse, MentorResponse, MentorPublicResponse, MentorListResponse,
    MentorVerifyRequest, ErrorResponse,
)

router = APIRouter(tags=["mentors"])

security = HTTPBearer(auto_error=False)


# ─── Helpers ──────────────────────────────────────────────


def _create_mentor_token(mentor: Mentor) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    payload = {
        "sub": mentor.id,
        "email": mentor.email,
        "role": "mentor",
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_mentor(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Mentor:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    payload = decode_token(credentials.credentials)
    if payload.get("role") != "mentor":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: not a mentor token",
        )
    mentor_id = payload.get("sub")
    if not mentor_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mentor not found",
        )
    return mentor


def _mentor_response(mentor: Mentor, token: str) -> MentorAuthResponse:
    return MentorAuthResponse(
        mentor=MentorResponse.model_validate(mentor),
        token=token,
    )


# ─── Endpoints ────────────────────────────────────────────


@router.post(
    "/mentor/register",
    response_model=MentorAuthResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ErrorResponse}},
)
def mentor_register(body: MentorRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Mentor).filter(Mentor.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A mentor with this email already exists",
        )

    mentor = Mentor(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        phone=body.phone,
        specialization=body.specialization,
        bio=body.bio,
        expertise_json=json.dumps(body.expertise) if body.expertise else None,
        linkedin_url=body.linkedin_url,
        experience_years=body.experience_years,
    )
    db.add(mentor)
    db.commit()
    db.refresh(mentor)

    token = _create_mentor_token(mentor)
    return _mentor_response(mentor, token)


@router.post(
    "/mentor/login",
    response_model=MentorAuthResponse,
    responses={401: {"model": ErrorResponse}},
)
def mentor_login(body: MentorLoginRequest, db: Session = Depends(get_db)):
    mentor = db.query(Mentor).filter(Mentor.email == body.email).first()
    if not mentor or not verify_password(body.password, mentor.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = _create_mentor_token(mentor)
    return _mentor_response(mentor, token)


@router.get("/mentor/me", response_model=MentorResponse)
def mentor_me(mentor: Mentor = Depends(get_current_mentor)):
    return MentorResponse.model_validate(mentor)


@router.patch("/mentor/profile", response_model=MentorResponse)
def mentor_profile_update(
    body: MentorProfileUpdateRequest,
    mentor: Mentor = Depends(get_current_mentor),
    db: Session = Depends(get_db),
):
    update_data = body.model_dump(exclude_unset=True)

    # Convert expertise list → JSON string
    if "expertise" in update_data:
        expertise = update_data.pop("expertise")
        update_data["expertise_json"] = json.dumps(expertise) if expertise is not None else None

    for field, value in update_data.items():
        setattr(mentor, field, value)

    db.commit()
    db.refresh(mentor)
    return MentorResponse.model_validate(mentor)


@router.get("/mentors/verified", response_model=MentorListResponse)
def list_verified_mentors(db: Session = Depends(get_db)):
    mentors = db.query(Mentor).filter(Mentor.is_verified == 1).all()
    return MentorListResponse(
        mentors=[MentorPublicResponse.model_validate(m) for m in mentors]
    )


@router.post("/mentor/verify")
def verify_mentor(
    body: MentorVerifyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    mentor = db.query(Mentor).filter(Mentor.email == body.email).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found",
        )

    if body.action == "verify":
        mentor.is_verified = 1
        db.commit()
        return {"message": f"Mentor {mentor.email} has been verified"}
    else:
        db.delete(mentor)
        db.commit()
        return {"message": f"Mentor {mentor.email} has been rejected and removed"}


@router.get("/mentor/pending", response_model=list[MentorResponse])
def list_pending_mentors(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    mentors = db.query(Mentor).filter(Mentor.is_verified == 0).all()
    return [MentorResponse.model_validate(m) for m in mentors]

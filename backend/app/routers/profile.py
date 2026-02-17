import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserProfile
from app.schemas import (
    ProfileCreateRequest,
    ProfileUpdateRequest,
    ProfileResponse,
    ErrorResponse,
)
from app.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

JSON_FIELDS = [
    "hobbies", "interests", "strengths", "weaknesses", "languages",
]


def _to_db(data: dict) -> dict:
    """Convert list fields to JSON strings for storage."""
    out = {}
    for k, v in data.items():
        if k in JSON_FIELDS and isinstance(v, list):
            out[k] = json.dumps(v)
        else:
            out[k] = v
    return out


def _from_db(profile: UserProfile) -> dict:
    """Convert JSON string fields back to lists for response."""
    d = {c.key: getattr(profile, c.key) for c in profile.__table__.columns}
    for field in JSON_FIELDS:
        val = d.get(field)
        if val and isinstance(val, str):
            try:
                d[field] = json.loads(val)
            except json.JSONDecodeError:
                d[field] = []
        elif val is None:
            d[field] = None
    return d


@router.get(
    "",
    response_model=ProfileResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    return ProfileResponse(**_from_db(profile))


@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ErrorResponse}},
)
def create_profile(
    data: ProfileCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists. Use PUT to update.",
        )

    db_data = _to_db(data.model_dump(exclude_unset=True))
    profile = UserProfile(user_id=current_user.id, **db_data)
    db.add(profile)

    # Mark profile as partially completed (step 2)
    current_user.profile_completed = 1
    db.commit()
    db.refresh(profile)

    return ProfileResponse(**_from_db(profile))


@router.put(
    "",
    response_model=ProfileResponse,
    responses={404: {"model": ErrorResponse}},
)
def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Use POST to create.",
        )

    update_data = _to_db(data.model_dump(exclude_unset=True))
    for key, value in update_data.items():
        setattr(profile, key, value)

    # Mark profile as fully completed (step 3)
    current_user.profile_completed = 2
    db.commit()
    db.refresh(profile)

    return ProfileResponse(**_from_db(profile))

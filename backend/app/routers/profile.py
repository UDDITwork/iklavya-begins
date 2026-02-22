import json
import hashlib
import time
import httpx

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserProfile
from app.config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

from app.schemas import (
    ProfileCreateRequest,
    ProfileUpdateRequest,
    ProfileResponse,
    ErrorResponse,
)
from app.auth import get_current_user

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

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


# ─── Profile Image ──────────────────────────────────────────


def _cloudinary_signature(timestamp: int, folder: str) -> str:
    """Generate Cloudinary signed upload signature."""
    params = f"folder={folder}&timestamp={timestamp}{CLOUDINARY_API_SECRET}"
    return hashlib.sha1(params.encode()).hexdigest()


@router.put(
    "/image",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def update_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are allowed",
        )

    # Read and validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 2MB",
        )

    # Upload to Cloudinary
    timestamp = int(time.time())
    folder = "iklavya/profiles"
    signature = _cloudinary_signature(timestamp, folder)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/image/upload",
            data={
                "api_key": CLOUDINARY_API_KEY,
                "timestamp": str(timestamp),
                "signature": signature,
                "folder": folder,
                "transformation": "c_fill,w_400,h_400,g_face,q_auto,f_auto",
            },
            files={"file": (file.filename or "profile.jpg", contents, file.content_type)},
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image to cloud storage",
        )

    image_url = resp.json().get("secure_url", "")

    # Save to DB
    current_user.profile_image = image_url
    db.commit()
    db.refresh(current_user)
    return {"profile_image": current_user.profile_image}

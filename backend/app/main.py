import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, profile, sessions, resume, resume_drafts, classroom, jobs, mentorship, assessments, mentor_auth, mentor_sessions, notifications, analytics, interview, broadcast_quiz

Base.metadata.create_all(bind=engine)

# Run lightweight migrations for new columns on existing tables
from sqlalchemy import text as _text
with engine.connect() as _conn:
    _migrations = [
        "ALTER TABLE interview_sessions ADD COLUMN warning_issued INTEGER NOT NULL DEFAULT 0",
    ]
    for _sql in _migrations:
        try:
            _conn.execute(_text(_sql))
            _conn.commit()
        except Exception:
            _conn.rollback()  # Column already exists — ignore

app = FastAPI(
    title="IKLAVYA API",
    description="Backend API for IKLAVYA Student Career Readiness Portal",
    version="1.0.0",
)

allowed_origins = os.environ.get("ALLOWED_ORIGINS", "").split(",")
allowed_origins = [o.strip() for o in allowed_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(sessions.router)
app.include_router(resume.router)
app.include_router(resume_drafts.router)
app.include_router(classroom.router)
app.include_router(jobs.router)
app.include_router(mentorship.router)
app.include_router(assessments.router)
app.include_router(mentor_auth.router)
app.include_router(mentor_sessions.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(interview.router)
app.include_router(broadcast_quiz.router)


@app.get("/health")
def health():
    return {"status": "ok"}

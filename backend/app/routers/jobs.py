import json
import os
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Job, JobApplication, User, UserProfile

router = APIRouter(prefix="/jobs", tags=["jobs"])

FIRECRAWL_API_KEY = os.environ.get("FIRECRAWL_API_KEY", "")

SCRAPE_QUERIES = {
    "sales": [
        "sales executive jobs Delhi NCR fresher salary 15000 to 30000",
    ],
    "receptionist": [
        "receptionist front desk executive jobs Delhi",
    ],
    "admin": [
        "office admin coordinator jobs Delhi NCR graduate",
    ],
    "customer-support": [
        "BPO telecaller customer support voice process jobs Gurugram Delhi",
    ],
    "accounts": [
        "accounts assistant tally BCom jobs Delhi NCR",
    ],
    "marketing": [
        "field marketing executive jobs Delhi freshers",
    ],
    "retail": [
        "retail store associate sales jobs Delhi",
    ],
    "data-entry": [
        "data entry operator jobs Delhi work from home",
    ],
    "telecalling": [
        "telecaller telesales executive jobs India hiring",
    ],
}


# ── Feed endpoint ─────────────────────────────────────────


@router.get("/feed")
def get_job_feed(
    category: str = Query("all"),
    search: str = Query(""),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Job)

    if category and category != "all":
        query = query.filter(Job.role_category == category)

    if search:
        like = f"%{search}%"
        query = query.filter(
            (Job.title.ilike(like))
            | (Job.company.ilike(like))
            | (Job.location.ilike(like))
            | (Job.description.ilike(like))
        )

    total = query.count()
    jobs = query.order_by(Job.scraped_at.desc()).offset((page - 1) * limit).limit(limit).all()

    # Get user's applied/saved jobs for status
    user_actions = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == current_user.id)
        .all()
    )
    applied_ids = {a.job_id for a in user_actions if a.status == "applied"}
    saved_ids = {a.job_id for a in user_actions if a.status == "saved"}

    # Get profile for match scoring
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    result = []
    for job in jobs:
        tags = []
        reqs = []
        try:
            tags = json.loads(job.tags_json) if job.tags_json else []
        except (json.JSONDecodeError, TypeError):
            pass
        try:
            reqs = json.loads(job.requirements_json) if job.requirements_json else []
        except (json.JSONDecodeError, TypeError):
            pass

        result.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location or "India",
            "salary": job.salary or "Not disclosed",
            "type": job.job_type or "Full-time",
            "experience": job.experience or "Fresher",
            "description": job.description or "",
            "requirements": reqs,
            "postedAt": job.posted_at or job.scraped_at,
            "sourceUrl": job.apply_link or job.source_url or "",
            "sourceName": job.source_name or "Web",
            "category": job.role_category,
            "tags": tags,
            "matchScore": compute_match_score(job, profile),
            "isApplied": job.id in applied_ids,
            "isSaved": job.id in saved_ids,
        })

    return {
        "jobs": result,
        "total": total,
        "page": page,
        "hasMore": page * limit < total,
    }


# ── Save/bookmark ────────────────────────────────────────


@router.post("/save")
def toggle_save_job(
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job_id = body.get("jobId")
    if not job_id:
        raise HTTPException(status_code=400, detail="jobId required")

    existing = (
        db.query(JobApplication)
        .filter(
            JobApplication.user_id == current_user.id,
            JobApplication.job_id == job_id,
            JobApplication.status == "saved",
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "jobId": job_id}

    app = JobApplication(
        user_id=current_user.id,
        job_id=job_id,
        status="saved",
    )
    db.add(app)
    db.commit()
    return {"saved": True, "jobId": job_id}


# ── Apply ────────────────────────────────────────────────


@router.post("/apply")
def apply_to_job(
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job_id = body.get("jobId")
    if not job_id:
        raise HTTPException(status_code=400, detail="jobId required")

    existing = (
        db.query(JobApplication)
        .filter(
            JobApplication.user_id == current_user.id,
            JobApplication.job_id == job_id,
            JobApplication.status == "applied",
        )
        .first()
    )

    if existing:
        return {"applied": True, "jobId": job_id, "message": "Already applied"}

    app = JobApplication(
        user_id=current_user.id,
        job_id=job_id,
        status="applied",
    )
    db.add(app)
    db.commit()
    return {"applied": True, "jobId": job_id}


# ── Scrape trigger (admin/cron) ──────────────────────────


@router.post("/scrape")
def trigger_scrape(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    if not FIRECRAWL_API_KEY:
        raise HTTPException(status_code=400, detail="FIRECRAWL_API_KEY not configured")

    total_added = 0

    for category, queries in SCRAPE_QUERIES.items():
        for query in queries:
            try:
                resp = httpx.post(
                    "https://api.firecrawl.dev/v1/search",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {FIRECRAWL_API_KEY}",
                    },
                    json={
                        "query": query,
                        "limit": 10,
                        "scrapeOptions": {"formats": ["markdown"]},
                    },
                    timeout=30.0,
                )

                if resp.status_code != 200:
                    continue

                data = resp.json()
                results = data.get("data", [])

                for result in results:
                    url = result.get("url", "")
                    title = result.get("title", "")
                    content = result.get("markdown", "") or result.get("description", "")

                    if not url or not title:
                        continue

                    # Deduplicate
                    existing = (
                        db.query(Job)
                        .filter(Job.title == title[:200], Job.source_url == url[:500])
                        .first()
                    )
                    if existing:
                        continue

                    job = Job(
                        title=title[:200],
                        company=_extract_company(title, content),
                        location=_extract_location(content),
                        salary=_extract_salary(content),
                        job_type="Full-time",
                        experience=_extract_experience(content),
                        description=content[:2000],
                        requirements_json=json.dumps(_extract_requirements(content)),
                        tags_json=json.dumps(_extract_tags(title, content)),
                        role_category=category,
                        source_url=url[:500],
                        source_name=_extract_source(url),
                        apply_link=url[:500],
                        posted_at=datetime.now(timezone.utc).isoformat(),
                    )
                    db.add(job)
                    total_added += 1

            except Exception:
                continue

    db.commit()
    return {"message": f"Scrape complete. {total_added} new jobs added."}


# ── Match scoring ────────────────────────────────────────


def compute_match_score(job: Job, profile: UserProfile | None) -> int:
    if not profile:
        return 0

    score = 0
    text = f"{job.title or ''} {job.description or ''}"
    text_lower = text.lower()

    # Location match (30)
    if profile.city and profile.city.lower() in (job.location or "").lower():
        score += 30
    elif profile.state and profile.state.lower() in (job.location or "").lower():
        score += 15

    # Education match (25)
    if profile.education_level:
        edu = profile.education_level.lower()
        if edu in text_lower or "graduate" in text_lower or "any degree" in text_lower:
            score += 25
        elif "12th pass" in text_lower or "10th pass" in text_lower:
            score += 15

    # Fresher boost (20)
    if "fresher" in text_lower or "no experience" in text_lower:
        score += 20

    # Interest match (25)
    interests = (profile.career_aspiration_raw or "").lower()
    try:
        interest_list = json.loads(profile.interests) if profile.interests else []
        interests += " " + " ".join(interest_list).lower()
    except (json.JSONDecodeError, TypeError):
        pass

    if interests:
        words = text_lower.split()
        matched = sum(1 for w in words if len(w) > 3 and w in interests)
        score += min(25, matched * 5)

    return min(100, score)


# ── Extraction helpers (for scraping) ────────────────────


def _extract_company(title: str, content: str) -> str:
    import re
    patterns = [
        r"(?:Company|Employer)\s*[:\-]\s*(.+?)[\n\r]",
        r"(?:at|@)\s+([A-Z][A-Za-z\s&.]+?)(?:\s*[-|,]|\n)",
    ]
    for p in patterns:
        m = re.search(p, content, re.IGNORECASE) or re.search(p, title, re.IGNORECASE)
        if m:
            return m.group(1).strip()[:200]
    return "Company"


def _extract_location(content: str) -> str:
    import re
    m = re.search(r"(?:Location|City)\s*[:\-]\s*(.+?)[\n\r]", content, re.IGNORECASE)
    if m:
        return m.group(1).strip()[:200]
    m = re.search(
        r"(Delhi|Mumbai|Bangalore|Bengaluru|Hyderabad|Chennai|Kolkata|Pune|Noida|Gurgaon|Gurugram|Jaipur|Lucknow|Ahmedabad|Remote|Work from home)",
        content, re.IGNORECASE,
    )
    return m.group(0).strip() if m else "India"


def _extract_salary(content: str) -> str:
    import re
    m = re.search(r"(?:Salary|CTC|Package)\s*[:\-]\s*(.+?)[\n\r]", content, re.IGNORECASE)
    if m:
        return m.group(1).strip()[:100]
    m = re.search(r"(?:Rs\.?|INR|₹)\s*[\d,.]+\s*[-–to]+\s*(?:Rs\.?|INR|₹)?\s*[\d,.]+", content)
    return m.group(0).strip()[:100] if m else ""


def _extract_experience(content: str) -> str:
    import re
    m = re.search(r"(?:Experience|Exp)\s*[:\-]\s*(.+?)[\n\r]", content, re.IGNORECASE)
    if m:
        return m.group(1).strip()[:100]
    m = re.search(r"(\d+\s*[-–to]+\s*\d+\s*(?:years?|yrs?))", content, re.IGNORECASE)
    if m:
        return m.group(0).strip()
    m = re.search(r"(Fresher|0\s*[-–]\s*\d+\s*(?:years?|yrs?))", content, re.IGNORECASE)
    return m.group(0).strip() if m else ""


def _extract_requirements(content: str) -> list[str]:
    import re
    reqs = []
    section = re.search(
        r"(?:Requirements?|Qualifications?|Eligibility)\s*[:\s]*\n([\s\S]*?)(?:\n\n|\n(?=[A-Z]))",
        content, re.IGNORECASE,
    )
    if section:
        for line in section.group(1).split("\n"):
            cleaned = re.sub(r"^[\s\-*•·]+", "", line).strip()
            if 5 < len(cleaned) < 120:
                reqs.append(cleaned)
    return reqs[:6]


def _extract_tags(title: str, content: str) -> list[str]:
    text = f"{title} {content}".lower()
    tags = []
    keywords = {
        "fresher": "Freshers OK", "walk-in": "Walk-in", "work from home": "WFH Option",
        "wfh": "WFH Option", "immediate joining": "Immediate Joining",
        "night shift": "Night Shift", "incentive": "Incentives",
    }
    for kw, tag in keywords.items():
        if kw in text and tag not in tags:
            tags.append(tag)
    return tags[:5]


def _extract_source(url: str) -> str:
    try:
        from urllib.parse import urlparse
        host = urlparse(url).hostname or ""
        if "naukri" in host: return "Naukri"
        if "indeed" in host: return "Indeed"
        if "linkedin" in host: return "LinkedIn"
        if "shine" in host: return "Shine"
        return host.replace("www.", "").split(".")[0].capitalize()
    except Exception:
        return "Web"

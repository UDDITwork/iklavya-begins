import json
import logging
import re
import os
import time
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Job, JobApplication, User, UserProfile
from app.routers.notifications import create_notification

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])

FIRECRAWL_API_KEY = os.environ.get("FIRECRAWL_API_KEY", "")
CRON_SECRET = os.environ.get("CRON_SECRET", "")

# ── Scrape queries (19 categories × India-wide) ─────────

SCRAPE_QUERIES = {
    # ── Existing categories ──
    "sales": [
        "sales executive jobs India fresher salary 15000 to 30000",
        "sales representative field sales jobs Mumbai Delhi Bangalore hiring",
    ],
    "receptionist": [
        "receptionist front desk executive jobs India hiring",
        "front office executive jobs Mumbai Delhi Bangalore Hyderabad",
    ],
    "admin": [
        "office admin coordinator jobs India graduate hiring",
        "office assistant administrative jobs Delhi Mumbai Pune",
    ],
    "customer-support": [
        "BPO telecaller customer support voice process jobs India hiring",
        "call center executive customer care jobs Delhi Bangalore Hyderabad",
    ],
    "accounts": [
        "accounts assistant tally BCom jobs India hiring",
        "accounting clerk bookkeeper jobs Mumbai Delhi Pune",
    ],
    "marketing": [
        "field marketing executive jobs India freshers hiring",
        "marketing executive brand promoter jobs Delhi Mumbai Chennai",
    ],
    "retail": [
        "retail store associate sales jobs India hiring",
        "showroom sales executive retail jobs Mumbai Delhi Bangalore",
    ],
    "data-entry": [
        "data entry operator jobs India work from home hiring",
        "data entry clerk back office jobs Delhi Mumbai Kolkata",
    ],
    "telecalling": [
        "telecaller telesales executive jobs India hiring",
        "outbound calling executive jobs Mumbai Delhi Hyderabad",
    ],
    # ── New low-spectrum categories ──
    "delivery": [
        "delivery boy delivery partner jobs India Swiggy Zomato Amazon",
        "courier delivery executive jobs Mumbai Delhi Bangalore hiring",
    ],
    "driver": [
        "driver jobs India Ola Uber personal driver hiring",
        "commercial vehicle driver jobs Delhi Mumbai Bangalore",
    ],
    "security": [
        "security guard watchman jobs India fresher hiring",
        "security officer guard jobs Mumbai Delhi Hyderabad",
    ],
    "housekeeping": [
        "housekeeping staff jobs hotel hospital India hiring",
        "cleaning staff housekeeping jobs Mumbai Delhi Bangalore",
    ],
    "warehouse": [
        "warehouse jobs India Amazon Flipkart packing helper",
        "godown helper warehouse executive jobs Delhi Mumbai",
    ],
    "packing": [
        "packing helper jobs India factory ecommerce hiring",
        "packaging operator packing staff jobs Delhi Mumbai",
    ],
    "helper": [
        "office helper peon jobs India hiring",
        "general helper factory assistant jobs Delhi Mumbai Kolkata",
    ],
    "cook": [
        "cook chef kitchen helper jobs India restaurant hotel",
        "canteen cook kitchen staff jobs Mumbai Delhi Bangalore",
    ],
    "electrician": [
        "electrician technician jobs India fresher experienced",
        "electrical maintenance technician jobs Delhi Mumbai Pune",
    ],
    "tailor": [
        "tailor stitching garment worker jobs India hiring",
        "fashion tailor alteration jobs Mumbai Delhi Jaipur",
    ],
}

# ── City / State normalization maps ──────────────────────

CITY_ALIASES = {
    "gurgaon": "Gurugram", "gurugram": "Gurugram",
    "bangalore": "Bengaluru", "bengaluru": "Bengaluru",
    "bombay": "Mumbai", "mumbai": "Mumbai",
    "madras": "Chennai", "chennai": "Chennai",
    "calcutta": "Kolkata", "kolkata": "Kolkata",
    "delhi": "Delhi", "new delhi": "Delhi",
    "noida": "Noida", "greater noida": "Noida",
    "hyderabad": "Hyderabad", "pune": "Pune",
    "jaipur": "Jaipur", "lucknow": "Lucknow",
    "ahmedabad": "Ahmedabad", "chandigarh": "Chandigarh",
    "indore": "Indore", "bhopal": "Bhopal",
    "patna": "Patna", "nagpur": "Nagpur",
    "surat": "Surat", "vadodara": "Vadodara",
    "coimbatore": "Coimbatore", "kochi": "Kochi",
    "visakhapatnam": "Visakhapatnam", "vizag": "Visakhapatnam",
    "thiruvananthapuram": "Thiruvananthapuram",
    "guwahati": "Guwahati", "ranchi": "Ranchi",
    "dehradun": "Dehradun", "mysore": "Mysuru", "mysuru": "Mysuru",
}

CITY_TO_STATE = {
    "Delhi": "Delhi", "Noida": "Uttar Pradesh", "Gurugram": "Haryana",
    "Mumbai": "Maharashtra", "Pune": "Maharashtra", "Nagpur": "Maharashtra",
    "Bengaluru": "Karnataka", "Mysuru": "Karnataka",
    "Chennai": "Tamil Nadu", "Coimbatore": "Tamil Nadu",
    "Hyderabad": "Telangana", "Visakhapatnam": "Andhra Pradesh",
    "Kolkata": "West Bengal", "Jaipur": "Rajasthan",
    "Lucknow": "Uttar Pradesh", "Ahmedabad": "Gujarat",
    "Surat": "Gujarat", "Vadodara": "Gujarat",
    "Chandigarh": "Chandigarh", "Indore": "Madhya Pradesh",
    "Bhopal": "Madhya Pradesh", "Patna": "Bihar",
    "Kochi": "Kerala", "Thiruvananthapuram": "Kerala",
    "Guwahati": "Assam", "Ranchi": "Jharkhand",
    "Dehradun": "Uttarakhand",
}

ALL_CITIES_PATTERN = re.compile(
    r"(Delhi|Mumbai|Bombay|Bangalore|Bengaluru|Hyderabad|Chennai|Madras|"
    r"Kolkata|Calcutta|Pune|Noida|Gurgaon|Gurugram|Jaipur|Lucknow|"
    r"Ahmedabad|Chandigarh|Indore|Bhopal|Patna|Nagpur|Surat|Vadodara|"
    r"Coimbatore|Kochi|Visakhapatnam|Vizag|Thiruvananthapuram|"
    r"Guwahati|Ranchi|Dehradun|Mysore|Mysuru|Remote|Work from home)",
    re.IGNORECASE,
)

# ── Recency helper ───────────────────────────────────────

RECENCY_MAP = {
    "1d": timedelta(days=1),
    "2d": timedelta(days=2),
    "3d": timedelta(days=3),
    "1w": timedelta(days=7),
    "2w": timedelta(days=14),
    "1m": timedelta(days=30),
}


# ── Feed endpoint ─────────────────────────────────────────


@router.get("/feed")
def get_job_feed(
    category: str = Query("all"),
    search: str = Query(""),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    salary_min: int | None = Query(None),
    salary_max: int | None = Query(None),
    experience_min: int | None = Query(None),
    experience_max: int | None = Query(None),
    job_type: str | None = Query(None),
    location: str | None = Query(None),
    recency: str | None = Query(None),
    sort_by: str = Query("recency"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logger.info(
        "[feed] user=%s category=%s search=%s page=%d filters=[sal=%s-%s exp=%s-%s type=%s loc=%s rec=%s]",
        current_user.id[:8], category, search[:30] if search else "",
        page, salary_min, salary_max, experience_min, experience_max,
        job_type, location, recency,
    )

    query = db.query(Job)

    # Category filter
    if category and category != "all":
        query = query.filter(Job.role_category == category)

    # Text search
    if search:
        like = f"%{search}%"
        query = query.filter(
            (Job.title.ilike(like))
            | (Job.company.ilike(like))
            | (Job.location.ilike(like))
            | (Job.description.ilike(like))
        )

    # Salary range filter — exclude jobs with unknown salary when filtering
    if salary_min is not None or salary_max is not None:
        # At least one salary bound must be known to be included
        query = query.filter(
            Job.salary_min.isnot(None) | Job.salary_max.isnot(None)
        )
        if salary_min is not None:
            query = query.filter(
                (Job.salary_max >= salary_min) | (Job.salary_max.is_(None))
            )
        if salary_max is not None:
            query = query.filter(
                (Job.salary_min <= salary_max) | (Job.salary_min.is_(None))
            )

    # Experience range filter — exclude unknown experience when filtering
    if experience_min is not None or experience_max is not None:
        query = query.filter(
            Job.experience_min.isnot(None) | Job.experience_max.isnot(None)
        )
        if experience_min is not None:
            query = query.filter(
                (Job.experience_max >= experience_min) | (Job.experience_max.is_(None))
            )
        if experience_max is not None:
            query = query.filter(
                (Job.experience_min <= experience_max) | (Job.experience_min.is_(None))
            )

    # Job type filter (NULL treated as "full-time" for pre-migration jobs)
    if job_type:
        if job_type == "full-time":
            query = query.filter(
                (Job.job_type_enum == "full-time") | (Job.job_type_enum.is_(None))
            )
        else:
            query = query.filter(Job.job_type_enum == job_type)

    # Location filter
    if location:
        normalized = _normalize_city(location)
        if normalized:
            query = query.filter(Job.city == normalized)
        else:
            query = query.filter(Job.location.ilike(f"%{location}%"))

    # Recency filter
    if recency and recency in RECENCY_MAP:
        cutoff = (datetime.now(timezone.utc) - RECENCY_MAP[recency]).isoformat()
        query = query.filter(Job.scraped_at >= cutoff)

    total = query.count()
    jobs = (
        query.order_by(Job.scraped_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    # Get user's applied/saved jobs for status
    user_actions = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == current_user.id)
        .all()
    )
    applied_ids = {a.job_id for a in user_actions if a.status == "applied"}
    saved_ids = {a.job_id for a in user_actions if a.status == "saved"}

    # Get profile for match scoring
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )

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

    # Preference-based boosting: interleave high-match jobs
    if sort_by == "match":
        result.sort(key=lambda j: j["matchScore"], reverse=True)
    elif sort_by == "recency" and len(result) > 3:
        high_match = [j for j in result if j["matchScore"] >= 70]
        normal = [j for j in result if j["matchScore"] < 70]
        if high_match:
            merged = []
            hi_idx, lo_idx = 0, 0
            for i in range(len(result)):
                if i % 3 == 0 and hi_idx < len(high_match):
                    merged.append(high_match[hi_idx])
                    hi_idx += 1
                elif lo_idx < len(normal):
                    merged.append(normal[lo_idx])
                    lo_idx += 1
            merged.extend(high_match[hi_idx:])
            merged.extend(normal[lo_idx:])
            result = merged

    logger.info("[feed] Returning %d jobs (total=%d page=%d hasMore=%s)", len(result), total, page, page * limit < total)

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
        logger.info("[save] user=%s unsaved job=%s", current_user.id[:8], job_id[:8])
        return {"saved": False, "jobId": job_id}

    app = JobApplication(
        user_id=current_user.id,
        job_id=job_id,
        status="saved",
    )
    db.add(app)
    db.commit()
    logger.info("[save] user=%s saved job=%s", current_user.id[:8], job_id[:8])
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
        logger.info("[apply] user=%s already applied job=%s", current_user.id[:8], job_id[:8])
        return {"applied": True, "jobId": job_id, "message": "Already applied"}

    # Look up job for notification content
    job = db.query(Job).filter(Job.id == job_id).first()
    job_title = job.title if job else "a position"
    company_name = job.company if job else ""

    app = JobApplication(
        user_id=current_user.id,
        job_id=job_id,
        status="applied",
    )
    db.add(app)

    create_notification(
        db, "student", current_user.id, "job_applied",
        f"Application submitted: {job_title}",
        f"Your application to {company_name} has been recorded." if company_name else "Your application has been recorded.",
        "/dashboard/job-feed",
    )

    db.commit()
    logger.info("[apply] user=%s applied job=%s", current_user.id[:8], job_id[:8])
    return {"applied": True, "jobId": job_id}


# ── Scrape trigger (admin) ───────────────────────────────


@router.post("/scrape")
def trigger_scrape(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        logger.warning("[scrape] Non-admin user=%s attempted scrape", current_user.id[:8])
        raise HTTPException(status_code=403, detail="Admin only")

    if not FIRECRAWL_API_KEY:
        logger.error("[scrape] FIRECRAWL_API_KEY not configured")
        raise HTTPException(
            status_code=400, detail="FIRECRAWL_API_KEY not configured"
        )

    logger.info("[scrape] Admin trigger by user=%s", current_user.id[:8])
    return _run_scrape(db)


# ── Scrape trigger (cron / Cloud Scheduler) ──────────────


@router.post("/scrape/cron")
def trigger_scrape_cron(
    request: Request,
    db: Session = Depends(get_db),
):
    auth = request.headers.get("X-Cron-Secret", "")
    if not CRON_SECRET or auth != CRON_SECRET:
        logger.warning("[scrape/cron] Unauthorized cron attempt")
        raise HTTPException(status_code=403, detail="Unauthorized")

    if not FIRECRAWL_API_KEY:
        logger.error("[scrape/cron] FIRECRAWL_API_KEY not configured")
        raise HTTPException(
            status_code=400, detail="FIRECRAWL_API_KEY not configured"
        )

    logger.info("[scrape/cron] Cron trigger received")
    return _run_scrape(db)


# ── Shared scrape logic ──────────────────────────────────


def _run_scrape(db: Session) -> dict:
    batch_id = str(uuid.uuid4())
    total_added = 0
    total_skipped = 0
    errors = 0

    logger.info("[scrape] Starting scrape batch=%s categories=%d", batch_id, len(SCRAPE_QUERIES))

    for category, queries in SCRAPE_QUERIES.items():
        cat_added = 0
        for q in queries:
            try:
                results = _firecrawl_search(q)
                logger.info("[scrape] category=%s query=%s results=%d", category, q[:50], len(results))
                for result in results:
                    job = _process_scrape_result(result, category, batch_id, db)
                    if job:
                        db.add(job)
                        total_added += 1
                        cat_added += 1
                    else:
                        total_skipped += 1
                # Rate limiting between API calls
                time.sleep(1.5)
            except Exception as e:
                logger.error("[scrape] Error processing category=%s query=%s: %s", category, q[:50], str(e))
                errors += 1
                continue
        if cat_added > 0:
            logger.info("[scrape] category=%s added=%d jobs", category, cat_added)

    db.commit()
    logger.info(
        "[scrape] Batch complete batch=%s added=%d skipped=%d errors=%d",
        batch_id, total_added, total_skipped, errors,
    )
    return {"message": f"Scrape complete. {total_added} new jobs added.", "batch_id": batch_id}


def _firecrawl_search(query: str, retries: int = 1) -> list[dict]:
    """Call Firecrawl search API with retry on failure."""
    for attempt in range(retries + 1):
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
                timeout=15.0,
            )
            if resp.status_code == 429:
                logger.warning("[firecrawl] Rate limited (429) query=%s attempt=%d", query[:50], attempt + 1)
                if attempt < retries:
                    time.sleep(3.0)
                    continue
                return []
            if resp.status_code != 200:
                logger.warning("[firecrawl] Non-200 status=%d query=%s", resp.status_code, query[:50])
                return []
            data = resp.json()
            return data.get("data", [])
        except httpx.TimeoutException:
            logger.warning("[firecrawl] Timeout query=%s attempt=%d", query[:50], attempt + 1)
            if attempt < retries:
                time.sleep(3.0)
                continue
            return []
        except Exception as e:
            logger.error("[firecrawl] Unexpected error query=%s: %s", query[:50], str(e))
            if attempt < retries:
                time.sleep(3.0)
                continue
            return []
    return []


def _clean_description(raw: str) -> str:
    """Strip navigation junk, markdown syntax, URLs, and site chrome from scraped content."""
    import re

    text = raw

    # Remove markdown images
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    # Convert markdown links to just their text
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    # Remove raw URLs
    text = re.sub(r"https?://[^\s)\"']+", "", text)
    # Remove markdown headers
    text = re.sub(r"#{1,6}\s*", "", text)
    # Remove markdown bold/italic markers
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)

    # Remove common site navigation / chrome text
    nav_patterns = [
        r"Skip to (?:content|main|navigation)",
        r"Sort by\s*(?:Relevance|Date|Distance)\s*",
        r"Refine Your Search",
        r"(?:Show|View)\s+(?:more|less|all|details)",
        r"Quick apply\s*\d*[hd]?",
        r"Apply now",
        r"Login|Log in|Register|Sign up|Sign in",
        r"For employers",
        r"Buy online",
        r"Employer Login",
        r"Jobseeker (?:Login|Register)",
        r"All Filters",
        r"Posted by\s*(?:Company|Consultant)\s*Jobs?\s*\d*",
        r"Freshness\s*Select",
        r"Last \d+ days?",
        r"View More\s*\w*",
        r"Date Added\s*[-–]\s*(?:Anytime|24 hours|7 days|14 days|30 days)",
        r"Job Type\s*[-–]\s*All Job Types",
        r"Minimum Salary\s*[-–]\s*All salaries",
        r"(?:Sort & )?Filter",
        r"Naukri (?:Talent Cloud|Logo)",
        r"Hiring solutions?",
        r"\d+\s*[-–]\s*\d+\s*of\s*\d+",
        r"Page\s*\d+",
        r"Company type\s*\w+",
        r"Work mode\s*\w+",
        r"Top companies\s*\w*",
        r"Industry\s+\w[\w\s&]*\d+",
        r"Role category\s+\w[\w\s&]*\d+",
        r"Education\s+Any\s+\w+",
        r"Department\s+\w[\w\s&,]*\d+",
        r"Location\s+\w[\w\s/]*\d+",
        r"Experience\s+Any\s+\d+\s*Yrs?",
        r"Any Salary\s*[\d\s\-LakhsCrores]+",
        r"Distance\s*\d+\s*kilometers?",
        r"Stipend\s+\w+\d+",
        r"Duration\s+\d+\s*Months?\d*",
        r"Freshers?\s*OK",
        r"Urgent Hiring",
        r"Base64-Image-Removed",
        r"transparentImg\.png",
        r"checkmark",
        r"addFilter\.svg",
        r"search-job-icon\.svg",
        r"dummy-job-logo\.svg",
        r"whiteCallIcon\.svg",
        r"chevron-down\.png",
        r"Expand job summary",
        r"company-logo",
        r"filter",
    ]
    for pat in nav_patterns:
        text = re.sub(pat, " ", text, flags=re.IGNORECASE)

    # Remove leftover markdown/html brackets
    text = re.sub(r"[<>[\]()]", " ", text)
    # Remove stray pipe separators
    text = re.sub(r"\s*\|\s*", " ", text)
    # Remove stray dashes used as separators
    text = re.sub(r"\s+[-–—]{2,}\s+", " ", text)
    # Collapse multiple spaces/newlines
    text = re.sub(r"\s+", " ", text).strip()

    # If still too long after cleaning, take first 500 chars
    if len(text) > 500:
        text = text[:500].rsplit(" ", 1)[0] + "..."

    return text


def _process_scrape_result(
    result: dict, category: str, batch_id: str, db: Session
) -> Job | None:
    """Parse a single Firecrawl result into a Job, or None if duplicate/invalid."""
    url = result.get("url", "")
    title = result.get("title", "")
    content = result.get("markdown", "") or result.get("description", "")

    if not url or not title:
        return None

    # Skip very short titles (likely not real job postings)
    if len(title.strip()) < 10:
        return None

    # Skip non-job pages (blogs, salary guides, forum threads)
    skip_keywords = [
        "salary guide", "salary trends", "career advice", "how to",
        "top 10", "best companies", "interview tips", "resume tips",
        "glassdoor review", "company review", "about us", "privacy policy",
        "terms of service", "cookie policy", "sign up", "log in",
    ]
    title_lower = title.lower()
    if any(kw in title_lower for kw in skip_keywords):
        return None

    # Skip if content is too short to be a real job posting
    if len(content.strip()) < 50:
        return None

    # Deduplicate by title + source_url
    existing = (
        db.query(Job)
        .filter(Job.title == title[:200], Job.source_url == url[:500])
        .first()
    )
    if existing:
        return None

    # Also dedup by title + company (catches same job across platforms)
    company = _extract_company(title, content)
    if company and company != "Company":
        existing2 = (
            db.query(Job)
            .filter(Job.title == title[:200], Job.company == company[:200])
            .first()
        )
        if existing2:
            return None

    # Extract display fields (company already extracted above for dedup)
    if not company or company == "Company":
        company = _extract_company(title, content)
    salary_text = _extract_salary(content)
    exp_text = _extract_experience(content)
    location_text = _extract_location(content)
    detected_type = _detect_job_type(title, content)

    # Parse numeric fields for filtering
    sal_min, sal_max = _parse_salary_range(salary_text)
    exp_min, exp_max = _parse_experience_range(exp_text)
    city = _normalize_city(location_text)
    state = CITY_TO_STATE.get(city, "") if city else ""

    return Job(
        title=title[:200],
        company=company,
        location=location_text,
        salary=salary_text,
        job_type=detected_type.replace("-", " ").title() if detected_type else "Full-time",
        experience=exp_text,
        description=_clean_description(content),
        requirements_json=json.dumps(_extract_requirements(content)),
        tags_json=json.dumps(_extract_tags(title, content)),
        role_category=category,
        source_url=url[:500],
        source_name=_extract_source(url),
        apply_link=url[:500],
        posted_at=datetime.now(timezone.utc).isoformat(),
        # New filterable columns
        salary_min=sal_min,
        salary_max=sal_max,
        experience_min=exp_min,
        experience_max=exp_max,
        job_type_enum=detected_type,
        is_remote=1 if detected_type == "wfh" else 0,
        city=city,
        state=state,
        scrape_batch_id=batch_id,
    )


# ── Match scoring ────────────────────────────────────────


def compute_match_score(job: Job, profile: UserProfile | None) -> int:
    if not profile:
        return 0

    score = 0
    text = f"{job.title or ''} {job.description or ''}"
    text_lower = text.lower()

    # Location match (30) — use normalized city for better matching
    job_city = (job.city or "").lower()
    job_location = (job.location or "").lower()
    profile_city = (profile.city or "").lower()
    profile_state = (profile.state or "").lower()

    if profile_city and (profile_city in job_city or profile_city in job_location):
        score += 30
    elif profile_state and (
        profile_state in (job.state or "").lower() or profile_state in job_location
    ):
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


# ── Parsing helpers (numeric, for filter columns) ────────


def _parse_salary_range(text: str) -> tuple[int | None, int | None]:
    """Parse salary text into (min, max) in INR per month."""
    if not text:
        return None, None

    text_lower = text.lower()

    # Check if LPA (per annum) — convert to monthly
    is_annual = any(kw in text_lower for kw in ["lpa", "l.p.a", "per annum", "p.a.", "lakhs per"])

    # Extract all numbers
    numbers = re.findall(r"[\d,]+\.?\d*", text.replace(",", ""))
    nums = []
    for n in numbers:
        try:
            val = float(n)
            if val > 0:
                nums.append(val)
        except ValueError:
            continue

    if not nums:
        return None, None

    # Filter out unreasonable numbers (likely not salary)
    nums = [n for n in nums if 100 <= n <= 10000000]
    if not nums:
        return None, None

    if is_annual:
        # LPA values are typically 1-50
        lpa_nums = [n for n in nums if n <= 100]
        if lpa_nums:
            sal_min = int(min(lpa_nums) * 100000 / 12)
            sal_max = int(max(lpa_nums) * 100000 / 12)
            return sal_min, sal_max
        return None, None

    sal_min = int(min(nums))
    sal_max = int(max(nums))

    # If numbers look like annual (> 100000), convert to monthly
    if sal_min > 100000:
        sal_min = sal_min // 12
        sal_max = sal_max // 12

    return sal_min, sal_max


def _parse_experience_range(text: str) -> tuple[int | None, int | None]:
    """Parse experience text into (min_years, max_years)."""
    if not text:
        return None, None

    text_lower = text.lower()

    if "fresher" in text_lower or "no experience" in text_lower:
        return 0, 0

    # Match patterns like "0-2 years", "1 - 3 yrs"
    m = re.search(r"(\d+)\s*[-–to]+\s*(\d+)", text)
    if m:
        return int(m.group(1)), int(m.group(2))

    # Single number like "2 years"
    m = re.search(r"(\d+)\s*(?:years?|yrs?)", text, re.IGNORECASE)
    if m:
        val = int(m.group(1))
        return val, val

    return None, None


def _detect_job_type(title: str, content: str) -> str:
    """Detect job type from title and content."""
    text = f"{title} {content}".lower()
    if any(kw in text for kw in ["work from home", "wfh", "remote", "work-from-home"]):
        return "wfh"
    if any(kw in text for kw in ["part time", "part-time"]):
        return "part-time"
    if any(kw in text for kw in ["internship", "intern "]):
        return "internship"
    if any(kw in text for kw in ["contract", "contractual", "freelance"]):
        return "contract"
    return "full-time"


def _normalize_city(location_text: str) -> str | None:
    """Normalize a location string to a canonical city name."""
    if not location_text:
        return None
    for word in location_text.lower().split():
        word = word.strip(",;/|")
        if word in CITY_ALIASES:
            return CITY_ALIASES[word]
    # Try multi-word matches
    text_lower = location_text.lower()
    for alias, canonical in CITY_ALIASES.items():
        if alias in text_lower:
            return canonical
    return None


# ── Extraction helpers (for scraping) ────────────────────


def _extract_company(title: str, content: str) -> str:
    patterns = [
        r"(?:Company|Employer)\s*[:\-]\s*(.+?)[\n\r]",
        r"(?:at|@)\s+([A-Z][A-Za-z\s&.]+?)(?:\s*[-|,]|\n)",
    ]
    for p in patterns:
        m = re.search(p, content, re.IGNORECASE) or re.search(
            p, title, re.IGNORECASE
        )
        if m:
            return m.group(1).strip()[:200]
    return "Company"


def _extract_location(content: str) -> str:
    m = re.search(
        r"(?:Location|City)\s*[:\-]\s*(.+?)[\n\r]", content, re.IGNORECASE
    )
    if m:
        return m.group(1).strip()[:200]
    m = ALL_CITIES_PATTERN.search(content)
    return m.group(0).strip() if m else "India"


def _extract_salary(content: str) -> str:
    m = re.search(
        r"(?:Salary|CTC|Package)\s*[:\-]\s*(.+?)[\n\r]", content, re.IGNORECASE
    )
    if m:
        return m.group(1).strip()[:100]
    m = re.search(
        r"(?:Rs\.?|INR|₹)\s*[\d,.]+\s*[-–to]+\s*(?:Rs\.?|INR|₹)?\s*[\d,.]+",
        content,
    )
    return m.group(0).strip()[:100] if m else ""


def _extract_experience(content: str) -> str:
    m = re.search(
        r"(?:Experience|Exp)\s*[:\-]\s*(.+?)[\n\r]", content, re.IGNORECASE
    )
    if m:
        return m.group(1).strip()[:100]
    m = re.search(
        r"(\d+\s*[-–to]+\s*\d+\s*(?:years?|yrs?))", content, re.IGNORECASE
    )
    if m:
        return m.group(0).strip()
    m = re.search(
        r"(Fresher|0\s*[-–]\s*\d+\s*(?:years?|yrs?))", content, re.IGNORECASE
    )
    return m.group(0).strip() if m else ""


def _extract_requirements(content: str) -> list[str]:
    reqs = []
    section = re.search(
        r"(?:Requirements?|Qualifications?|Eligibility)\s*[:\s]*\n([\s\S]*?)(?:\n\n|\n(?=[A-Z]))",
        content,
        re.IGNORECASE,
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
        "fresher": "Freshers OK",
        "walk-in": "Walk-in",
        "work from home": "WFH Option",
        "wfh": "WFH Option",
        "remote": "Remote",
        "immediate joining": "Immediate Joining",
        "night shift": "Night Shift",
        "incentive": "Incentives",
        "urgent": "Urgent Hiring",
        "part time": "Part-time",
        "part-time": "Part-time",
        "internship": "Internship",
        "no experience": "No Exp Required",
        "cab facility": "Cab Facility",
    }
    for kw, tag in keywords.items():
        if kw in text and tag not in tags:
            tags.append(tag)
    return tags[:5]


def _extract_source(url: str) -> str:
    try:
        host = urlparse(url).hostname or ""
        if "naukri" in host:
            return "Naukri"
        if "indeed" in host:
            return "Indeed"
        if "linkedin" in host:
            return "LinkedIn"
        if "shine" in host:
            return "Shine"
        if "monster" in host:
            return "Monster India"
        if "freshersworld" in host:
            return "FreshersWorld"
        if "timesjobs" in host:
            return "TimesJobs"
        if "quikr" in host:
            return "QuikrJobs"
        if "workindia" in host:
            return "WorkIndia"
        if "apna" in host:
            return "Apna"
        return host.replace("www.", "").split(".")[0].capitalize()
    except Exception:
        return "Web"

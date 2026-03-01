import json
import re
from app.services.claude_service import get_chat_response

# ─── Action Verb Set ────────────────────────────────────────

STRONG_ACTION_VERBS = {
    "led", "managed", "developed", "designed", "implemented", "created",
    "built", "launched", "achieved", "increased", "decreased", "improved",
    "delivered", "drove", "spearheaded", "orchestrated", "optimized",
    "streamlined", "established", "negotiated", "coordinated", "mentored",
    "pioneered", "resolved", "transformed", "generated", "automated",
    "analyzed", "engineered", "architected", "directed", "supervised",
    "collaborated", "initiated", "executed", "secured", "published",
    "presented", "facilitated", "championed", "integrated", "maintained",
}

GRADE_MAP = {"A": 1.0, "B": 0.75, "C": 0.50, "D": 0.25, "E": 0.0}


# ─── Deterministic Scoring (40 pts) ────────────────────────

def _deterministic_score(data: dict) -> dict:
    scores = {}

    # 1. Contact info (0-5)
    pi = data.get("personal_info", {})
    contact_fields = ["name", "email", "phone", "location"]
    present = sum(1 for f in contact_fields if pi.get(f))
    has_link = any(pi.get(k) for k in ["linkedin", "portfolio", "github"])
    contact_score = min(5, round((present / 4) * 4 + (1 if has_link else 0)))
    missing = [f for f in contact_fields if not pi.get(f)]
    if missing:
        contact_tip = f"Add missing: {', '.join(missing)}"
    elif not has_link:
        contact_tip = "Add a LinkedIn or portfolio link"
    else:
        contact_tip = "All contact information present"
    scores["contact_info"] = {"score": contact_score, "max": 5, "tip": contact_tip}

    # 2. Section completeness (0-10)
    sections = {
        "objective": data.get("objective", ""),
        "education": data.get("education", []),
        "experience": data.get("experience", []),
        "projects": data.get("projects", []),
        "skills": data.get("skills", {}),
        "achievements": data.get("achievements", []),
        "certifications": data.get("certifications", []),
    }
    filled = 0
    for val in sections.values():
        if isinstance(val, str) and val.strip():
            filled += 1
        elif isinstance(val, list) and len(val) > 0:
            filled += 1
        elif isinstance(val, dict) and any(val.get(k) for k in val):
            filled += 1
    section_score = min(10, round((filled / 7) * 10))
    missing_sections = [
        k for k, v in sections.items()
        if (isinstance(v, str) and not v.strip())
        or (isinstance(v, list) and len(v) == 0)
        or (isinstance(v, dict) and not any(v.get(sk) for sk in v))
    ]
    section_tip = (
        f"Add: {', '.join(missing_sections[:3])}"
        if missing_sections
        else "All key sections present"
    )
    scores["section_completeness"] = {"score": section_score, "max": 10, "tip": section_tip}

    # 3. Skills density (0-5)
    skills = data.get("skills", {})
    all_skills = []
    for category in ["technical", "soft", "languages", "tools"]:
        all_skills.extend(skills.get(category, []))
    skill_count = len(all_skills)
    skills_score = min(5, round(min(skill_count / 8, 1.0) * 5))
    if skill_count < 5:
        skills_tip = f"Add {5 - skill_count} more skills for better ATS matching"
    elif skill_count < 8:
        skills_tip = "Good skill count. Consider adding more domain-specific skills"
    else:
        skills_tip = "Excellent skills density for ATS matching"
    scores["skills_density"] = {"score": skills_score, "max": 5, "tip": skills_tip}

    # 4. Action verbs (0-5)
    all_bullets = []
    for exp in data.get("experience", []):
        all_bullets.extend(exp.get("bullets", []))
    for proj in data.get("projects", []):
        all_bullets.extend(proj.get("bullets", []))
    if all_bullets:
        action_count = sum(
            1 for b in all_bullets
            if b.strip() and b.strip().split()[0].lower().rstrip("ed,s") in STRONG_ACTION_VERBS
            or (b.strip() and b.strip().split()[0].lower() in STRONG_ACTION_VERBS)
        )
        action_ratio = action_count / len(all_bullets)
        action_score = min(5, round(action_ratio * 5))
    else:
        action_score = 0
    if action_score >= 4:
        action_tip = "Excellent use of action verbs"
    elif all_bullets:
        action_tip = "Start more bullets with: Led, Developed, Achieved, Implemented"
    else:
        action_tip = "Add experience/project bullets starting with action verbs"
    scores["action_verbs"] = {"score": action_score, "max": 5, "tip": action_tip}

    # 5. Quantified achievements (0-5)
    quant_pattern = re.compile(r"\d+[%+]?|\$\d|\b\d{2,}\b")
    if all_bullets:
        quant_count = sum(1 for b in all_bullets if quant_pattern.search(b))
        quant_ratio = quant_count / len(all_bullets)
        quant_score = min(5, round(quant_ratio * 6))
    else:
        quant_score = 0
    if quant_score >= 4:
        quant_tip = "Great use of quantified metrics"
    elif all_bullets:
        quant_tip = "Add numbers and percentages to more bullet points"
    else:
        quant_tip = "Include measurable achievements (e.g., 'increased efficiency by 30%')"
    scores["quantified_achievements"] = {"score": quant_score, "max": 5, "tip": quant_tip}

    # 6. Content length (0-5)
    full_text = json.dumps(data)
    word_count = len(full_text.split())
    if word_count < 150:
        length_score, length_tip = 1, "Resume is too short. Add more detail"
    elif word_count < 300:
        length_score, length_tip = 3, "Could be more detailed. Add more bullet points"
    elif word_count <= 800:
        length_score, length_tip = 5, "Content length is ideal for ATS"
    else:
        length_score, length_tip = 4, "Consider trimming for conciseness"
    scores["content_length"] = {"score": length_score, "max": 5, "tip": length_tip}

    # 7. Formatting quality (0-5)
    fmt_score = 5
    fmt_issues = []
    for exp in data.get("experience", []):
        if not exp.get("bullets"):
            fmt_score -= 1
            fmt_issues.append("experience entries missing bullets")
            break
    for proj in data.get("projects", []):
        if not proj.get("bullets") and not proj.get("description"):
            fmt_score -= 1
            fmt_issues.append("projects missing descriptions")
            break
    if not data.get("objective"):
        fmt_score -= 1
        fmt_issues.append("missing career objective")
    for edu in data.get("education", []):
        if not edu.get("grade"):
            fmt_score -= 1
            fmt_issues.append("education missing grade/CGPA")
            break
    fmt_score = max(0, fmt_score)
    fmt_tip = "Fix: " + "; ".join(fmt_issues[:2]) if fmt_issues else "Well-structured format"
    scores["formatting"] = {"score": fmt_score, "max": 5, "tip": fmt_tip}

    total = sum(v["score"] for v in scores.values())
    return {"categories": scores, "total": total, "max_total": 40}


# ─── Claude Semantic Scoring (60 pts) ──────────────────────

ATS_SCORING_PROMPT = """You are an expert ATS (Applicant Tracking System) resume analyzer. Score the resume against the candidate's stated career objective.

Grade each dimension A through E:
- A = Excellent (90-100% match)
- B = Good (70-89%)
- C = Average (50-69%)
- D = Below Average (25-49%)
- E = Poor (0-24%)

Categories:
1. hard_skills (weight: 20pts) - Technical/hard skills match for the target role
2. soft_skills (weight: 5pts) - Relevant soft skills presence
3. experience_relevance (weight: 15pts) - Work experience/projects relevance. For freshers, evaluate projects.
4. job_title_alignment (weight: 5pts) - Resume profile alignment with career objective
5. content_quality (weight: 10pts) - Clear, impactful descriptions with specific results
6. action_language (weight: 5pts) - Strong professional language, highlighted achievements

Also provide:
- matched_keywords: 5-10 strong keywords found that match the target role
- missing_keywords: 3-7 important keywords to add
- top_suggestions: 3-5 specific, actionable improvement tips

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "grades": {
    "hard_skills": "A",
    "soft_skills": "B",
    "experience_relevance": "C",
    "job_title_alignment": "B",
    "content_quality": "B",
    "action_language": "A"
  },
  "matched_keywords": ["Python", "Machine Learning"],
  "missing_keywords": ["Docker", "CI/CD"],
  "top_suggestions": ["Add metrics to internship bullets", "Include Docker skills"]
}"""

SEMANTIC_WEIGHTS = {
    "hard_skills": 20,
    "soft_skills": 5,
    "experience_relevance": 15,
    "job_title_alignment": 5,
    "content_quality": 10,
    "action_language": 5,
}

SEMANTIC_LABELS = {
    "hard_skills": "Hard Skills Match",
    "soft_skills": "Soft Skills",
    "experience_relevance": "Experience Relevance",
    "job_title_alignment": "Job Title Alignment",
    "content_quality": "Content Quality",
    "action_language": "Action Language",
}


def _grade_to_score(grade: str, max_pts: int) -> int:
    return round(GRADE_MAP.get(grade.upper().strip(), 0.5) * max_pts)


async def _semantic_score(resume_json: str, objective: str) -> dict:
    user_message = (
        f"## Career Objective / Target Role\n"
        f"{objective if objective else 'General fresher role - no specific objective stated'}\n\n"
        f"## Resume Data (JSON)\n{resume_json}"
    )

    try:
        response_text = await get_chat_response(
            system_prompt=ATS_SCORING_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )

        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
            cleaned = re.sub(r"\n?```$", "", cleaned)

        result = json.loads(cleaned)
        grades = result.get("grades", {})

        categories = {}
        total = 0
        for key, max_pts in SEMANTIC_WEIGHTS.items():
            grade = grades.get(key, "C")
            pts = _grade_to_score(grade, max_pts)
            total += pts
            categories[key] = {
                "label": SEMANTIC_LABELS.get(key, key),
                "grade": grade,
                "score": pts,
                "max": max_pts,
            }

        return {
            "categories": categories,
            "total": total,
            "max_total": 60,
            "matched_keywords": result.get("matched_keywords", []),
            "missing_keywords": result.get("missing_keywords", []),
            "top_suggestions": result.get("top_suggestions", []),
        }

    except Exception:
        # Fallback: middle-of-road scores
        categories = {}
        total = 0
        for key, max_pts in SEMANTIC_WEIGHTS.items():
            pts = _grade_to_score("C", max_pts)
            total += pts
            categories[key] = {
                "label": SEMANTIC_LABELS.get(key, key),
                "grade": "C",
                "score": pts,
                "max": max_pts,
            }
        return {
            "categories": categories,
            "total": total,
            "max_total": 60,
            "matched_keywords": [],
            "missing_keywords": [],
            "top_suggestions": ["Could not analyze in detail. Please try again."],
        }


# ─── Combined Score ─────────────────────────────────────────

DET_LABELS = {
    "contact_info": "Contact Info",
    "section_completeness": "Section Structure",
    "skills_density": "Skills Density",
    "action_verbs": "Action Verbs",
    "quantified_achievements": "Quantified Achievements",
    "content_length": "Content Length",
    "formatting": "Formatting",
}


async def compute_ats_score(resume_json: str) -> dict:
    data = json.loads(resume_json)
    objective = data.get("objective", "")

    det_result = _deterministic_score(data)
    sem_result = await _semantic_score(resume_json, objective)

    total_score = det_result["total"] + sem_result["total"]

    all_categories = []

    for key, cat in det_result["categories"].items():
        pct = round((cat["score"] / cat["max"]) * 100) if cat["max"] > 0 else 0
        all_categories.append({
            "key": key,
            "label": DET_LABELS.get(key, key),
            "score": cat["score"],
            "max": cat["max"],
            "percentage": pct,
            "tip": cat["tip"],
            "type": "deterministic",
        })

    for key, cat in sem_result["categories"].items():
        pct = round((cat["score"] / cat["max"]) * 100) if cat["max"] > 0 else 0
        all_categories.append({
            "key": key,
            "label": cat["label"],
            "score": cat["score"],
            "max": cat["max"],
            "percentage": pct,
            "grade": cat["grade"],
            "type": "semantic",
        })

    return {
        "total_score": total_score,
        "max_score": 100,
        "deterministic_total": det_result["total"],
        "semantic_total": sem_result["total"],
        "categories": all_categories,
        "matched_keywords": sem_result["matched_keywords"],
        "missing_keywords": sem_result["missing_keywords"],
        "suggestions": sem_result["top_suggestions"],
    }

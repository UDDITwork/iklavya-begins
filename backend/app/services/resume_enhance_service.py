"""AI-powered resume content enhancement for PDF generation.

When resume content is too sparse to fill a professional A4 page,
Claude expands bullet points, adds metrics, and strengthens language
while keeping all facts accurate.
"""

import json
import re
import logging
from app.services.claude_service import get_chat_response

logger = logging.getLogger(__name__)

MINIMUM_WORDS = 300


def _count_resume_words(data: dict) -> int:
    """Count total content words across all resume sections."""
    words = 0
    if data.get("objective"):
        words += len(str(data["objective"]).split())
    for edu in data.get("education", []):
        words += len(str(edu.get("degree", "")).split())
        words += len(str(edu.get("institution", "")).split())
    for exp in data.get("experience", []):
        words += len(str(exp.get("title", "")).split())
        for b in exp.get("bullets", []):
            words += len(str(b).split())
    for proj in data.get("projects", []):
        if proj.get("description"):
            words += len(str(proj["description"]).split())
        for b in proj.get("bullets", []):
            words += len(str(b).split())
    for sk_list in data.get("skills", {}).values():
        if isinstance(sk_list, list):
            words += len(sk_list)
    for a in data.get("achievements", []):
        words += len(str(a).split())
    for c in data.get("certifications", []):
        words += len(str(c.get("name", "")).split())
    return words


async def enhance_resume_for_pdf(data: dict) -> dict:
    """Enhance sparse resume content using AI before PDF generation.

    If the resume has fewer than MINIMUM_WORDS words, Claude is called
    to expand content while keeping facts accurate. On any failure,
    returns the original data unchanged.
    """
    word_count = _count_resume_words(data)
    if word_count >= MINIMUM_WORDS:
        return data

    logger.info(f"Resume has {word_count} words (< {MINIMUM_WORDS}) — enhancing with AI")

    try:
        system = (
            "You are an expert resume writer and ATS optimization specialist. "
            "Enhance this resume to be more professional and detailed. "
            "CRITICAL RULES:\n"
            "1. Keep the SAME facts — do NOT invent new companies, roles, degrees, or experiences.\n"
            "2. Expand short bullet points: add quantifiable metrics (%, numbers, timeframes), "
            "strong action verbs (Led, Developed, Implemented, Achieved), and specific outcomes.\n"
            "3. If the objective/summary is too short, expand to 2-3 impactful sentences.\n"
            "4. If skills list has fewer than 6 items per category, add 3-5 more relevant skills "
            "based on the person's experience and role.\n"
            "5. If achievements are missing or have fewer than 2 items, derive 2-3 achievements "
            "from the experience bullets.\n"
            "6. If certifications section is empty, leave it empty — do NOT invent certifications.\n"
            "7. Output ONLY valid JSON. No markdown fences. No explanation. Just the JSON object.\n"
            "8. The output JSON must have the EXACT same structure and field names as the input."
        )

        user_msg = (
            f"This resume has only {word_count} words — too sparse for a professional resume. "
            f"Expand it to approximately 400-500 words while keeping all facts accurate. "
            f"Make every bullet point impactful with metrics and action verbs.\n\n"
            f"{json.dumps(data, indent=2)}"
        )

        response = await get_chat_response(
            system_prompt=system,
            messages=[{"role": "user", "content": user_msg}],
        )

        # Clean response — strip markdown fences if present
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
            cleaned = re.sub(r'\s*```$', '', cleaned)

        # Find JSON object start
        brace = cleaned.find('{')
        if brace > 0:
            cleaned = cleaned[brace:]

        # Find matching closing brace
        depth = 0
        end_idx = -1
        for i, ch in enumerate(cleaned):
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    end_idx = i
                    break
        if end_idx > 0:
            cleaned = cleaned[:end_idx + 1]

        enhanced = json.loads(cleaned)

        # Validate structure — must have personal_info at minimum
        if "personal_info" not in enhanced:
            logger.warning("AI enhancement missing personal_info — using original")
            return data

        new_count = _count_resume_words(enhanced)
        logger.info(f"Resume enhanced: {word_count} → {new_count} words")
        return enhanced

    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"AI enhancement JSON parse failed: {e}")
        return data
    except Exception as e:
        logger.warning(f"AI enhancement failed: {e}")
        return data

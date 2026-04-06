import re
import json
import asyncio
import logging

from app.services.claude_service import stream_chat_response, get_chat_response
from app.prompts import build_interview_system_prompt, build_interview_analysis_prompt

logger = logging.getLogger(__name__)

REPORT_MAX_RETRIES = 3

FILLER_WORDS = [
    "um", "uh", "hmm", "like", "you know", "basically",
    "actually", "so", "right", "i mean", "sort of", "kind of",
    "well", "okay so", "literally",
]

FILLER_PATTERN = re.compile(
    r'\b(' + '|'.join(re.escape(w) for w in FILLER_WORDS) + r')\b',
    re.IGNORECASE,
)


def detect_fillers(text: str) -> list[dict]:
    """Detect filler words in text and return counts."""
    counts: dict[str, int] = {}
    for match in FILLER_PATTERN.finditer(text):
        word = match.group().lower()
        counts[word] = counts.get(word, 0) + 1
    return [{"word": w, "count": c} for w, c in sorted(counts.items(), key=lambda x: -x[1])]


def extract_interview_meta(text: str) -> dict | None:
    """Extract <interview_meta> JSON from AI response."""
    match = re.search(r'<interview_meta>(.*?)</interview_meta>', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except (json.JSONDecodeError, ValueError):
            pass
    return None


def check_interview_complete(text: str) -> bool:
    """Check if AI signaled interview is complete."""
    match = re.search(r'<interview_complete>\s*true\s*</interview_complete>', text, re.IGNORECASE)
    return bool(match)


def clean_interview_response(text: str) -> str:
    """Remove metadata tags from interviewer response before storing."""
    text = re.sub(r'<interview_meta>.*?</interview_meta>', '', text, flags=re.DOTALL)
    text = re.sub(r'<interview_complete>.*?</interview_complete>', '', text, flags=re.DOTALL)
    return text.strip()


async def stream_interview_question(system_prompt: str, messages: list[dict]):
    """Stream the AI interviewer's next question."""
    async for chunk in stream_chat_response(system_prompt, messages):
        yield chunk


def _extract_json_from_response(text: str) -> dict:
    """Robustly extract JSON from Claude's response, handling markdown fences and preamble."""
    cleaned = text.strip()

    # Strip markdown code fences
    if "```" in cleaned:
        match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\})\s*```', cleaned)
        if match:
            cleaned = match.group(1)
        else:
            cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
            cleaned = re.sub(r'\s*```$', '', cleaned)

    # If response has preamble text before JSON, find the first {
    brace_start = cleaned.find('{')
    if brace_start > 0:
        cleaned = cleaned[brace_start:]

    # Find matching closing brace (handle nested braces)
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

    return json.loads(cleaned)


def _validate_report(data: dict) -> dict:
    """Ensure the report has all required top-level fields with safe defaults."""
    defaults = {
        "overall_score": 50,
        "verdict": "needs_practice",
        "verdict_label": "Needs More Practice",
        "verdict_description": "Report generated with partial data.",
        "scores": {
            "confidence": 50, "clarity": 50, "structure": 50,
            "persuasiveness": 50, "pace": 50, "domain_knowledge": 50,
        },
        "filler_analysis": {"total_fillers": 0, "fillers_per_minute": 0, "breakdown": []},
        "communication_metrics": {
            "avg_answer_length_words": 0, "vocabulary_richness": "unknown",
            "stammering_frequency": "unknown", "stammering_details": "",
        },
        "question_breakdown": [],
        "improvement_plan": [],
    }
    for key, default in defaults.items():
        if key not in data:
            data[key] = default
        elif isinstance(default, dict) and isinstance(data[key], dict):
            for sub_key, sub_default in default.items():
                if sub_key not in data[key]:
                    data[key][sub_key] = sub_default

    # Clamp score to 0-100
    score = data.get("overall_score", 50)
    if not isinstance(score, (int, float)):
        score = 50
    data["overall_score"] = max(0, min(100, int(score)))

    return data


async def generate_interview_report(job_role: str, messages: list[dict]) -> dict:
    """Generate the full interview analysis report with retry logic.

    Retries up to REPORT_MAX_RETRIES times on JSON parse failures.
    Returns parsed and validated JSON report dict.
    """
    # Build transcript text from messages
    transcript_lines = []
    for msg in messages:
        role_label = "Interviewer" if msg["role"] == "interviewer" else "Candidate"
        transcript_lines.append(f"{role_label}: {msg['content']}")
    transcript_text = "\n\n".join(transcript_lines)

    analysis_prompt = build_interview_analysis_prompt(job_role, transcript_text)

    last_error = None
    for attempt in range(REPORT_MAX_RETRIES):
        try:
            response = await get_chat_response(
                system_prompt="You are an expert interview analyst. Output only valid JSON. No markdown, no explanation, just the JSON object.",
                messages=[{"role": "user", "content": analysis_prompt}],
            )

            report_data = _extract_json_from_response(response)
            report_data = _validate_report(report_data)

            logger.info(f"Interview report generated on attempt {attempt + 1}")
            return report_data

        except (json.JSONDecodeError, ValueError) as e:
            last_error = e
            logger.warning(f"Report JSON parse failed (attempt {attempt + 1}/{REPORT_MAX_RETRIES}): {e}")
            if attempt < REPORT_MAX_RETRIES - 1:
                await asyncio.sleep(1)  # Brief pause before retry

    # All retries exhausted — raise the last error
    raise ValueError(f"Failed to generate valid report after {REPORT_MAX_RETRIES} attempts: {last_error}")

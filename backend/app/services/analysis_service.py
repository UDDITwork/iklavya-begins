import json
import re
import anthropic

from app.config import ANTHROPIC_API_KEY
from app.prompts import SESSION_SUMMARY_PROMPT

client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

MODEL = "claude-sonnet-4-20250514"


def extract_analysis(response_text: str) -> dict | None:
    """Parse analysis, markdown, and roadmap from Claude's response using XML tags.

    Returns dict with keys: analysis_json, analysis_markdown, roadmap_json
    or None if no analysis tags found.
    Validates JSON fields before returning.
    """
    analysis_json_match = re.search(
        r"<analysis_json>\s*(.*?)\s*</analysis_json>",
        response_text,
        re.DOTALL,
    )
    analysis_md_match = re.search(
        r"<analysis_markdown>\s*(.*?)\s*</analysis_markdown>",
        response_text,
        re.DOTALL,
    )
    roadmap_match = re.search(
        r"<roadmap_json>\s*(.*?)\s*</roadmap_json>",
        response_text,
        re.DOTALL,
    )

    if not analysis_json_match and not analysis_md_match:
        return None

    # Validate JSON fields
    analysis_json_str = None
    if analysis_json_match:
        raw = analysis_json_match.group(1).strip()
        try:
            json.loads(raw)
            analysis_json_str = raw
        except json.JSONDecodeError:
            analysis_json_str = None

    roadmap_json_str = None
    if roadmap_match:
        raw = roadmap_match.group(1).strip()
        try:
            json.loads(raw)
            roadmap_json_str = raw
        except json.JSONDecodeError:
            roadmap_json_str = None

    analysis_md_str = analysis_md_match.group(1).strip() if analysis_md_match else None

    # Only return if we have at least valid JSON or valid markdown
    if not analysis_json_str and not analysis_md_str:
        return None

    return {
        "analysis_json": analysis_json_str,
        "analysis_markdown": analysis_md_str,
        "roadmap_json": roadmap_json_str,
    }


async def generate_session_summary(messages: list[dict]) -> str:
    """Generate a 150-200 word summary of the session conversation."""
    conversation_text = "\n".join(
        f"{'Student' if m['role'] == 'user' else 'Counselor'}: {m['content']}"
        for m in messages
    )

    prompt = SESSION_SUMMARY_PROMPT.format(conversation=conversation_text)

    response = await client.messages.create(
        model=MODEL,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text


async def update_context_summary(db, user_id: str, new_summary: str):
    """Update or create the rolling context summary for a user.

    If the cumulative summary exceeds 1000 words, condense it using Claude.
    """
    from app.models import ContextSummary

    ctx = db.query(ContextSummary).filter(
        ContextSummary.user_id == user_id
    ).first()

    if not ctx:
        ctx = ContextSummary(
            user_id=user_id,
            cumulative_summary=new_summary,
        )
        db.add(ctx)
        db.commit()
        return

    # Append new summary
    updated = f"{ctx.cumulative_summary}\n\n---\n\n{new_summary}"

    # Condense if too long
    word_count = len(updated.split())
    if word_count > 1000:
        condense_response = await client.messages.create(
            model=MODEL,
            max_tokens=600,
            messages=[{
                "role": "user",
                "content": (
                    "Condense the following career counseling session summaries into "
                    "a single coherent summary of 300-400 words. Preserve key facts, "
                    "career interests, strengths, and important decisions.\n\n"
                    f"{updated}"
                ),
            }],
        )
        updated = condense_response.content[0].text

    ctx.cumulative_summary = updated
    db.commit()

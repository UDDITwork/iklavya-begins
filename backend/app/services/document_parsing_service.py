"""Parse PDF documents (resumes/CVs) and extract structured profile data using Claude."""

import io
import json
import logging

import pdfplumber

from app.services.claude_service import get_chat_response

logger = logging.getLogger(__name__)

MAX_PAGES = 50

EXTRACTION_SYSTEM_PROMPT = """You are an expert document parser specialising in resumes, CVs, and professional documents.

Your task: extract structured profile data from the provided text and return ONLY valid JSON (no markdown fences, no explanation).

Return a JSON object with these exact keys. Use null for any field you cannot find — never guess or fabricate data.

{
  "date_of_birth": "YYYY-MM-DD or null",
  "gender": "Male | Female | Other | null",
  "city": "string or null",
  "state": "string or null",
  "pin_code": "string or null",
  "education_level": "e.g. Undergraduate, Postgraduate, PhD, 12th, etc. or null",
  "class_or_year": "e.g. 3rd Year, 2024 batch, etc. or null",
  "institution": "college/university name or null",
  "board": "e.g. CBSE, ICSE, state board, university name or null",
  "stream": "e.g. Computer Science, Mechanical Engineering, Commerce, etc. or null",
  "cgpa": "string or null",
  "hobbies": ["array of strings"] or null,
  "interests": ["array of strings"] or null,
  "strengths": ["array of strings"] or null,
  "weaknesses": ["array of strings"] or null,
  "languages": ["array of strings"] or null,
  "career_aspiration_raw": "string or null",
  "linkedin_url": "string or null",
  "portfolio_url": "string or null",
  "github_url": "string or null",
  "summary": "professional summary/objective text or null",
  "skills": ["array of skill strings"] or null,
  "achievements": ["array of achievement strings"] or null,
  "extracurriculars": ["array of strings"] or null,
  "work_experience": [
    {"company": "...", "role": "...", "duration": "...", "description": "..."}
  ] or null,
  "projects": [
    {"name": "...", "description": "...", "tech_stack": "...", "url": "..."}
  ] or null,
  "certifications": [
    {"name": "...", "issuer": "...", "year": "..."}
  ] or null
}

Rules:
- Return ONLY the JSON object, nothing else.
- If a section exists but individual sub-fields are missing, use empty string for that sub-field.
- For arrays, return an empty array [] if the section exists but has no items, or null if the section doesn't exist at all.
- Extract phone numbers and emails only if clearly present; do not include them in the output (they are managed separately).
- Be thorough — extract every piece of relevant information you can find."""


async def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text content from a PDF file."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        if len(pdf.pages) > MAX_PAGES:
            raise ValueError(f"PDF has {len(pdf.pages)} pages. Maximum allowed is {MAX_PAGES}.")
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def _clean_json_response(raw: str) -> str:
    """Strip markdown code fences if Claude wraps the JSON."""
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        # Remove opening fence (```json or ```)
        first_newline = cleaned.index("\n")
        cleaned = cleaned[first_newline + 1:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].rstrip()
    return cleaned


async def parse_document(file_bytes: bytes) -> dict:
    """Parse a PDF document and extract structured profile data.

    Args:
        file_bytes: Raw bytes of the PDF file.

    Returns:
        Dictionary of extracted profile fields.

    Raises:
        ValueError: If PDF text cannot be extracted or is empty.
        json.JSONDecodeError: If Claude's response is not valid JSON.
    """
    # 1. Extract text
    text = await extract_text_from_pdf(file_bytes)
    if not text.strip():
        raise ValueError("Could not extract any text from the uploaded PDF. The file may be scanned or image-based.")

    # Truncate very long documents to stay within token limits
    if len(text) > 30000:
        text = text[:30000] + "\n\n[Document truncated due to length]"

    # 2. Send to Claude for structured extraction
    messages = [
        {
            "role": "user",
            "content": f"Extract all profile data from this resume/document:\n\n{text}",
        }
    ]

    response = await get_chat_response(EXTRACTION_SYSTEM_PROMPT, messages)

    # 3. Parse JSON response
    cleaned = _clean_json_response(response)

    try:
        extracted = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("Claude returned invalid JSON for document parsing: %s", cleaned[:500])
        raise ValueError("Failed to parse the document. Please try again or fill in the profile manually.")

    if not isinstance(extracted, dict):
        raise ValueError("Unexpected response format from document parser.")

    # 4. Filter to only known profile fields
    allowed_keys = {
        "date_of_birth", "gender", "city", "state", "pin_code",
        "education_level", "class_or_year", "institution", "board", "stream", "cgpa",
        "hobbies", "interests", "strengths", "weaknesses", "languages",
        "career_aspiration_raw", "linkedin_url", "portfolio_url", "github_url",
        "summary", "skills", "achievements", "extracurriculars",
        "work_experience", "projects", "certifications",
    }

    return {
        k: v for k, v in extracted.items()
        if k in allowed_keys and v is not None and v != "" and v != []
    }

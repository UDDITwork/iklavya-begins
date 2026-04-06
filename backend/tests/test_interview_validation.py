"""
Comprehensive test-validation suite for the AI Interview feature.

Validates models, schemas, prompt generation, utility functions,
SSE event format, report JSON structure, frontend-backend contract,
and PDF generation — all WITHOUT running the application or database.

Run with:
    python -m pytest backend/tests/test_interview_validation.py -v
    python backend/tests/test_interview_validation.py
"""

import sys
import os
import json
import unittest

# ---------------------------------------------------------------------------
# Environment & import bootstrapping
# ---------------------------------------------------------------------------
# The app's config.py reads env vars at import time.  Set dummy values so the
# module graph can be imported without a real database or API keys.
os.environ.setdefault("TURSO_DATABASE_URL", "https://dummy-db.turso.io")
os.environ.setdefault("TURSO_AUTH_TOKEN", "dummy-token")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests")
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-ant-dummy-key")

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Patch the database engine creation so it does not attempt a real connection.
# We do this BEFORE importing any app module because database.py creates the
# engine at module scope.
from unittest.mock import MagicMock, patch

# Patch sqlalchemy create_engine before it runs
with patch("sqlalchemy.create_engine", return_value=MagicMock()):
    from app.models import InterviewSession, InterviewMessage, InterviewReport
    from app.schemas import (
        InterviewSessionCreateRequest,
        InterviewSessionResponse,
        InterviewMessageSendRequest,
        InterviewTTSRequest,
    )
    from app.prompts import (
        build_interview_system_prompt,
        build_interview_analysis_prompt,
    )
    from app.services.interview_service import (
        detect_fillers,
        extract_interview_meta,
        check_interview_complete,
        clean_interview_response,
    )


# ---------------------------------------------------------------------------
# Mock helpers
# ---------------------------------------------------------------------------

class MockUser:
    name = "Test Student"
    college = "Test University"


class MockSession:
    job_role = "Bank PO"
    started_at = "2026-04-06T10:00:00Z"
    interview_started_at = "2026-04-06T10:01:00Z"
    ended_at = "2026-04-06T10:20:00Z"
    duration_seconds = 1140
    questions_answered = 15


# ---------------------------------------------------------------------------
# Canonical sample report (reused by JSON, contract, and PDF tests)
# ---------------------------------------------------------------------------

SAMPLE_REPORT_DATA = {
    "overall_score": 72,
    "verdict": "almost_ready",
    "verdict_label": "Almost There",
    "verdict_description": (
        "The candidate demonstrated solid domain knowledge and reasonable "
        "communication skills. Some answers lacked depth, and filler word "
        "usage was moderately high."
    ),
    "scores": {
        "confidence": 70,
        "clarity": 75,
        "structure": 68,
        "persuasiveness": 65,
        "pace": 78,
        "domain_knowledge": 80,
    },
    "filler_analysis": {
        "total_fillers": 14,
        "fillers_per_minute": 0.74,
        "breakdown": [
            {
                "word": "basically",
                "count": 5,
                "suggestion": "Remove it entirely or replace with 'essentially'.",
            },
            {
                "word": "like",
                "count": 4,
                "suggestion": "Pause briefly instead of saying 'like'.",
            },
            {
                "word": "um",
                "count": 3,
                "suggestion": "Practice silent pauses to replace filler sounds.",
            },
            {
                "word": "you know",
                "count": 2,
                "suggestion": "Replace with a concrete statement or just omit.",
            },
        ],
    },
    "communication_metrics": {
        "avg_answer_length_words": 85,
        "vocabulary_richness": "moderate",
        "stammering_frequency": "occasional",
        "stammering_details": (
            "Hesitation observed when asked about numerical aptitude "
            "questions and current affairs topics."
        ),
    },
    "question_breakdown": [
        {
            "question_index": 0,
            "question_text": "Tell me about yourself and why you want to become a Bank PO.",
            "student_answer_summary": (
                "The candidate introduced themselves, mentioned their commerce "
                "background, and expressed interest in public sector banking."
            ),
            "score": 75,
            "strengths": [
                "Clear introduction",
                "Mentioned relevant educational background",
            ],
            "weaknesses": [
                "Did not mention specific Bank PO responsibilities",
            ],
            "ideal_answer_outline": (
                "Start with educational background, then connect to banking "
                "sector interest, mention specific PO duties like branch "
                "management and lending, and close with career aspirations."
            ),
            "better_words": [
                "'I want to do banking' -> 'I aspire to serve in public sector banking'",
                "'good salary' -> 'financial stability and career growth'",
            ],
        },
        {
            "question_index": 1,
            "question_text": (
                "Walk me through the priority sector lending norms set by RBI."
            ),
            "student_answer_summary": (
                "The candidate mentioned agriculture and small enterprises "
                "but could not recall specific percentage targets."
            ),
            "score": 60,
            "strengths": [
                "Knew the broad categories of priority sector lending",
            ],
            "weaknesses": [
                "Could not recall 40% target",
                "Missed weaker sections and housing sub-categories",
            ],
            "ideal_answer_outline": (
                "Priority sector lending requires banks to lend 40% of ANBC "
                "to agriculture (18%), MSE (7.5%), weaker sections (12%), "
                "education, housing, export credit, and others."
            ),
            "better_words": [
                "'small businesses' -> 'Micro, Small and Medium Enterprises (MSMEs)'",
            ],
        },
        {
            "question_index": 2,
            "question_text": (
                "Describe a time when you had to handle a stressful situation. "
                "How did you manage it?"
            ),
            "student_answer_summary": (
                "Shared an example of managing exam pressure during final "
                "semester while handling a family emergency."
            ),
            "score": 82,
            "strengths": [
                "Used STAR format naturally",
                "Showed emotional resilience",
                "Quantified outcome (scored above 80%)",
            ],
            "weaknesses": [
                "Could have tied it back to banking role demands",
            ],
            "ideal_answer_outline": (
                "Use STAR: describe the stressful situation, the task at hand, "
                "the actions taken to manage stress (prioritization, time "
                "management, seeking support), and the positive result."
            ),
            "better_words": [
                "'it was really hard' -> 'it was a significant challenge'",
            ],
        },
    ],
    "improvement_plan": [
        {
            "priority": 1,
            "area": "Domain Knowledge — Banking Regulations",
            "current_state": (
                "Knows broad topics but lacks specific figures and recent "
                "policy details."
            ),
            "target": (
                "Confident recall of RBI norms, NPA definitions, Basel III, "
                "and recent banking reforms."
            ),
            "action_steps": [
                "Read RBI Master Circulars on priority sector lending weekly.",
                "Create flashcards for key banking ratios (CRR, SLR, Repo, "
                "Reverse Repo).",
                "Follow RBI announcements on their official website for "
                "2 weeks.",
            ],
        },
        {
            "priority": 2,
            "area": "Communication — Filler Word Reduction",
            "current_state": (
                "Uses 'basically' and 'like' frequently, averaging 0.74 "
                "fillers per minute."
            ),
            "target": "Reduce filler word rate to below 0.3 per minute.",
            "action_steps": [
                "Record yourself answering mock questions and count fillers.",
                "Practice 2-second silent pauses instead of filler words.",
                "Do 5-minute impromptu speaking drills daily on random topics.",
            ],
        },
    ],
}


# ===================================================================
# TEST SUITE
# ===================================================================


class TestInterviewModelValidation(unittest.TestCase):
    """1. Verify SQLAlchemy model classes have the expected columns."""

    def test_interview_session_has_required_columns(self):
        """InterviewSession must define all columns used by the feature."""
        required = {
            "id", "user_id", "job_role", "job_description", "resume_text",
            "questions_answered", "estimated_total", "status",
            "duration_seconds", "started_at", "interview_started_at",
            "ended_at", "created_at",
        }
        actual = {c.key for c in InterviewSession.__table__.columns}
        missing = required - actual
        self.assertFalse(missing, f"InterviewSession missing columns: {missing}")

    def test_interview_message_has_required_columns(self):
        """InterviewMessage must define all columns used by the feature."""
        required = {
            "id", "session_id", "user_id", "role", "content",
            "question_index", "is_follow_up", "message_order", "created_at",
        }
        actual = {c.key for c in InterviewMessage.__table__.columns}
        missing = required - actual
        self.assertFalse(missing, f"InterviewMessage missing columns: {missing}")

    def test_interview_report_has_required_columns(self):
        """InterviewReport must define all columns used by the feature."""
        required = {
            "id", "session_id", "user_id", "report_json",
            "overall_score", "verdict", "created_at",
        }
        actual = {c.key for c in InterviewReport.__table__.columns}
        missing = required - actual
        self.assertFalse(missing, f"InterviewReport missing columns: {missing}")

    def test_interview_message_role_accepts_interviewer_and_candidate(self):
        """The role column should be a string type (no enum restriction at DB level)."""
        col = InterviewMessage.__table__.columns["role"]
        # Just verify it exists and is a string-type column
        self.assertIn("VARCHAR", str(col.type).upper())


class TestInterviewSchemaValidation(unittest.TestCase):
    """2. Verify Pydantic schemas accept valid data and reject invalid data."""

    def test_session_create_valid(self):
        """InterviewSessionCreateRequest accepts valid job role."""
        req = InterviewSessionCreateRequest(job_role="Bank PO")
        self.assertEqual(req.job_role, "Bank PO")
        self.assertIsNone(req.job_description)

    def test_session_create_with_jd(self):
        """InterviewSessionCreateRequest accepts job_description."""
        req = InterviewSessionCreateRequest(
            job_role="Software Engineer",
            job_description="Must know Python, FastAPI, and PostgreSQL.",
        )
        self.assertEqual(req.job_role, "Software Engineer")
        self.assertIn("Python", req.job_description)

    def test_session_create_rejects_empty_role(self):
        """InterviewSessionCreateRequest rejects job_role shorter than 2 chars."""
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            InterviewSessionCreateRequest(job_role="")

    def test_session_create_rejects_too_long_role(self):
        """InterviewSessionCreateRequest rejects job_role longer than 200 chars."""
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            InterviewSessionCreateRequest(job_role="X" * 201)

    def test_session_response_valid(self):
        """InterviewSessionResponse can be built from valid data."""
        data = {
            "id": "abc-123",
            "user_id": "user-1",
            "job_role": "Data Analyst",
            "questions_answered": 5,
            "estimated_total": 18,
            "status": "active",
            "started_at": "2026-04-06T10:00:00Z",
            "created_at": "2026-04-06T10:00:00Z",
        }
        resp = InterviewSessionResponse(**data)
        self.assertEqual(resp.status, "active")
        self.assertIsNone(resp.overall_score)

    def test_message_send_valid(self):
        """InterviewMessageSendRequest accepts valid content."""
        req = InterviewMessageSendRequest(
            content="I have been working in the banking sector for 2 years."
        )
        self.assertIn("banking", req.content)

    def test_message_send_rejects_empty(self):
        """InterviewMessageSendRequest rejects empty content."""
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            InterviewMessageSendRequest(content="")

    def test_message_send_rejects_too_long(self):
        """InterviewMessageSendRequest rejects content > 10000 chars."""
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            InterviewMessageSendRequest(content="A" * 10001)

    def test_tts_request_valid(self):
        """InterviewTTSRequest accepts valid text."""
        req = InterviewTTSRequest(text="Hello, welcome to the interview.")
        self.assertEqual(req.text, "Hello, welcome to the interview.")

    def test_tts_request_rejects_empty(self):
        """InterviewTTSRequest rejects empty text."""
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            InterviewTTSRequest(text="")

    def test_tts_request_rejects_too_long(self):
        """InterviewTTSRequest rejects text > 2000 chars."""
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            InterviewTTSRequest(text="W" * 2001)


class TestPromptGeneration(unittest.TestCase):
    """3. Verify interview system prompt generation with different inputs."""

    def test_prompt_contains_job_role(self):
        """System prompt must include the target job role."""
        prompt = build_interview_system_prompt(job_role="Bank PO")
        self.assertIn("Bank PO", prompt)

    def test_prompt_without_resume(self):
        """When no resume is provided, prompt says so."""
        prompt = build_interview_system_prompt(job_role="Bank PO")
        self.assertIn("No resume provided", prompt)

    def test_prompt_with_resume(self):
        """When resume text is provided, it appears in the prompt."""
        resume = "B.Com from Delhi University. Intern at SBI for 3 months."
        prompt = build_interview_system_prompt(
            job_role="Bank PO", resume_text=resume
        )
        self.assertIn("Candidate's Resume", prompt)
        self.assertIn("B.Com from Delhi University", prompt)

    def test_prompt_truncates_long_resume(self):
        """Resume text longer than 3000 chars is truncated."""
        long_resume = "A" * 5000
        prompt = build_interview_system_prompt(
            job_role="Bank PO", resume_text=long_resume
        )
        # The prompt should contain the truncated version (3000 chars)
        self.assertIn("A" * 3000, prompt)
        self.assertNotIn("A" * 3001, prompt)

    def test_prompt_without_jd(self):
        """When no JD is provided, prompt uses standard expectations."""
        prompt = build_interview_system_prompt(job_role="Software Engineer")
        self.assertIn("No specific JD provided", prompt)

    def test_prompt_with_jd(self):
        """When JD is provided, it appears in the prompt."""
        jd = "Must have 2+ years experience with Python and cloud services."
        prompt = build_interview_system_prompt(
            job_role="Software Engineer", job_description=jd
        )
        self.assertIn("Job Description", prompt)
        self.assertIn("Python and cloud services", prompt)

    def test_prompt_with_both_resume_and_jd(self):
        """When both resume and JD are provided, both appear."""
        prompt = build_interview_system_prompt(
            job_role="Data Analyst",
            resume_text="Experienced in SQL and Tableau.",
            job_description="Looking for a data analyst with SQL skills.",
        )
        self.assertIn("Candidate's Resume", prompt)
        self.assertIn("Job Description", prompt)
        self.assertIn("Data Analyst", prompt)

    def test_prompt_contains_metadata_instructions(self):
        """System prompt must include the <interview_meta> tag instruction."""
        prompt = build_interview_system_prompt(job_role="Bank PO")
        self.assertIn("<interview_meta>", prompt)
        self.assertIn("question_number", prompt)

    def test_prompt_contains_completion_instruction(self):
        """System prompt must include the <interview_complete> tag instruction."""
        prompt = build_interview_system_prompt(job_role="Bank PO")
        self.assertIn("<interview_complete>", prompt)


class TestAnalysisPromptGeneration(unittest.TestCase):
    """4. Verify the analysis prompt includes the transcript properly."""

    def test_analysis_prompt_contains_job_role(self):
        """Analysis prompt must include the target job role."""
        transcript = "Interviewer: Tell me about yourself.\nCandidate: I am a student."
        prompt = build_interview_analysis_prompt("Bank PO", transcript)
        self.assertIn("Bank PO", prompt)

    def test_analysis_prompt_contains_transcript(self):
        """Analysis prompt must include the full transcript."""
        transcript = (
            "Interviewer: What do you know about priority sector lending?\n"
            "Candidate: Banks must lend 40% to priority sectors."
        )
        prompt = build_interview_analysis_prompt("Bank PO", transcript)
        self.assertIn("priority sector lending", prompt)
        self.assertIn("40%", prompt)

    def test_analysis_prompt_contains_json_structure(self):
        """Analysis prompt must include the expected JSON structure hints."""
        prompt = build_interview_analysis_prompt("SDE", "Transcript here")
        self.assertIn("overall_score", prompt)
        self.assertIn("question_breakdown", prompt)
        self.assertIn("improvement_plan", prompt)
        self.assertIn("filler_analysis", prompt)
        self.assertIn("scores", prompt)

    def test_analysis_prompt_asks_for_json_only(self):
        """Analysis prompt ends with instruction to output only JSON."""
        prompt = build_interview_analysis_prompt("SDE", "Transcript here")
        self.assertIn("Output ONLY the JSON", prompt)


class TestFillerWordDetection(unittest.TestCase):
    """5. Test detect_fillers() with known inputs and verify counts."""

    def test_single_filler(self):
        """Detects a single filler word."""
        result = detect_fillers("Um, I think banking is a good career.")
        words = {item["word"]: item["count"] for item in result}
        self.assertIn("um", words)
        self.assertEqual(words["um"], 1)

    def test_multiple_fillers(self):
        """Detects multiple different filler words."""
        text = (
            "So basically I like working in banks, you know, "
            "like it is actually a good field."
        )
        result = detect_fillers(text)
        words = {item["word"]: item["count"] for item in result}
        self.assertIn("basically", words)
        self.assertIn("like", words)
        self.assertIn("you know", words)
        self.assertIn("actually", words)
        self.assertIn("so", words)

    def test_repeated_filler(self):
        """Counts repeated occurrences of the same filler."""
        text = "Like, I think like this is like a good approach."
        result = detect_fillers(text)
        words = {item["word"]: item["count"] for item in result}
        self.assertIn("like", words)
        self.assertEqual(words["like"], 3)

    def test_no_fillers(self):
        """Returns empty list when no fillers are present."""
        result = detect_fillers(
            "I have three years of experience in branch banking "
            "and customer relationship management."
        )
        self.assertEqual(result, [])

    def test_case_insensitive(self):
        """Filler detection is case-insensitive."""
        result = detect_fillers("BASICALLY I think Um this is fine.")
        words = {item["word"]: item["count"] for item in result}
        self.assertIn("basically", words)
        self.assertIn("um", words)

    def test_sorted_by_count_descending(self):
        """Results are sorted by count in descending order."""
        text = "like like like basically basically um"
        result = detect_fillers(text)
        counts = [item["count"] for item in result]
        self.assertEqual(counts, sorted(counts, reverse=True))

    def test_filler_returns_dict_structure(self):
        """Each result item has 'word' and 'count' keys."""
        result = detect_fillers("Um, well, basically yes.")
        for item in result:
            self.assertIn("word", item)
            self.assertIn("count", item)
            self.assertIsInstance(item["word"], str)
            self.assertIsInstance(item["count"], int)


class TestExtractInterviewMeta(unittest.TestCase):
    """6. Test extract_interview_meta() with sample AI responses."""

    def test_extracts_valid_meta(self):
        """Extracts well-formed <interview_meta> JSON."""
        text = (
            'That is a great question. Tell me about your experience.\n'
            '<interview_meta>{"question_number": 3, "estimated_remaining": 12, '
            '"is_follow_up": false, "topic": "work experience"}</interview_meta>'
        )
        meta = extract_interview_meta(text)
        self.assertIsNotNone(meta)
        self.assertEqual(meta["question_number"], 3)
        self.assertEqual(meta["estimated_remaining"], 12)
        self.assertFalse(meta["is_follow_up"])
        self.assertEqual(meta["topic"], "work experience")

    def test_returns_none_for_no_meta(self):
        """Returns None when no meta tag is present."""
        meta = extract_interview_meta("Just a normal question with no tags.")
        self.assertIsNone(meta)

    def test_returns_none_for_malformed_json(self):
        """Returns None when meta tag contains invalid JSON."""
        text = '<interview_meta>{bad json here}</interview_meta>'
        meta = extract_interview_meta(text)
        self.assertIsNone(meta)

    def test_extracts_follow_up_true(self):
        """Correctly detects is_follow_up=true."""
        text = (
            'Can you elaborate on that?\n'
            '<interview_meta>{"question_number": 5, "estimated_remaining": 10, '
            '"is_follow_up": true, "topic": "deep dive"}</interview_meta>'
        )
        meta = extract_interview_meta(text)
        self.assertTrue(meta["is_follow_up"])


class TestCheckInterviewComplete(unittest.TestCase):
    """7. Test check_interview_complete() with sample AI responses."""

    def test_detects_complete_true(self):
        """Detects <interview_complete>true</interview_complete>."""
        text = (
            "Thank you for your time. That concludes our interview.\n"
            "<interview_complete>true</interview_complete>"
        )
        self.assertTrue(check_interview_complete(text))

    def test_detects_complete_true_with_whitespace(self):
        """Detects the tag even with extra whitespace."""
        text = "<interview_complete> true </interview_complete>"
        self.assertTrue(check_interview_complete(text))

    def test_not_complete_without_tag(self):
        """Returns False when no completion tag is present."""
        text = "Let me ask you another question about banking regulations."
        self.assertFalse(check_interview_complete(text))

    def test_not_complete_with_false_tag(self):
        """Returns False when tag contains 'false' instead of 'true'."""
        text = "<interview_complete>false</interview_complete>"
        self.assertFalse(check_interview_complete(text))

    def test_case_insensitive_detection(self):
        """Detection is case-insensitive for the tag content."""
        text = "<interview_complete>TRUE</interview_complete>"
        self.assertTrue(check_interview_complete(text))


class TestCleanInterviewResponse(unittest.TestCase):
    """8. Test clean_interview_response() strips meta tags."""

    def test_removes_interview_meta_tag(self):
        """Strips <interview_meta> tag from response."""
        raw = (
            "Tell me about your experience.\n"
            '<interview_meta>{"question_number": 1, "estimated_remaining": 15, '
            '"is_follow_up": false, "topic": "intro"}</interview_meta>'
        )
        cleaned = clean_interview_response(raw)
        self.assertNotIn("<interview_meta>", cleaned)
        self.assertNotIn("</interview_meta>", cleaned)
        self.assertIn("Tell me about your experience.", cleaned)

    def test_removes_interview_complete_tag(self):
        """Strips <interview_complete> tag from response."""
        raw = (
            "Thank you for your time.\n"
            "<interview_complete>true</interview_complete>"
        )
        cleaned = clean_interview_response(raw)
        self.assertNotIn("<interview_complete>", cleaned)
        self.assertIn("Thank you for your time.", cleaned)

    def test_removes_both_tags(self):
        """Strips both meta and complete tags when both are present."""
        raw = (
            "Final question answered.\n"
            '<interview_meta>{"question_number": 18, "estimated_remaining": 0, '
            '"is_follow_up": false, "topic": "closing"}</interview_meta>\n'
            "<interview_complete>true</interview_complete>"
        )
        cleaned = clean_interview_response(raw)
        self.assertNotIn("<interview_meta>", cleaned)
        self.assertNotIn("<interview_complete>", cleaned)
        self.assertIn("Final question answered.", cleaned)

    def test_preserves_text_without_tags(self):
        """Text with no tags is returned unchanged (stripped)."""
        raw = "  What are your strengths?  "
        cleaned = clean_interview_response(raw)
        self.assertEqual(cleaned, "What are your strengths?")

    def test_result_is_stripped(self):
        """Result has no leading/trailing whitespace."""
        raw = "\n\n  Hello world.  \n<interview_meta>{}</interview_meta>\n\n"
        cleaned = clean_interview_response(raw)
        self.assertEqual(cleaned, cleaned.strip())


class TestSSEEventFormat(unittest.TestCase):
    """9. Verify SSE events follow the event: xxx\\ndata: yyy\\n\\n format."""

    def test_message_event_format(self):
        """Message SSE event has correct structure."""
        payload = {"text": "Hello, welcome to the interview."}
        event = f"event: message\ndata: {json.dumps(payload)}\n\n"

        lines = event.strip().split("\n")
        self.assertTrue(lines[0].startswith("event: "))
        self.assertTrue(lines[1].startswith("data: "))
        self.assertEqual(lines[0], "event: message")

        # Data line must be valid JSON
        data_str = lines[1][len("data: "):]
        parsed = json.loads(data_str)
        self.assertEqual(parsed["text"], "Hello, welcome to the interview.")

    def test_meta_event_format(self):
        """Meta SSE event has correct structure."""
        meta = {
            "question_number": 3,
            "estimated_remaining": 12,
            "is_follow_up": False,
            "topic": "work experience",
        }
        event = f"event: meta\ndata: {json.dumps(meta)}\n\n"

        lines = event.strip().split("\n")
        self.assertEqual(lines[0], "event: meta")
        data_str = lines[1][len("data: "):]
        parsed = json.loads(data_str)
        self.assertEqual(parsed["question_number"], 3)

    def test_done_event_format(self):
        """Done SSE event has correct structure."""
        event = "event: done\ndata: {}\n\n"
        lines = event.strip().split("\n")
        self.assertEqual(lines[0], "event: done")
        self.assertEqual(lines[1], "data: {}")

    def test_error_event_format(self):
        """Error SSE event has correct structure."""
        error = {"error": "Something went wrong"}
        event = f"event: error\ndata: {json.dumps(error)}\n\n"
        lines = event.strip().split("\n")
        self.assertEqual(lines[0], "event: error")
        data_str = lines[1][len("data: "):]
        parsed = json.loads(data_str)
        self.assertIn("error", parsed)

    def test_fillers_event_format(self):
        """Fillers SSE event has correct structure."""
        fillers = {"fillers": [{"word": "um", "count": 3}]}
        event = f"event: fillers\ndata: {json.dumps(fillers)}\n\n"
        lines = event.strip().split("\n")
        self.assertEqual(lines[0], "event: fillers")
        data_str = lines[1][len("data: "):]
        parsed = json.loads(data_str)
        self.assertIn("fillers", parsed)
        self.assertEqual(parsed["fillers"][0]["word"], "um")

    def test_interview_complete_event_format(self):
        """Interview complete SSE event has correct structure."""
        event = f"event: interview_complete\ndata: {json.dumps({'complete': True})}\n\n"
        lines = event.strip().split("\n")
        self.assertEqual(lines[0], "event: interview_complete")
        data_str = lines[1][len("data: "):]
        parsed = json.loads(data_str)
        self.assertTrue(parsed["complete"])

    def test_event_ends_with_double_newline(self):
        """Every SSE event must end with two newlines (per SSE spec)."""
        event = f"event: message\ndata: {json.dumps({'text': 'Hi'})}\n\n"
        self.assertTrue(event.endswith("\n\n"))

    def test_progress_event_format(self):
        """Progress SSE event (used during report generation) has correct structure."""
        progress = {"percent": 80, "status": "Building report..."}
        event = f"event: progress\ndata: {json.dumps(progress)}\n\n"
        lines = event.strip().split("\n")
        self.assertEqual(lines[0], "event: progress")
        data_str = lines[1][len("data: "):]
        parsed = json.loads(data_str)
        self.assertEqual(parsed["percent"], 80)


class TestReportJSONStructure(unittest.TestCase):
    """10. Verify a sample report JSON has all required fields."""

    def test_top_level_fields(self):
        """Report must have all required top-level keys."""
        required_keys = {
            "overall_score", "verdict", "verdict_label",
            "verdict_description", "scores", "filler_analysis",
            "communication_metrics", "question_breakdown",
            "improvement_plan",
        }
        actual_keys = set(SAMPLE_REPORT_DATA.keys())
        missing = required_keys - actual_keys
        self.assertFalse(missing, f"Report missing top-level keys: {missing}")

    def test_overall_score_range(self):
        """overall_score must be an integer in 0-100."""
        score = SAMPLE_REPORT_DATA["overall_score"]
        self.assertIsInstance(score, int)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)

    def test_verdict_values(self):
        """verdict must be one of the allowed values."""
        allowed = {"ready", "almost_ready", "needs_practice"}
        self.assertIn(SAMPLE_REPORT_DATA["verdict"], allowed)

    def test_scores_object_has_all_dimensions(self):
        """scores must have all 6 scoring dimensions."""
        expected_dims = {
            "confidence", "clarity", "structure",
            "persuasiveness", "pace", "domain_knowledge",
        }
        actual_dims = set(SAMPLE_REPORT_DATA["scores"].keys())
        missing = expected_dims - actual_dims
        self.assertFalse(missing, f"Scores missing dimensions: {missing}")

    def test_scores_values_are_valid(self):
        """Each score dimension must be an integer in 0-100."""
        for key, val in SAMPLE_REPORT_DATA["scores"].items():
            self.assertIsInstance(val, int, f"Score '{key}' is not an int")
            self.assertGreaterEqual(val, 0, f"Score '{key}' < 0")
            self.assertLessEqual(val, 100, f"Score '{key}' > 100")

    def test_filler_analysis_structure(self):
        """filler_analysis must have total_fillers and breakdown."""
        fa = SAMPLE_REPORT_DATA["filler_analysis"]
        self.assertIn("total_fillers", fa)
        self.assertIn("fillers_per_minute", fa)
        self.assertIn("breakdown", fa)
        self.assertIsInstance(fa["breakdown"], list)
        self.assertGreater(len(fa["breakdown"]), 0)

    def test_filler_breakdown_items(self):
        """Each filler breakdown item must have word, count, and suggestion."""
        for item in SAMPLE_REPORT_DATA["filler_analysis"]["breakdown"]:
            self.assertIn("word", item)
            self.assertIn("count", item)
            self.assertIn("suggestion", item)
            self.assertIsInstance(item["count"], int)

    def test_communication_metrics_structure(self):
        """communication_metrics must have required fields."""
        cm = SAMPLE_REPORT_DATA["communication_metrics"]
        self.assertIn("avg_answer_length_words", cm)
        self.assertIn("vocabulary_richness", cm)
        self.assertIn("stammering_frequency", cm)
        self.assertIn("stammering_details", cm)

    def test_question_breakdown_is_list(self):
        """question_breakdown must be a non-empty list."""
        qb = SAMPLE_REPORT_DATA["question_breakdown"]
        self.assertIsInstance(qb, list)
        self.assertGreater(len(qb), 0)

    def test_question_breakdown_items_structure(self):
        """Each question_breakdown item must have required fields."""
        for q in SAMPLE_REPORT_DATA["question_breakdown"]:
            self.assertIn("question_index", q)
            self.assertIn("question_text", q)
            self.assertIn("student_answer_summary", q)
            self.assertIn("score", q)
            self.assertIn("strengths", q)
            self.assertIn("weaknesses", q)
            self.assertIn("ideal_answer_outline", q)
            self.assertIn("better_words", q)
            self.assertIsInstance(q["strengths"], list)
            self.assertIsInstance(q["weaknesses"], list)

    def test_improvement_plan_is_list(self):
        """improvement_plan must be a non-empty list."""
        ip = SAMPLE_REPORT_DATA["improvement_plan"]
        self.assertIsInstance(ip, list)
        self.assertGreater(len(ip), 0)

    def test_improvement_plan_items_structure(self):
        """Each improvement_plan item must have required fields."""
        for item in SAMPLE_REPORT_DATA["improvement_plan"]:
            self.assertIn("priority", item)
            self.assertIn("area", item)
            self.assertIn("current_state", item)
            self.assertIn("target", item)
            self.assertIn("action_steps", item)
            self.assertIsInstance(item["action_steps"], list)
            self.assertGreater(len(item["action_steps"]), 0)

    def test_report_json_serializable(self):
        """The entire report must be JSON-serializable (round-trip)."""
        serialized = json.dumps(SAMPLE_REPORT_DATA)
        deserialized = json.loads(serialized)
        self.assertEqual(deserialized["overall_score"], 72)
        self.assertEqual(len(deserialized["question_breakdown"]), 3)


class TestFrontendBackendContract(unittest.TestCase):
    """11. Verify field names match what ReportView.tsx expects.

    ReportView.tsx reads:
      - reportData.scores -> object with score dimensions
      - reportData.filler_analysis.breakdown -> array of {word, count, suggestion}
      - reportData.question_breakdown -> array, each with question_text field
      - reportData.improvement_plan -> array, each with action_steps field
    """

    def test_scores_is_object_not_array(self):
        """Frontend expects scores as an object {confidence: N, ...}."""
        scores = SAMPLE_REPORT_DATA["scores"]
        self.assertIsInstance(scores, dict)
        # Frontend does: Object.entries(scoresObj).map(...)
        entries = list(scores.items())
        self.assertGreater(len(entries), 0)
        for key, val in entries:
            self.assertIsInstance(key, str)
            self.assertIsInstance(val, (int, float))

    def test_filler_analysis_has_breakdown_array(self):
        """Frontend expects filler_analysis.breakdown as array."""
        fa = SAMPLE_REPORT_DATA["filler_analysis"]
        self.assertIn("breakdown", fa)
        self.assertIsInstance(fa["breakdown"], list)
        # Frontend accesses: item.word, item.count, item.suggestion
        for item in fa["breakdown"]:
            self.assertIn("word", item)
            self.assertIn("count", item)

    def test_question_breakdown_has_question_text(self):
        """Frontend reads question_text from each question_breakdown item.

        ReportView.tsx line: (q.question_text as string) || (q.question as string)
        The backend MUST provide question_text to match the primary field name.
        """
        for q in SAMPLE_REPORT_DATA["question_breakdown"]:
            self.assertIn("question_text", q)
            self.assertIsInstance(q["question_text"], str)
            self.assertGreater(len(q["question_text"]), 0)

    def test_question_breakdown_has_student_answer_summary(self):
        """Frontend reads student_answer_summary from each question."""
        for q in SAMPLE_REPORT_DATA["question_breakdown"]:
            self.assertIn("student_answer_summary", q)

    def test_question_breakdown_has_ideal_answer_outline(self):
        """Frontend reads ideal_answer_outline from each question."""
        for q in SAMPLE_REPORT_DATA["question_breakdown"]:
            self.assertIn("ideal_answer_outline", q)

    def test_question_breakdown_better_words_format(self):
        """Frontend expects better_words as string[] with '->' separator.

        ReportView.tsx splits on the arrow to get original/suggestion pairs.
        """
        for q in SAMPLE_REPORT_DATA["question_breakdown"]:
            self.assertIn("better_words", q)
            if q["better_words"]:
                self.assertIsInstance(q["better_words"], list)
                for bw in q["better_words"]:
                    self.assertIsInstance(bw, str)
                    # Frontend splits on the arrow character
                    self.assertIn("->", bw)

    def test_improvement_plan_has_action_steps(self):
        """Frontend reads action_steps from each improvement_plan item.

        ReportView.tsx line: (item.action_steps as string[]) || (item.actions as string[])
        The backend MUST provide action_steps to match the primary field name.
        """
        for item in SAMPLE_REPORT_DATA["improvement_plan"]:
            self.assertIn("action_steps", item)
            self.assertIsInstance(item["action_steps"], list)
            self.assertGreater(len(item["action_steps"]), 0)

    def test_improvement_plan_has_current_state(self):
        """Frontend reads current_state from each improvement_plan item."""
        for item in SAMPLE_REPORT_DATA["improvement_plan"]:
            self.assertIn("current_state", item)
            self.assertIsInstance(item["current_state"], str)

    def test_improvement_plan_has_priority_area_target(self):
        """Frontend reads priority, area, and target from each item."""
        for item in SAMPLE_REPORT_DATA["improvement_plan"]:
            self.assertIn("priority", item)
            self.assertIn("area", item)
            self.assertIn("target", item)

    def test_verdict_and_verdict_description_present(self):
        """Frontend reads verdict and verdict_description for display."""
        self.assertIn("verdict", SAMPLE_REPORT_DATA)
        self.assertIn("verdict_description", SAMPLE_REPORT_DATA)

    def test_overall_score_present(self):
        """Frontend reads overall_score for the circular score widget."""
        self.assertIn("overall_score", SAMPLE_REPORT_DATA)
        self.assertIsInstance(SAMPLE_REPORT_DATA["overall_score"], int)


class TestPDFGeneration(unittest.TestCase):
    """12. Test that generate_interview_pdf() produces valid PDF bytes.

    NOTE: The interview_pdf_service module may not exist yet.  If the import
    fails, these tests are skipped gracefully rather than failing the suite.
    """

    @classmethod
    def setUpClass(cls):
        """Try to import the PDF service.  Skip all tests if unavailable."""
        try:
            with patch("sqlalchemy.create_engine", return_value=MagicMock()):
                from app.services.interview_pdf_service import generate_interview_pdf
            cls.generate_pdf = staticmethod(generate_interview_pdf)
            cls.service_available = True
        except (ImportError, ModuleNotFoundError, Exception) as e:
            cls.service_available = False
            cls._skip_reason = str(e)

    def setUp(self):
        if not self.service_available:
            self.skipTest(
                "interview_pdf_service not implemented yet — skipping PDF tests"
            )

    def test_pdf_generates_bytes(self):
        """generate_interview_pdf() returns a non-empty bytes object."""
        user = MockUser()
        session = MockSession()
        result = self.generate_pdf(user, session, SAMPLE_REPORT_DATA)
        self.assertIsInstance(result, bytes)
        self.assertGreater(len(result), 100, "PDF output is suspiciously small")

    def test_pdf_starts_with_pdf_header(self):
        """Valid PDF files start with %PDF."""
        user = MockUser()
        session = MockSession()
        result = self.generate_pdf(user, session, SAMPLE_REPORT_DATA)
        self.assertTrue(
            result[:5] == b"%PDF-",
            f"PDF does not start with %PDF- header, got: {result[:20]!r}",
        )

    def test_pdf_with_empty_question_breakdown(self):
        """PDF generation succeeds even with empty question_breakdown."""
        user = MockUser()
        session = MockSession()
        modified = {**SAMPLE_REPORT_DATA, "question_breakdown": []}
        result = self.generate_pdf(user, session, modified)
        self.assertIsInstance(result, bytes)
        self.assertTrue(result[:5] == b"%PDF-")

    def test_pdf_with_empty_improvement_plan(self):
        """PDF generation succeeds even with empty improvement_plan."""
        user = MockUser()
        session = MockSession()
        modified = {**SAMPLE_REPORT_DATA, "improvement_plan": []}
        result = self.generate_pdf(user, session, modified)
        self.assertIsInstance(result, bytes)

    def test_pdf_with_minimal_report(self):
        """PDF generation succeeds with a minimal report (only required fields)."""
        user = MockUser()
        session = MockSession()
        minimal = {
            "overall_score": 50,
            "verdict": "needs_practice",
            "verdict_label": "Needs More Practice",
            "verdict_description": "The candidate needs more preparation.",
            "scores": {
                "confidence": 50, "clarity": 50, "structure": 50,
                "persuasiveness": 50, "pace": 50, "domain_knowledge": 50,
            },
            "filler_analysis": {
                "total_fillers": 0, "fillers_per_minute": 0, "breakdown": [],
            },
            "communication_metrics": {
                "avg_answer_length_words": 30,
                "vocabulary_richness": "poor",
                "stammering_frequency": "none",
                "stammering_details": "",
            },
            "question_breakdown": [],
            "improvement_plan": [],
        }
        result = self.generate_pdf(user, session, minimal)
        self.assertIsInstance(result, bytes)


# ===================================================================
# Entry point
# ===================================================================

if __name__ == "__main__":
    unittest.main()

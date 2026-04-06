"""
Interview Performance PDF Report Generator
===========================================
Produces a visually-rich, multi-page PDF report for AI Interview sessions.
Mirrors the design language of the career-guidance PDF (pdf_service.py).
"""

import io
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Flowable, KeepTogether,
)

# Colour palette (self-contained to avoid import chain issues)
GREEN_800  = HexColor("#166534")
GREEN_700  = HexColor("#15803d")
GREEN_600  = HexColor("#16a34a")
GREEN_400  = HexColor("#4ade80")
GREEN_100  = HexColor("#dcfce7")
GREEN_50   = HexColor("#f0fdf4")
GREEN_200  = HexColor("#bbf7d0")
AMBER_500  = HexColor("#f59e0b")
AMBER_600  = HexColor("#d97706")
RED_500    = HexColor("#ef4444")
RED_600    = HexColor("#dc2626")
GRAY_700   = HexColor("#374151")
GRAY_600   = HexColor("#4b5563")
GRAY_400   = HexColor("#9ca3af")
GRAY_200   = HexColor("#e5e7eb")
GRAY_100   = HexColor("#f3f4f6")
WHITE      = HexColor("#ffffff")
BLACK      = HexColor("#111827")
INDIGO_600 = HexColor("#4f46e5")


def _md_to_rl(text: str) -> str:
    """Convert markdown bold/italic to ReportLab XML tags."""
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*\*(.+?)\*\*\*", r"<b><i>\1</i></b>", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<i>\1</i>", text)
    # Strip remaining markdown artifacts
    text = re.sub(r"#{1,6}\s*", "", text)
    text = re.sub(r"```[\s\S]*?```", "", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    return text


# ── Additional colours ──────────────────────────────────────────────────────
RED_600  = HexColor("#dc2626")
RED_100  = HexColor("#fee2e2")
RED_50   = HexColor("#fef2f2")
AMBER_100 = HexColor("#fef3c7")
AMBER_600 = HexColor("#d97706")
GREEN_200 = HexColor("#bbf7d0")


# ── Helpers ─────────────────────────────────────────────────────────────────

def _safe(text, max_len: int = 0) -> str:
    """Escape text for ReportLab Paragraph and optionally truncate."""
    if not text:
        return ""
    text = str(text)
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    if max_len and len(text) > max_len:
        text = text[:max_len] + "..."
    return text


def _strip_md(text: str) -> str:
    """Strip markdown syntax then escape for ReportLab Paragraphs.

    Removes **, *, #, ```, ``` blocks, but converts **bold** to <b> and
    *italic* to <i> via _md_to_rl, keeping rich formatting.
    """
    if not text:
        return ""
    text = str(text)
    # Remove code fences
    text = re.sub(r"```[\s\S]*?```", "", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    # Remove heading hashes
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    return _md_to_rl(text)


def _score_color(score: int):
    """Return (fill_color, label_color) for a given 0-100 score."""
    if score >= 70:
        return GREEN_700, GREEN_800
    elif score >= 50:
        return AMBER_500, AMBER_600
    else:
        return RED_600, RED_600


def _fmt_duration(seconds) -> str:
    """Format seconds as 'Xm Ys' or 'X min'."""
    if not seconds:
        return "N/A"
    try:
        s = int(seconds)
    except (TypeError, ValueError):
        return str(seconds)
    m, sec = divmod(s, 60)
    if sec:
        return f"{m}m {sec}s"
    return f"{m} min"


# ── Base styles ────────────────────────────────────────────────────────────

def _build_styles():
    """Create base ReportLab paragraph styles."""
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.enums import TA_LEFT, TA_CENTER

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("SectionHeading", parent=styles["Heading2"], fontSize=13, textColor=GREEN_800, spaceBefore=5*mm, spaceAfter=3*mm, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("BodyText2", parent=styles["Normal"], fontSize=10, textColor=GRAY_600, leading=15, leftIndent=4))
    styles.add(ParagraphStyle("BulletItem", parent=styles["Normal"], fontSize=10, textColor=GRAY_600, leading=14, leftIndent=14, bulletIndent=6, bulletFontSize=10))
    styles.add(ParagraphStyle("FooterText", parent=styles["Normal"], fontSize=8, textColor=GRAY_400, alignment=TA_CENTER))
    styles.add(ParagraphStyle("TableCell", parent=styles["Normal"], fontSize=9, textColor=GRAY_600, leading=13))
    styles.add(ParagraphStyle("TableHeader", parent=styles["Normal"], fontSize=9, textColor=WHITE, leading=13, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("MetaLabel", parent=styles["Normal"], fontSize=9, textColor=GRAY_400, spaceAfter=1*mm))
    styles.add(ParagraphStyle("MetaValue", parent=styles["Normal"], fontSize=10, textColor=GRAY_700, spaceAfter=1*mm))
    return styles


# ── Interview-specific styles ───────────────────────────────────────────────

def _interview_styles():
    """Extend the base styles with interview-specific paragraph styles."""
    styles = _build_styles()

    styles.add(ParagraphStyle(
        "VerdictLabel",
        parent=styles["Normal"],
        fontSize=14,
        textColor=GREEN_800,
        fontName="Helvetica-Bold",
        leading=18,
        spaceAfter=2 * mm,
    ))
    styles.add(ParagraphStyle(
        "VerdictDesc",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GRAY_600,
        leading=14,
        spaceAfter=2 * mm,
    ))
    styles.add(ParagraphStyle(
        "QuestionTitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GREEN_800,
        fontName="Helvetica-Bold",
        leading=14,
        spaceAfter=1 * mm,
    ))
    styles.add(ParagraphStyle(
        "AnswerSummary",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GRAY_700,
        leading=13,
        leftIndent=4,
        spaceAfter=1 * mm,
    ))
    styles.add(ParagraphStyle(
        "StrengthBullet",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GREEN_700,
        leading=12,
        leftIndent=14,
        bulletIndent=6,
        bulletFontSize=9,
    ))
    styles.add(ParagraphStyle(
        "WeaknessBullet",
        parent=styles["Normal"],
        fontSize=9,
        textColor=AMBER_600,
        leading=12,
        leftIndent=14,
        bulletIndent=6,
        bulletFontSize=9,
    ))
    styles.add(ParagraphStyle(
        "IdealBox",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GREEN_800,
        leading=13,
        leftIndent=6,
        rightIndent=6,
    ))
    styles.add(ParagraphStyle(
        "BetterWord",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GRAY_600,
        leading=12,
        leftIndent=14,
        bulletIndent=6,
    ))
    styles.add(ParagraphStyle(
        "PlanTitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=BLACK,
        fontName="Helvetica-Bold",
        leading=14,
    ))
    styles.add(ParagraphStyle(
        "PlanMeta",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GREEN_700,
        leading=12,
        leftIndent=4,
    ))
    styles.add(ParagraphStyle(
        "PlanStep",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GRAY_600,
        leading=13,
        leftIndent=14,
        bulletIndent=6,
        bulletFontSize=9,
    ))
    styles.add(ParagraphStyle(
        "MetricLabel",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GRAY_400,
        leading=12,
    ))
    styles.add(ParagraphStyle(
        "MetricValue",
        parent=styles["Normal"],
        fontSize=11,
        textColor=GRAY_700,
        fontName="Helvetica-Bold",
        leading=14,
    ))

    return styles


# ── Custom Flowables ────────────────────────────────────────────────────────

class InterviewHeaderBanner(Flowable):
    """Full-width green header banner for interview reports."""

    def __init__(self, user_name: str, college: str, job_role: str,
                 date_str: str, duration_str: str, width: float):
        super().__init__()
        self.user_name = user_name or ""
        self.college = college or ""
        self.job_role = job_role or ""
        self.date_str = date_str or ""
        self.duration_str = duration_str or ""
        self.width = width
        self.height = 42 * mm

    def wrap(self, availWidth, availHeight):
        return self.width, self.height

    def draw(self):
        c = self.canv
        w, h = float(self.width), float(self.height)

        # Background
        c.setFillColor(GREEN_800)
        c.roundRect(0, 0, w, h, 6, fill=1, stroke=0)

        # Decorative circles (top-right)
        c.setFillColor(GREEN_700)
        c.circle(w - 10, h + 5, 40, fill=1, stroke=0)
        c.setFillColor(GREEN_600)
        c.circle(w - 5, h - 10, 22, fill=1, stroke=0)

        # IKLAVYA title
        c.setFont("Helvetica-Bold", 22)
        c.setFillColor(WHITE)
        c.drawString(8 * mm, h - 12 * mm, "IKLAVYA")

        # Subtitle
        c.setFont("Helvetica", 10)
        c.setFillColor(GREEN_100)
        c.drawString(8 * mm, h - 18 * mm, "AI Interview Performance Report")

        # Divider
        c.setStrokeColor(GREEN_600)
        c.setLineWidth(0.5)
        c.line(8 * mm, h - 21 * mm, w - 8 * mm, h - 21 * mm)

        # Student name
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(WHITE)
        c.drawString(8 * mm, h - 27 * mm, self.user_name[:50])

        # College
        c.setFont("Helvetica", 8)
        c.setFillColor(GREEN_100)
        c.drawString(8 * mm, h - 32 * mm, self.college[:60])

        # Job role + date + duration on the bottom line
        details = f"Role: {self.job_role[:40]}"
        if self.date_str:
            details += f"  |  {self.date_str}"
        if self.duration_str:
            details += f"  |  Duration: {self.duration_str}"
        c.setFont("Helvetica", 8)
        c.setFillColor(GREEN_100)
        c.drawString(8 * mm, h - 37 * mm, details[:90])


class ScoreRing(Flowable):
    """Circular arc score indicator with the score number centred inside."""

    def __init__(self, score: int, size: float = 28 * mm):
        super().__init__()
        self.score = max(0, min(100, score))
        self.size = size
        self.height = size
        self.width = size

    def wrap(self, availWidth, availHeight):
        return self.size, self.size

    def draw(self):
        c = self.canv
        s = float(self.size)
        cx, cy = s / 2, s / 2
        r = s / 2 - 3 * mm

        fill_color, _ = _score_color(self.score)

        # Background track (full circle)
        c.setStrokeColor(GRAY_200)
        c.setLineWidth(4)
        c.circle(cx, cy, float(r), fill=0, stroke=1)

        # Score arc — draw from 90 degrees (top), sweeping clockwise
        if self.score > 0:
            sweep = 360 * self.score / 100
            c.setStrokeColor(fill_color)
            c.setLineWidth(4)
            # ReportLab arc: x1, y1, x2, y2, startAngle, extent
            pad = 3 * mm
            c.arc(pad, pad, s - pad, s - pad, 90, -sweep)

        # Score number
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(fill_color)
        c.drawCentredString(cx, cy - 5, str(self.score))

        # "/100" label
        c.setFont("Helvetica", 7)
        c.setFillColor(GRAY_400)
        c.drawCentredString(cx, cy - 13, "/100")


class ScoreBarChart(Flowable):
    """Horizontal bar chart for score dimensions (like CareerMatchChart)."""

    def __init__(self, scores: dict, width: float = 160 * mm):
        super().__init__()
        self.scores = scores or {}
        self.chart_width = width
        self.bar_height = 14
        self.gap = 10
        self.label_width = 48 * mm
        self.score_width = 12 * mm
        self.bar_area = width - self.label_width - self.score_width - 4 * mm
        items = list(self.scores.items())[:8]
        self.items = items
        self.height = len(items) * (self.bar_height + self.gap) + 10

    def wrap(self, availWidth, availHeight):
        return self.chart_width, self.height

    def draw(self):
        c = self.canv
        y = self.height - 5

        # Friendly label map
        label_map = {
            "confidence": "Confidence",
            "clarity": "Clarity",
            "structure": "Structure",
            "persuasiveness": "Persuasiveness",
            "pace": "Pace",
            "domain_knowledge": "Domain Knowledge",
            "communication": "Communication",
            "body_language": "Body Language",
            "technical_depth": "Technical Depth",
        }

        for i, (key, val) in enumerate(self.items):
            bar_y = y - i * (self.bar_height + self.gap)
            score = max(0, min(100, int(val)))
            label = label_map.get(key, key.replace("_", " ").title())[:28]

            fill_color, _ = _score_color(score)

            # Label
            c.setFont("Helvetica", 9)
            c.setFillColor(GRAY_700)
            c.drawString(0, bar_y - 2, label)

            # Background track
            track_x = float(self.label_width)
            c.setFillColor(GRAY_200)
            c.roundRect(
                track_x, bar_y - self.bar_height + 4,
                float(self.bar_area), float(self.bar_height - 4),
                3, fill=1, stroke=0,
            )

            # Filled bar
            bar_fill_w = float(self.bar_area) * score / 100
            if bar_fill_w > 0:
                c.setFillColor(fill_color)
                c.roundRect(
                    track_x, bar_y - self.bar_height + 4,
                    bar_fill_w, float(self.bar_height - 4),
                    3, fill=1, stroke=0,
                )
                # Highlight strip (lighter top)
                c.setFillColor(GREEN_400 if score >= 70 else (
                    HexColor("#fcd34d") if score >= 50 else HexColor("#fca5a5")
                ))
                c.roundRect(
                    track_x,
                    bar_y - self.bar_height + 4 + (self.bar_height - 4) * 0.6,
                    bar_fill_w,
                    (self.bar_height - 4) * 0.35,
                    2, fill=1, stroke=0,
                )

            # Score label
            score_x = track_x + float(self.bar_area) + 3 * mm
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(fill_color)
            c.drawString(float(score_x), bar_y - 2, f"{score}%")


class ImprovementTimeline(Flowable):
    """Step timeline for improvement plan items (mirrors RoadmapTimeline)."""

    def __init__(self, plan: list, width: float = 160 * mm):
        super().__init__()
        self.plan = plan or []
        self.width = width
        self.step_height = 56
        self.circle_r = 10
        self.height = len(self.plan) * self.step_height + 10

    def wrap(self, availWidth, availHeight):
        return self.width, self.height

    def draw(self):
        c = self.canv
        cx = float(self.circle_r + 2)

        for i, item in enumerate(self.plan):
            step_y = self.height - 10 - i * self.step_height
            priority = item.get("priority", i + 1)
            area = str(item.get("area", ""))[:50]
            current = str(item.get("current_state", ""))[:60]
            target = str(item.get("target", ""))[:60]
            steps = item.get("action_steps", [])

            # Connector line (except last)
            if i < len(self.plan) - 1:
                c.setStrokeColor(GREEN_100)
                c.setLineWidth(2)
                c.line(cx, step_y - self.circle_r,
                       cx, step_y - self.step_height + self.circle_r)

            # Circle
            c.setFillColor(GREEN_800)
            c.setStrokeColor(WHITE)
            c.setLineWidth(1.5)
            c.circle(cx, step_y, float(self.circle_r), fill=1, stroke=1)

            # Priority number
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(WHITE)
            c.drawCentredString(cx, step_y - 3.5, str(priority))

            text_x = float(cx + self.circle_r + 5)
            max_text_w = float(self.width - text_x - 4)

            # Area title
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(BLACK)
            c.drawString(text_x, step_y + 2, area)

            # Current -> Target
            if current or target:
                c.setFont("Helvetica", 8)
                c.setFillColor(GREEN_700)
                progress_text = ""
                if current and target:
                    progress_text = f"{current}  ->  {target}"
                elif current:
                    progress_text = f"Current: {current}"
                elif target:
                    progress_text = f"Target: {target}"
                # Truncate to fit
                while (c.stringWidth(progress_text, "Helvetica", 8) > max_text_w
                       and len(progress_text) > 10):
                    progress_text = progress_text[:-4] + "..."
                c.drawString(text_x, step_y - 10, progress_text)

            # Action steps (up to 2, single line each)
            c.setFont("Helvetica", 8)
            c.setFillColor(GRAY_600)
            for si, step_text in enumerate(steps[:2]):
                step_text = str(step_text)[:100]
                # Truncate to fit width
                display = step_text
                while (c.stringWidth(f"  - {display}", "Helvetica", 8) > max_text_w
                       and len(display) > 10):
                    display = display[:-4] + "..."
                c.drawString(text_x, step_y - 22 - si * 10, f"  - {display}")


class QuestionScoreBar(Flowable):
    """Small inline horizontal score bar for a single question."""

    def __init__(self, score: int, width: float = 60 * mm, height: float = 5 * mm):
        super().__init__()
        self.score = max(0, min(100, int(score)))
        self.bar_width = width
        self.bar_height = height
        self.height = height + 2 * mm
        self.width = width + 14 * mm

    def wrap(self, availWidth, availHeight):
        return self.width, self.height

    def draw(self):
        c = self.canv
        fill_color, label_color = _score_color(self.score)
        bh = float(self.bar_height)
        bw = float(self.bar_width)
        y_off = 1 * mm

        # Track
        c.setFillColor(GRAY_200)
        c.roundRect(0, float(y_off), bw, bh, 2, fill=1, stroke=0)

        # Fill
        fill_w = bw * self.score / 100
        if fill_w > 0:
            c.setFillColor(fill_color)
            c.roundRect(0, float(y_off), fill_w, bh, 2, fill=1, stroke=0)

        # Score label
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(label_color)
        c.drawString(bw + 2 * mm, float(y_off) + 0.5, f"{self.score}/100")


# ── Main PDF generator ──────────────────────────────────────────────────────

def generate_interview_pdf(user, session, report_data: dict) -> bytes:
    """Generate a visually-rich PDF interview performance report.

    Parameters
    ----------
    user : User model instance
    session : InterviewSession model instance
    report_data : dict — parsed JSON from the AI analysis
    """
    buffer = io.BytesIO()
    usable_w = A4[0] - 40 * mm

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=12 * mm,
        bottomMargin=20 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
    )

    styles = _interview_styles()
    elements: list = []

    # Safe data access
    data = report_data or {}

    # ── 1. Header Banner ────────────────────────────────────────────────────
    date_str = ""
    if hasattr(session, "started_at") and session.started_at:
        date_str = str(session.started_at)[:10]
    elif hasattr(session, "created_at") and session.created_at:
        date_str = str(session.created_at)[:10]

    duration_str = _fmt_duration(
        getattr(session, "duration_seconds", None)
    )

    elements.append(InterviewHeaderBanner(
        user_name=getattr(user, "name", ""),
        college=getattr(user, "college", ""),
        job_role=getattr(session, "job_role", ""),
        date_str=date_str,
        duration_str=duration_str,
        width=usable_w,
    ))
    elements.append(Spacer(1, 6 * mm))

    # ── 2. Overall Score + Verdict ──────────────────────────────────────────
    overall_score = data.get("overall_score")
    verdict_label = data.get("verdict_label", "")
    verdict_desc = data.get("verdict_description", "")

    if overall_score is not None:
        elements.append(Paragraph("Overall Performance", styles["SectionHeading"]))

        # Build a table with ScoreRing on the left and verdict text on the right
        score_ring = ScoreRing(int(overall_score), size=28 * mm)

        verdict_parts = []
        if verdict_label:
            _, label_clr = _score_color(int(overall_score))
            # Colour the verdict label according to score
            color_hex = {
                GREEN_800: "#166534",
                AMBER_600: "#d97706",
                RED_600: "#dc2626",
            }.get(label_clr, "#166534")
            verdict_parts.append(
                Paragraph(
                    f'<font color="{color_hex}"><b>{_safe(verdict_label, 60)}</b></font>',
                    styles["VerdictLabel"],
                )
            )
        if verdict_desc:
            verdict_parts.append(
                Paragraph(_strip_md(verdict_desc[:500]), styles["VerdictDesc"])
            )

        # Spacer + combined paragraph for the right column
        right_cell = verdict_parts if verdict_parts else [Spacer(1, 1)]

        score_table = Table(
            [[score_ring, right_cell]],
            colWidths=[32 * mm, usable_w - 34 * mm],
        )
        score_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        elements.append(score_table)
        elements.append(Spacer(1, 5 * mm))

    # ── 3. Score Breakdown Chart ────────────────────────────────────────────
    scores = data.get("scores")
    if scores and isinstance(scores, dict):
        elements.append(Paragraph("Score Breakdown", styles["SectionHeading"]))
        elements.append(ScoreBarChart(scores, width=usable_w))
        elements.append(Spacer(1, 5 * mm))

    # ── 4. Communication Metrics ────────────────────────────────────────────
    comm = data.get("communication_metrics")
    if comm and isinstance(comm, dict):
        elements.append(Paragraph("Communication Metrics", styles["SectionHeading"]))

        metric_items = [
            ("Avg Answer Length", f"{comm.get('avg_answer_length_words', 'N/A')} words"),
            ("Vocabulary Richness", str(comm.get("vocabulary_richness", "N/A")).title()),
            ("Stammering Frequency", str(comm.get("stammering_frequency", "N/A")).title()),
        ]

        # Build as a metric row table
        header_cells = []
        value_cells = []
        for label, val in metric_items:
            header_cells.append(Paragraph(_safe(label), styles["MetricLabel"]))
            value_cells.append(Paragraph(_safe(val), styles["MetricValue"]))

        col_w = usable_w / len(metric_items)
        metrics_table = Table(
            [header_cells, value_cells],
            colWidths=[col_w] * len(metric_items),
        )
        metrics_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BACKGROUND", (0, 0), (-1, -1), GREEN_50),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("ROUNDEDCORNERS", [4]),
            ("BOX", (0, 0), (-1, -1), 0.4, GRAY_200),
        ]))
        elements.append(metrics_table)

        # Stammering details
        stammer_details = comm.get("stammering_details")
        if stammer_details:
            elements.append(Spacer(1, 2 * mm))
            elements.append(
                Paragraph(
                    f"<i>{_strip_md(str(stammer_details)[:300])}</i>",
                    styles["BodyText2"],
                )
            )

        elements.append(Spacer(1, 5 * mm))

    # ── 5. Filler Word Analysis ─────────────────────────────────────────────
    filler = data.get("filler_analysis")
    if filler and isinstance(filler, dict):
        elements.append(Paragraph("Filler Word Analysis", styles["SectionHeading"]))

        # Summary line: total fillers + fillers per minute
        total = filler.get("total_fillers", "N/A")
        fpm = filler.get("fillers_per_minute", "N/A")
        if isinstance(fpm, float):
            fpm = f"{fpm:.2f}"
        elements.append(
            Paragraph(
                f"Total filler words: <b>{_safe(str(total))}</b>  |  "
                f"Fillers per minute: <b>{_safe(str(fpm))}</b>",
                styles["BodyText2"],
            )
        )
        elements.append(Spacer(1, 2 * mm))

        # Filler breakdown table
        breakdown = filler.get("breakdown", [])
        if breakdown and isinstance(breakdown, list):
            table_data = [[
                Paragraph("Word", styles["TableHeader"]),
                Paragraph("Count", styles["TableHeader"]),
                Paragraph("Better Alternative", styles["TableHeader"]),
            ]]
            for entry in breakdown[:10]:
                if not isinstance(entry, dict):
                    continue
                word = _safe(str(entry.get("word", "")), 30)
                count = _safe(str(entry.get("count", "")), 10)
                suggestion = _strip_md(str(entry.get("suggestion", "")))
                if len(suggestion) > 120:
                    suggestion = suggestion[:120] + "..."
                table_data.append([
                    Paragraph(f"<b>{word}</b>", styles["TableCell"]),
                    Paragraph(count, styles["TableCell"]),
                    Paragraph(suggestion, styles["TableCell"]),
                ])

            if len(table_data) > 1:
                filler_table = Table(
                    table_data,
                    colWidths=[usable_w * 0.15, usable_w * 0.12, usable_w * 0.73],
                )
                filler_table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), GREEN_800),
                    ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("ALIGN", (1, 0), (1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("GRID", (0, 0), (-1, -1), 0.4, GRAY_200),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, GREEN_50]),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("ROUNDEDCORNERS", [3]),
                ]))
                elements.append(filler_table)

        elements.append(Spacer(1, 5 * mm))

    # ── 6. Question-by-Question Breakdown ───────────────────────────────────
    questions = data.get("question_breakdown", [])
    if questions and isinstance(questions, list):
        elements.append(Paragraph("Question-by-Question Breakdown", styles["SectionHeading"]))

        for qi, q in enumerate(questions):
            if not isinstance(q, dict):
                continue

            q_parts: list = []

            # Question number + text
            q_idx = q.get("question_index", qi)
            q_text = _strip_md(str(q.get("question_text", "")))
            if len(q_text) > 300:
                q_text = q_text[:300] + "..."
            q_parts.append(Paragraph(
                f"Q{q_idx + 1}. {q_text}",
                styles["QuestionTitle"],
            ))

            # Score bar
            q_score = q.get("score")
            if q_score is not None:
                q_parts.append(QuestionScoreBar(int(q_score), width=55 * mm))

            # Student answer summary
            answer = q.get("student_answer_summary", "")
            if answer:
                answer_text = _strip_md(str(answer))
                if len(answer_text) > 400:
                    answer_text = answer_text[:400] + "..."
                q_parts.append(Paragraph(
                    f"<b>Your Answer:</b> {answer_text}",
                    styles["AnswerSummary"],
                ))

            # Strengths
            strengths = q.get("strengths", [])
            if strengths and isinstance(strengths, list):
                q_parts.append(Spacer(1, 1 * mm))
                q_parts.append(Paragraph(
                    "<b>Strengths:</b>", styles["AnswerSummary"],
                ))
                for s in strengths[:5]:
                    q_parts.append(Paragraph(
                        _strip_md(str(s)[:150]),
                        styles["StrengthBullet"],
                        bulletText="\u2713",
                    ))

            # Weaknesses
            weaknesses = q.get("weaknesses", [])
            if weaknesses and isinstance(weaknesses, list):
                q_parts.append(Spacer(1, 1 * mm))
                q_parts.append(Paragraph(
                    "<b>Areas to Improve:</b>", styles["AnswerSummary"],
                ))
                for w in weaknesses[:5]:
                    q_parts.append(Paragraph(
                        _strip_md(str(w)[:150]),
                        styles["WeaknessBullet"],
                        bulletText="\u2022",
                    ))

            # Ideal answer outline (green-tinted box)
            ideal = q.get("ideal_answer_outline", "")
            if ideal:
                ideal_text = _strip_md(str(ideal))
                if len(ideal_text) > 500:
                    ideal_text = ideal_text[:500] + "..."
                q_parts.append(Spacer(1, 1 * mm))
                ideal_box_content = Paragraph(
                    f"<b>Ideal Answer:</b> {ideal_text}",
                    styles["IdealBox"],
                )
                ideal_table = Table(
                    [[ideal_box_content]],
                    colWidths=[usable_w - 4 * mm],
                )
                ideal_table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), GREEN_50),
                    ("BOX", (0, 0), (-1, -1), 0.4, GREEN_400),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("ROUNDEDCORNERS", [3]),
                ]))
                q_parts.append(ideal_table)

            # Better words
            better = q.get("better_words", [])
            if better and isinstance(better, list):
                q_parts.append(Spacer(1, 1 * mm))
                q_parts.append(Paragraph(
                    "<b>Better Words:</b>", styles["AnswerSummary"],
                ))
                for bw in better[:6]:
                    q_parts.append(Paragraph(
                        _strip_md(str(bw)[:80]),
                        styles["BetterWord"],
                        bulletText="\u2192",
                    ))

            # Separator between questions (not after the last)
            if qi < len(questions) - 1:
                q_parts.append(Spacer(1, 2 * mm))
                q_parts.append(HRFlowable(
                    width="100%", thickness=0.3,
                    color=GRAY_200, spaceAfter=2 * mm,
                ))

            # Keep question block together when possible
            elements.append(KeepTogether(q_parts))

        elements.append(Spacer(1, 5 * mm))

    # ── 7. Improvement Plan ─────────────────────────────────────────────────
    plan = data.get("improvement_plan", [])
    if plan and isinstance(plan, list):
        elements.append(Paragraph("Improvement Plan", styles["SectionHeading"]))
        elements.append(ImprovementTimeline(plan, width=usable_w))
        elements.append(Spacer(1, 5 * mm))

    # ── 8. Footer ───────────────────────────────────────────────────────────
    elements.append(Spacer(1, 8 * mm))
    elements.append(HRFlowable(
        width="100%", thickness=0.5, color=GRAY_200, spaceAfter=3 * mm,
    ))
    elements.append(Paragraph(
        "Generated by IKLAVYA AI Interview Platform  \u00b7  Confidential",
        styles["FooterText"],
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()

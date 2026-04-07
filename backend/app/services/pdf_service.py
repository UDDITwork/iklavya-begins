import io
import json
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Flowable,
)
from reportlab.graphics.shapes import (
    Drawing as GDrawing, Rect, String, Line, Circle, Group,
)
from reportlab.graphics import renderPDF
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT


# ── Colour palette ──────────────────────────────────────────────────────────
GREEN_800  = HexColor("#166534")
GREEN_700  = HexColor("#15803d")
GREEN_600  = HexColor("#16a34a")
GREEN_400  = HexColor("#4ade80")
GREEN_100  = HexColor("#dcfce7")
GREEN_50   = HexColor("#f0fdf4")
AMBER_500  = HexColor("#f59e0b")
GRAY_700   = HexColor("#374151")
GRAY_600   = HexColor("#4b5563")
GRAY_400   = HexColor("#9ca3af")
GRAY_200   = HexColor("#e5e7eb")
GRAY_100   = HexColor("#f3f4f6")
WHITE      = HexColor("#ffffff")
BLACK      = HexColor("#111827")


# ── Styles ───────────────────────────────────────────────────────────────────
def _build_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=26,
        textColor=WHITE,
        alignment=TA_LEFT,
        spaceAfter=2 * mm,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=GREEN_100,
        alignment=TA_LEFT,
        spaceAfter=0,
    ))
    styles.add(ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GRAY_400,
        spaceAfter=1 * mm,
    ))
    styles.add(ParagraphStyle(
        "MetaValue",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GRAY_700,
        spaceAfter=1 * mm,
    ))
    styles.add(ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=GREEN_800,
        spaceBefore=5 * mm,
        spaceAfter=3 * mm,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "BodyText2",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GRAY_600,
        leading=15,
        leftIndent=4,
    ))
    styles.add(ParagraphStyle(
        "BulletItem",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GRAY_600,
        leading=14,
        leftIndent=14,
        bulletIndent=6,
        bulletFontSize=10,
    ))
    styles.add(ParagraphStyle(
        "FooterText",
        parent=styles["Normal"],
        fontSize=8,
        textColor=GRAY_400,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GRAY_600,
        leading=13,
    ))
    styles.add(ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontSize=9,
        textColor=WHITE,
        leading=13,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "CareerTitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=BLACK,
        fontName="Helvetica-Bold",
        leading=13,
    ))
    styles.add(ParagraphStyle(
        "CareerReason",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GRAY_600,
        leading=13,
        leftIndent=4,
    ))
    styles.add(ParagraphStyle(
        "RoadmapStep",
        parent=styles["Normal"],
        fontSize=10,
        textColor=BLACK,
        fontName="Helvetica-Bold",
        leading=13,
    ))
    styles.add(ParagraphStyle(
        "RoadmapTimeline",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GREEN_700,
        leading=12,
        leftIndent=4,
    ))
    styles.add(ParagraphStyle(
        "RoadmapDesc",
        parent=styles["Normal"],
        fontSize=9,
        textColor=GRAY_600,
        leading=13,
        leftIndent=4,
    ))

    return styles


# ── SVG-style chart helpers using ReportLab Drawing ─────────────────────────

class CareerMatchChart(Flowable):
    """Horizontal bar chart for career match scores."""

    def __init__(self, careers: list, width: float = 160 * mm):
        super().__init__()
        self.careers = careers[:6]  # max 6 bars
        self.chart_width = width
        self.bar_height = 14
        self.gap = 10
        self.label_width = 52 * mm
        self.score_width = 12 * mm
        self.bar_area = width - self.label_width - self.score_width - 4 * mm
        self.height = len(self.careers) * (self.bar_height + self.gap) + 10

    def wrap(self, availWidth, availHeight):
        return self.chart_width, self.height

    def draw(self):
        c = self.canv
        y = self.height - 5

        for i, career in enumerate(self.careers):
            bar_y = y - i * (self.bar_height + self.gap)
            score = max(0, min(100, int(career.get("match_score", 0))))
            title = career.get("title", "")[:28]

            # Label
            c.setFont("Helvetica", 9)
            c.setFillColor(GRAY_700)
            c.drawString(0, bar_y - 2, title)

            # Background track
            track_x = float(self.label_width)
            c.setFillColor(GRAY_200)
            c.roundRect(track_x, bar_y - self.bar_height + 4, float(self.bar_area), float(self.bar_height - 4), 3, fill=1, stroke=0)

            # Filled bar — gradient effect via two overlapping rects
            bar_fill_w = float(self.bar_area) * score / 100
            if bar_fill_w > 0:
                c.setFillColor(GREEN_700)
                c.roundRect(track_x, bar_y - self.bar_height + 4, bar_fill_w, float(self.bar_height - 4), 3, fill=1, stroke=0)
                # Highlight strip (lighter top)
                c.setFillColor(GREEN_400)
                c.roundRect(track_x, bar_y - self.bar_height + 4 + (self.bar_height - 4) * 0.6, bar_fill_w, (self.bar_height - 4) * 0.35, 2, fill=1, stroke=0)

            # Score label
            score_x = track_x + float(self.bar_area) + 3 * mm
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(GREEN_800)
            c.drawString(float(score_x), bar_y - 2, f"{score}%")


class RoadmapTimeline(Flowable):
    """Visual step timeline for roadmap."""

    def __init__(self, steps: list, width: float = 160 * mm):
        super().__init__()
        self.steps = steps
        self.width = width
        self.step_height = 44
        self.circle_r = 10
        self.height = len(steps) * self.step_height + 10

    def wrap(self, availWidth, availHeight):
        return self.width, self.height

    def draw(self):
        c = self.canv
        cx = float(self.circle_r + 2)

        for i, step in enumerate(self.steps):
            step_y = self.height - 10 - i * self.step_height
            order = step.get("order", i + 1)
            title = step.get("title", "")[:50]
            timeline = step.get("timeline", "")[:30]
            desc = step.get("description", "")[:90]

            # Connector line (except last)
            if i < len(self.steps) - 1:
                c.setStrokeColor(GREEN_100)
                c.setLineWidth(2)
                c.line(cx, step_y - self.circle_r, cx, step_y - self.step_height + self.circle_r)

            # Circle
            c.setFillColor(GREEN_800)
            c.setStrokeColor(WHITE)
            c.setLineWidth(1.5)
            c.circle(cx, step_y, float(self.circle_r), fill=1, stroke=1)

            # Step number
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(WHITE)
            c.drawCentredString(cx, step_y - 3.5, str(order))

            # Title
            text_x = float(cx + self.circle_r + 5)
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(BLACK)
            c.drawString(text_x, step_y + 2, title)

            # Timeline tag
            if timeline:
                c.setFont("Helvetica", 8)
                c.setFillColor(GREEN_700)
                c.drawString(text_x, step_y - 9, timeline)

            # Description
            if desc:
                c.setFont("Helvetica", 8.5)
                c.setFillColor(GRAY_600)
                # Simple word-wrap for description (max 2 lines)
                words = desc.split()
                lines_text = []
                current = ""
                for w in words:
                    test = (current + " " + w).strip()
                    if c.stringWidth(test, "Helvetica", 8.5) < float(self.width - text_x - 4):
                        current = test
                    else:
                        if current:
                            lines_text.append(current)
                        current = w
                    if len(lines_text) >= 2:
                        break
                if current and len(lines_text) < 2:
                    lines_text.append(current)
                for li, line_t in enumerate(lines_text[:2]):
                    c.drawString(text_x, step_y - 19 - li * 11, line_t)


# ── Markdown → ReportLab helpers ─────────────────────────────────────────────

def _md_to_rl(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*\*(.+?)\*\*\*", r"<b><i>\1</i></b>", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<i>\1</i>", text)
    return text


def _parse_md_segments(lines):
    segments = []
    current_table = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("|") and stripped.endswith("|"):
            current_table.append(stripped)
        else:
            if current_table:
                segments.append(("table", current_table))
                current_table = []
            segments.append(("line", stripped))
    if current_table:
        segments.append(("table", current_table))
    return segments


# ── Header banner Flowable ────────────────────────────────────────────────────

class HeaderBanner(Flowable):
    """Full-width green header banner."""

    def __init__(self, user_name: str, college: str, session_title: str, session_date: str, width: float):
        super().__init__()
        self.user_name = user_name
        self.college = college
        self.session_title = session_title
        self.session_date = session_date
        self.width = width
        self.height = 38 * mm

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
        c.drawString(8 * mm, h - 14 * mm, "IKLAVYA")

        # Subtitle
        c.setFont("Helvetica", 10)
        c.setFillColor(GREEN_100)
        c.drawString(8 * mm, h - 20 * mm, "AI Career Guidance Report")

        # Divider
        c.setStrokeColor(GREEN_600)
        c.setLineWidth(0.5)
        c.line(8 * mm, h - 23 * mm, w - 8 * mm, h - 23 * mm)

        # Student info
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(WHITE)
        c.drawString(8 * mm, h - 29 * mm, self.user_name)

        c.setFont("Helvetica", 9)
        c.setFillColor(GREEN_200 if hasattr(self, "_") else GREEN_100)
        details = f"{self.college}  ·  {self.session_title}  ·  {self.session_date}"
        c.drawString(8 * mm, h - 34 * mm, details[:80])


# ── Main PDF generator ────────────────────────────────────────────────────────

def generate_pdf_report(user, session, analysis) -> bytes:
    """Generate a visually-rich PDF career analysis report."""
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

    styles = _build_styles()
    elements = []

    # ── Header banner ──
    elements.append(HeaderBanner(
        user_name=user.name,
        college=getattr(user, "college", ""),
        session_title=session.title,
        session_date=session.started_at[:10] if session.started_at else "",
        width=usable_w,
    ))
    elements.append(Spacer(1, 6 * mm))

    # ── Career Match Chart ──
    if analysis.analysis_json:
        try:
            data = json.loads(analysis.analysis_json)
            careers = data.get("top_careers", [])
            if careers:
                elements.append(Paragraph("Top Career Matches", styles["SectionHeading"]))
                elements.append(CareerMatchChart(careers, width=usable_w))
                elements.append(Spacer(1, 4 * mm))

                # Reason table below chart
                reason_data = [[
                    Paragraph("Career", styles["TableHeader"]),
                    Paragraph("Match", styles["TableHeader"]),
                    Paragraph("Why It Fits", styles["TableHeader"]),
                ]]
                for c in careers:
                    reason_data.append([
                        Paragraph(c.get("title", ""), styles["CareerTitle"]),
                        Paragraph(f"{c.get('match_score', '')}%", styles["TableCell"]),
                        Paragraph(c.get("reason", ""), styles["CareerReason"]),
                    ])
                t = Table(reason_data, colWidths=[usable_w * 0.23, usable_w * 0.10, usable_w * 0.67])
                t.setStyle(TableStyle([
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
                elements.append(t)
                elements.append(Spacer(1, 5 * mm))
        except (json.JSONDecodeError, TypeError):
            pass

    # ── Analysis Markdown ──
    if analysis.analysis_markdown:
        elements.append(HRFlowable(width="100%", thickness=0.5, color=GRAY_200, spaceAfter=3 * mm))
        raw_lines = analysis.analysis_markdown.strip().split("\n")
        segments = _parse_md_segments(raw_lines)
        for seg_type, seg_data in segments:
            if seg_type == "table":
                table_rows = []
                for idx, row_str in enumerate(seg_data):
                    cells = [c.strip() for c in row_str.strip("|").split("|")]
                    if all(re.match(r"^[-:]+$", c) for c in cells):
                        continue
                    row = [
                        Paragraph(_md_to_rl(c), styles["TableHeader"] if idx == 0 else styles["TableCell"])
                        for c in cells
                    ]
                    table_rows.append(row)
                if table_rows:
                    ncols = len(table_rows[0])
                    col_w = usable_w / ncols
                    md_table = Table(table_rows, colWidths=[col_w] * ncols)
                    md_table.setStyle(TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), GREEN_800),
                        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("GRID", (0, 0), (-1, -1), 0.4, GRAY_200),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, GREEN_50]),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ("LEFTPADDING", (0, 0), (-1, -1), 6),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ]))
                    elements.append(Spacer(1, 2 * mm))
                    elements.append(md_table)
                    elements.append(Spacer(1, 2 * mm))
            else:
                stripped = seg_data
                if not stripped:
                    elements.append(Spacer(1, 2 * mm))
                elif stripped.startswith("### ") or stripped.startswith("## ") or stripped.startswith("# "):
                    heading_text = re.sub(r"^#{1,3}\s", "", stripped)
                    elements.append(Paragraph(_md_to_rl(heading_text), styles["SectionHeading"]))
                elif stripped.startswith("- ") or stripped.startswith("* "):
                    elements.append(Paragraph(_md_to_rl(stripped[2:]), styles["BulletItem"], bulletText="\u2022"))
                elif re.match(r"^\d+\.\s", stripped):
                    m = re.match(r"^(\d+)\.\s(.*)", stripped)
                    elements.append(Paragraph(_md_to_rl(m.group(2)), styles["BulletItem"], bulletText=f"{m.group(1)}."))
                else:
                    elements.append(Paragraph(_md_to_rl(stripped), styles["BodyText2"]))

    # ── Roadmap Timeline ──
    if analysis.roadmap_json:
        try:
            roadmap = json.loads(analysis.roadmap_json)
            steps = roadmap.get("steps", [])
            if steps:
                elements.append(Spacer(1, 4 * mm))
                elements.append(Paragraph("Your Career Roadmap", styles["SectionHeading"]))
                elements.append(RoadmapTimeline(steps, width=usable_w))
        except (json.JSONDecodeError, TypeError):
            pass

    # ── Footer ──
    elements.append(Spacer(1, 8 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GRAY_200, spaceAfter=3 * mm))
    elements.append(Paragraph(
        "Generated by IKLAVYA AI Career Guidance Platform · Confidential",
        styles["FooterText"],
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()

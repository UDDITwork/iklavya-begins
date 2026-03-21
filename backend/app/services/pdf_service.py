import io
import json
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER


GREEN_800 = HexColor("#166534")
GREEN_50 = HexColor("#F0FDF4")
GRAY_600 = HexColor("#4B5563")
GRAY_400 = HexColor("#9CA3AF")
WHITE = HexColor("#FFFFFF")


def _md_to_rl(text: str) -> str:
    """Convert markdown inline formatting to ReportLab XML tags."""
    # Escape XML special chars first
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # Bold+Italic (must come before bold and italic)
    text = re.sub(r"\*\*\*(.+?)\*\*\*", r"<b><i>\1</i></b>", text)
    # Bold
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    # Italic
    text = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<i>\1</i>", text)
    return text


def _parse_md_segments(lines):
    """Group lines into regular lines and markdown table blocks."""
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


def _build_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=22,
        textColor=GREEN_800,
        spaceAfter=4 * mm,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=GRAY_400,
        alignment=TA_CENTER,
        spaceAfter=8 * mm,
    ))
    styles.add(ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=GREEN_800,
        spaceBefore=6 * mm,
        spaceAfter=3 * mm,
        borderPadding=(0, 0, 0, 4),
        leftIndent=8,
    ))
    styles.add(ParagraphStyle(
        "BodyText2",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GRAY_600,
        leading=14,
        leftIndent=8,
    ))
    styles.add(ParagraphStyle(
        "BulletItem",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GRAY_600,
        leading=14,
        leftIndent=16,
        bulletIndent=8,
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
        leading=12,
    ))
    styles.add(ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontSize=9,
        textColor=WHITE,
        leading=12,
        fontName="Helvetica-Bold",
    ))

    return styles


def generate_pdf_report(user, session, analysis) -> bytes:
    """Generate a PDF career analysis report.

    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
    )

    styles = _build_styles()
    elements = []

    # ── Header ──
    elements.append(Paragraph("IKLAVYA", styles["ReportTitle"]))
    elements.append(Paragraph("AI Career Guidance Report", styles["ReportSubtitle"]))
    elements.append(HRFlowable(
        width="100%", thickness=1, color=GREEN_800,
        spaceAfter=4 * mm, spaceBefore=2 * mm,
    ))

    # Student info
    elements.append(Paragraph(f"<b>Student:</b> {user.name}", styles["BodyText2"]))
    elements.append(Paragraph(f"<b>Institution:</b> {user.college}", styles["BodyText2"]))
    elements.append(Paragraph(
        f"<b>Session:</b> {session.title} | {session.started_at[:10]}",
        styles["BodyText2"],
    ))
    elements.append(Spacer(1, 4 * mm))

    # ── Analysis Markdown ──
    if analysis.analysis_markdown:
        raw_lines = analysis.analysis_markdown.strip().split("\n")
        segments = _parse_md_segments(raw_lines)
        for seg_type, seg_data in segments:
            if seg_type == "table":
                # Parse markdown table rows into ReportLab Table
                table_rows = []
                for idx, row_str in enumerate(seg_data):
                    cells = [c.strip() for c in row_str.strip("|").split("|")]
                    # Skip separator rows like |---|---|
                    if all(re.match(r"^[-:]+$", c) for c in cells):
                        continue
                    row = [Paragraph(_md_to_rl(c), styles["TableHeader"] if idx == 0 else styles["TableCell"]) for c in cells]
                    table_rows.append(row)
                if table_rows:
                    usable = A4[0] - 40 * mm
                    ncols = len(table_rows[0])
                    col_w = usable / ncols
                    md_table = Table(table_rows, colWidths=[col_w] * ncols)
                    md_table.setStyle(TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), GREEN_800),
                        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("GRID", (0, 0), (-1, -1), 0.5, GRAY_400),
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
                elif stripped.startswith("### "):
                    elements.append(Paragraph(_md_to_rl(stripped[4:]), styles["SectionHeading"]))
                elif stripped.startswith("## "):
                    elements.append(Paragraph(_md_to_rl(stripped[3:]), styles["SectionHeading"]))
                elif stripped.startswith("# "):
                    elements.append(Paragraph(_md_to_rl(stripped[2:]), styles["SectionHeading"]))
                elif stripped.startswith("- ") or stripped.startswith("* "):
                    elements.append(Paragraph(
                        _md_to_rl(stripped[2:]),
                        styles["BulletItem"],
                        bulletText="\u2022",
                    ))
                elif re.match(r"^\d+\.\s", stripped):
                    num_match = re.match(r"^(\d+)\.\s(.*)", stripped)
                    elements.append(Paragraph(
                        _md_to_rl(num_match.group(2)),
                        styles["BulletItem"],
                        bulletText=f"{num_match.group(1)}.",
                    ))
                else:
                    elements.append(Paragraph(_md_to_rl(stripped), styles["BodyText2"]))

    # ── Top Careers Table ──
    if analysis.analysis_json:
        try:
            data = json.loads(analysis.analysis_json)
            careers = data.get("top_careers", [])
            if careers:
                elements.append(Spacer(1, 4 * mm))
                elements.append(Paragraph("Top Career Matches", styles["SectionHeading"]))

                table_data = [[
                    Paragraph("Career", styles["TableHeader"]),
                    Paragraph("Match", styles["TableHeader"]),
                    Paragraph("Reason", styles["TableHeader"]),
                ]]
                for c in careers:
                    table_data.append([
                        Paragraph(c.get("title", ""), styles["TableCell"]),
                        Paragraph(f"{c.get('match_score', '')}%", styles["TableCell"]),
                        Paragraph(c.get("reason", ""), styles["TableCell"]),
                    ])

                usable_w = A4[0] - 40 * mm
                t = Table(table_data, colWidths=[
                    usable_w * 0.22, usable_w * 0.12, usable_w * 0.66,
                ])
                t.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), GREEN_800),
                    ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("ALIGN", (1, 0), (1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("GRID", (0, 0), (-1, -1), 0.5, GRAY_400),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, GREEN_50]),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ]))
                elements.append(t)
        except (json.JSONDecodeError, TypeError):
            pass

    # ── Roadmap ──
    if analysis.roadmap_json:
        try:
            roadmap = json.loads(analysis.roadmap_json)
            steps = roadmap.get("steps", [])
            if steps:
                elements.append(Spacer(1, 4 * mm))
                elements.append(Paragraph("Career Roadmap", styles["SectionHeading"]))
                for step in steps:
                    order = step.get("order", "")
                    title = _md_to_rl(step.get("title", ""))
                    desc = _md_to_rl(step.get("description", ""))
                    timeline = _md_to_rl(step.get("timeline", ""))
                    elements.append(Paragraph(
                        f"<b>Step {order}: {title}</b> ({timeline})",
                        styles["BodyText2"],
                    ))
                    elements.append(Paragraph(desc, styles["BulletItem"]))
                    elements.append(Spacer(1, 2 * mm))
        except (json.JSONDecodeError, TypeError):
            pass

    # ── Footer ──
    elements.append(Spacer(1, 10 * mm))
    elements.append(HRFlowable(
        width="100%", thickness=0.5, color=GRAY_400,
        spaceAfter=3 * mm,
    ))
    elements.append(Paragraph(
        "Generated by IKLAVYA AI Career Guidance Platform",
        styles["FooterText"],
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()

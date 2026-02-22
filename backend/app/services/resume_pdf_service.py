import io
import json
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT


GREEN_800 = HexColor("#166534")
GREEN_100 = HexColor("#DCFCE7")
GREEN_50 = HexColor("#F0FDF4")
GRAY_900 = HexColor("#111827")
GRAY_700 = HexColor("#374151")
GRAY_600 = HexColor("#4B5563")
GRAY_400 = HexColor("#9CA3AF")
GRAY_200 = HexColor("#E5E7EB")
WHITE = HexColor("#FFFFFF")


def generate_resume_pdf(resume_json: str, template: str = "professional") -> bytes:
    """Generate resume PDF bytes for the given template."""
    data = json.loads(resume_json)
    if template == "modern":
        return _generate_modern(data)
    elif template == "simple":
        return _generate_simple(data)
    return _generate_professional(data)


# ─── Template 1: Professional ───────────────────────────────


def _generate_professional(data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=18 * mm, bottomMargin=18 * mm,
        leftMargin=18 * mm, rightMargin=18 * mm,
    )
    styles = getSampleStyleSheet()

    s_name = ParagraphStyle("PName", parent=styles["Title"], fontSize=20, textColor=GREEN_800, spaceAfter=1 * mm, alignment=TA_LEFT)
    s_contact = ParagraphStyle("PContact", parent=styles["Normal"], fontSize=9, textColor=GRAY_400, spaceAfter=2 * mm)
    s_section = ParagraphStyle("PSection", parent=styles["Heading2"], fontSize=11, textColor=GREEN_800, spaceBefore=5 * mm, spaceAfter=2 * mm)
    s_body = ParagraphStyle("PBody", parent=styles["Normal"], fontSize=9.5, textColor=GRAY_700, leading=13)
    s_bullet = ParagraphStyle("PBullet", parent=styles["Normal"], fontSize=9.5, textColor=GRAY_700, leading=13, leftIndent=12, bulletIndent=4, bulletFontSize=9)
    s_entry_title = ParagraphStyle("PEntryTitle", parent=styles["Normal"], fontSize=10, textColor=GRAY_900, leading=13)
    s_entry_sub = ParagraphStyle("PEntrySub", parent=styles["Normal"], fontSize=9, textColor=GRAY_400, leading=12)
    s_footer = ParagraphStyle("PFooter", parent=styles["Normal"], fontSize=7, textColor=GRAY_400, alignment=TA_CENTER)

    elements = []
    pi = data.get("personal_info", {})

    # Name
    elements.append(Paragraph(pi.get("name", ""), s_name))

    # Contact line
    contact_parts = [p for p in [pi.get("email"), pi.get("phone"), pi.get("location"), pi.get("linkedin"), pi.get("portfolio")] if p]
    elements.append(Paragraph("  |  ".join(contact_parts), s_contact))
    elements.append(HRFlowable(width="100%", thickness=1, color=GREEN_800, spaceAfter=3 * mm))

    # Objective
    obj = data.get("objective", "")
    if obj:
        elements.append(Paragraph("CAREER OBJECTIVE", s_section))
        elements.append(Paragraph(obj, s_body))

    # Education
    edu_list = data.get("education", [])
    if edu_list:
        elements.append(Paragraph("EDUCATION", s_section))
        for e in edu_list:
            line = f"<b>{e.get('degree', '')}</b>"
            if e.get("institution"):
                line += f" — {e['institution']}"
            elements.append(Paragraph(line, s_entry_title))
            sub_parts = [p for p in [e.get("year"), e.get("grade"), e.get("board")] if p]
            if sub_parts:
                elements.append(Paragraph(" | ".join(sub_parts), s_entry_sub))
            elements.append(Spacer(1, 1.5 * mm))

    # Experience
    exp_list = data.get("experience", [])
    if exp_list:
        elements.append(Paragraph("EXPERIENCE", s_section))
        for exp in exp_list:
            line = f"<b>{exp.get('title', '')}</b>"
            if exp.get("company"):
                line += f" — {exp['company']}"
            elements.append(Paragraph(line, s_entry_title))
            if exp.get("duration"):
                elements.append(Paragraph(exp["duration"], s_entry_sub))
            for b in exp.get("bullets", []):
                elements.append(Paragraph(b, s_bullet, bulletText="•"))
            elements.append(Spacer(1, 1.5 * mm))

    # Projects
    proj_list = data.get("projects", [])
    if proj_list:
        elements.append(Paragraph("PROJECTS", s_section))
        for p in proj_list:
            line = f"<b>{p.get('name', '')}</b>"
            ts = p.get("tech_stack", [])
            if ts:
                line += f"  <font color='#9CA3AF'>({', '.join(ts)})</font>"
            elements.append(Paragraph(line, s_entry_title))
            if p.get("description"):
                elements.append(Paragraph(p["description"], s_entry_sub))
            for b in p.get("bullets", []):
                elements.append(Paragraph(b, s_bullet, bulletText="•"))
            elements.append(Spacer(1, 1.5 * mm))

    # Skills
    skills = data.get("skills", {})
    if any(skills.get(k) for k in ["technical", "soft", "languages", "tools"]):
        elements.append(Paragraph("SKILLS", s_section))
        skill_rows = []
        if skills.get("technical"):
            skill_rows.append(["Technical", ", ".join(skills["technical"])])
        if skills.get("soft"):
            skill_rows.append(["Soft Skills", ", ".join(skills["soft"])])
        if skills.get("languages"):
            skill_rows.append(["Languages", ", ".join(skills["languages"])])
        if skills.get("tools"):
            skill_rows.append(["Tools", ", ".join(skills["tools"])])

        t = Table(skill_rows, colWidths=[70, 400])
        t.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TEXTCOLOR", (0, 0), (0, -1), GREEN_800),
            ("TEXTCOLOR", (1, 0), (1, -1), GRAY_700),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ]))
        elements.append(t)

    # Achievements
    achievements = data.get("achievements", [])
    if achievements:
        elements.append(Paragraph("ACHIEVEMENTS", s_section))
        for a in achievements:
            elements.append(Paragraph(a, s_bullet, bulletText="•"))

    # Certifications
    certs = data.get("certifications", [])
    if certs:
        elements.append(Paragraph("CERTIFICATIONS", s_section))
        for c in certs:
            line = f"<b>{c.get('name', '')}</b>"
            parts = [p for p in [c.get("issuer"), c.get("year")] if p]
            if parts:
                line += f" — {', '.join(parts)}"
            elements.append(Paragraph(line, s_body))

    # Footer
    elements.append(Spacer(1, 8 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GRAY_200, spaceAfter=2 * mm))
    elements.append(Paragraph("Generated by IKLAVYA AI Resume Builder", s_footer))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


# ─── Template 2: Modern (Two-Column) ────────────────────────


def _generate_modern(data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=15 * mm, bottomMargin=15 * mm,
        leftMargin=15 * mm, rightMargin=15 * mm,
    )
    styles = getSampleStyleSheet()

    # Left column styles (white text on dark bg)
    s_lname = ParagraphStyle("MNameL", parent=styles["Title"], fontSize=16, textColor=WHITE, spaceAfter=2 * mm, alignment=TA_LEFT)
    s_lcontact = ParagraphStyle("MContactL", parent=styles["Normal"], fontSize=8, textColor=HexColor("#BBFFBB"), leading=12)
    s_lsection = ParagraphStyle("MSectionL", parent=styles["Heading3"], fontSize=10, textColor=WHITE, spaceBefore=4 * mm, spaceAfter=1.5 * mm)
    s_lbody = ParagraphStyle("MBodyL", parent=styles["Normal"], fontSize=8.5, textColor=HexColor("#E0E0E0"), leading=11)

    # Right column styles
    s_rsection = ParagraphStyle("MSectionR", parent=styles["Heading2"], fontSize=11, textColor=GREEN_800, spaceBefore=4 * mm, spaceAfter=2 * mm)
    s_rbody = ParagraphStyle("MBodyR", parent=styles["Normal"], fontSize=9.5, textColor=GRAY_700, leading=13)
    s_rbullet = ParagraphStyle("MBulletR", parent=styles["Normal"], fontSize=9, textColor=GRAY_700, leading=12, leftIndent=10, bulletIndent=2)
    s_rtitle = ParagraphStyle("MTitleR", parent=styles["Normal"], fontSize=10, textColor=GRAY_900, leading=13)
    s_rsub = ParagraphStyle("MSubR", parent=styles["Normal"], fontSize=8.5, textColor=GRAY_400, leading=11)

    pi = data.get("personal_info", {})
    skills = data.get("skills", {})

    # Build left column content
    left_elements = []
    left_elements.append(Paragraph(pi.get("name", ""), s_lname))
    for field in ["email", "phone", "location", "linkedin", "portfolio"]:
        val = pi.get(field)
        if val:
            left_elements.append(Paragraph(val, s_lcontact))

    # Skills in left column
    if skills.get("technical"):
        left_elements.append(Paragraph("SKILLS", s_lsection))
        left_elements.append(Paragraph(", ".join(skills["technical"]), s_lbody))
    if skills.get("tools"):
        left_elements.append(Paragraph("TOOLS", s_lsection))
        left_elements.append(Paragraph(", ".join(skills["tools"]), s_lbody))
    if skills.get("languages"):
        left_elements.append(Paragraph("LANGUAGES", s_lsection))
        left_elements.append(Paragraph(", ".join(skills["languages"]), s_lbody))
    if skills.get("soft"):
        left_elements.append(Paragraph("SOFT SKILLS", s_lsection))
        left_elements.append(Paragraph(", ".join(skills["soft"]), s_lbody))

    certs = data.get("certifications", [])
    if certs:
        left_elements.append(Paragraph("CERTIFICATIONS", s_lsection))
        for c in certs:
            left_elements.append(Paragraph(f"• {c.get('name', '')} ({c.get('year', '')})", s_lbody))

    # Build right column content
    right_elements = []

    obj = data.get("objective", "")
    if obj:
        right_elements.append(Paragraph("OBJECTIVE", s_rsection))
        right_elements.append(Paragraph(f"<i>{obj}</i>", s_rbody))

    edu_list = data.get("education", [])
    if edu_list:
        right_elements.append(Paragraph("EDUCATION", s_rsection))
        for e in edu_list:
            right_elements.append(Paragraph(f"<b>{e.get('degree', '')}</b> — {e.get('institution', '')}", s_rtitle))
            sub = [p for p in [e.get("year"), e.get("grade")] if p]
            if sub:
                right_elements.append(Paragraph(" | ".join(sub), s_rsub))
            right_elements.append(Spacer(1, 1 * mm))

    exp_list = data.get("experience", [])
    if exp_list:
        right_elements.append(Paragraph("EXPERIENCE", s_rsection))
        for exp in exp_list:
            right_elements.append(Paragraph(f"<b>{exp.get('title', '')}</b> — {exp.get('company', '')}", s_rtitle))
            if exp.get("duration"):
                right_elements.append(Paragraph(exp["duration"], s_rsub))
            for b in exp.get("bullets", []):
                right_elements.append(Paragraph(b, s_rbullet, bulletText="•"))
            right_elements.append(Spacer(1, 1 * mm))

    proj_list = data.get("projects", [])
    if proj_list:
        right_elements.append(Paragraph("PROJECTS", s_rsection))
        for p in proj_list:
            tech = f" ({', '.join(p.get('tech_stack', []))})" if p.get("tech_stack") else ""
            right_elements.append(Paragraph(f"<b>{p.get('name', '')}</b>{tech}", s_rtitle))
            for b in p.get("bullets", []):
                right_elements.append(Paragraph(b, s_rbullet, bulletText="•"))
            right_elements.append(Spacer(1, 1 * mm))

    achievements = data.get("achievements", [])
    if achievements:
        right_elements.append(Paragraph("ACHIEVEMENTS", s_rsection))
        for a in achievements:
            right_elements.append(Paragraph(a, s_rbullet, bulletText="•"))

    # Combine into two-column table
    page_w = A4[0] - 30 * mm
    left_w = page_w * 0.32
    right_w = page_w * 0.68

    left_cell = left_elements if left_elements else [Paragraph("", s_lbody)]
    right_cell = right_elements if right_elements else [Paragraph("", s_rbody)]

    t = Table([[left_cell, right_cell]], colWidths=[left_w, right_w])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), GREEN_800),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (0, 0), 10),
        ("RIGHTPADDING", (0, 0), (0, 0), 10),
        ("LEFTPADDING", (1, 0), (1, 0), 12),
        ("RIGHTPADDING", (1, 0), (1, 0), 6),
    ]))

    s_footer = ParagraphStyle("MFooter", parent=styles["Normal"], fontSize=7, textColor=GRAY_400, alignment=TA_CENTER)
    elements = [t, Spacer(1, 4 * mm)]
    elements.append(Paragraph("Generated by IKLAVYA AI Resume Builder", s_footer))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


# ─── Template 3: Simple (ATS-Optimized) ─────────────────────


def _generate_simple(data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=20 * mm, bottomMargin=20 * mm,
        leftMargin=20 * mm, rightMargin=20 * mm,
    )
    styles = getSampleStyleSheet()

    s_name = ParagraphStyle("SName", parent=styles["Title"], fontSize=18, textColor=GRAY_900, spaceAfter=1 * mm, alignment=TA_CENTER)
    s_contact = ParagraphStyle("SContact", parent=styles["Normal"], fontSize=9, textColor=GRAY_600, alignment=TA_CENTER, spaceAfter=4 * mm)
    s_section = ParagraphStyle("SSection", parent=styles["Heading2"], fontSize=11, textColor=GRAY_900, spaceBefore=5 * mm, spaceAfter=2 * mm)
    s_body = ParagraphStyle("SBody", parent=styles["Normal"], fontSize=10, textColor=GRAY_700, leading=14)
    s_bullet = ParagraphStyle("SBullet", parent=styles["Normal"], fontSize=9.5, textColor=GRAY_700, leading=13, leftIndent=12, bulletIndent=4)
    s_entry = ParagraphStyle("SEntry", parent=styles["Normal"], fontSize=10, textColor=GRAY_900, leading=14)
    s_sub = ParagraphStyle("SSub", parent=styles["Normal"], fontSize=9, textColor=GRAY_600, leading=12)
    s_footer = ParagraphStyle("SFooter", parent=styles["Normal"], fontSize=7, textColor=GRAY_400, alignment=TA_CENTER)

    elements = []
    pi = data.get("personal_info", {})

    # Header — centered, no styling
    elements.append(Paragraph(pi.get("name", ""), s_name))
    contact_parts = [p for p in [pi.get("email"), pi.get("phone"), pi.get("location")] if p]
    if pi.get("linkedin"):
        contact_parts.append(pi["linkedin"])
    elements.append(Paragraph("  |  ".join(contact_parts), s_contact))

    # Objective
    obj = data.get("objective", "")
    if obj:
        elements.append(Paragraph("CAREER OBJECTIVE", s_section))
        elements.append(Paragraph(obj, s_body))

    # Education
    edu_list = data.get("education", [])
    if edu_list:
        elements.append(Paragraph("EDUCATION", s_section))
        for e in edu_list:
            elements.append(Paragraph(f"<b>{e.get('degree', '')}</b> — {e.get('institution', '')}", s_entry))
            sub = [p for p in [e.get("year"), e.get("grade"), e.get("board")] if p]
            if sub:
                elements.append(Paragraph(" | ".join(sub), s_sub))
            elements.append(Spacer(1, 1 * mm))

    # Experience
    exp_list = data.get("experience", [])
    if exp_list:
        elements.append(Paragraph("EXPERIENCE", s_section))
        for exp in exp_list:
            elements.append(Paragraph(f"<b>{exp.get('title', '')}</b> — {exp.get('company', '')} ({exp.get('duration', '')})", s_entry))
            for b in exp.get("bullets", []):
                elements.append(Paragraph(b, s_bullet, bulletText="-"))
            elements.append(Spacer(1, 1 * mm))

    # Projects
    proj_list = data.get("projects", [])
    if proj_list:
        elements.append(Paragraph("PROJECTS", s_section))
        for p in proj_list:
            tech = f" [{', '.join(p.get('tech_stack', []))}]" if p.get("tech_stack") else ""
            elements.append(Paragraph(f"<b>{p.get('name', '')}</b>{tech}", s_entry))
            if p.get("description"):
                elements.append(Paragraph(p["description"], s_sub))
            for b in p.get("bullets", []):
                elements.append(Paragraph(b, s_bullet, bulletText="-"))
            elements.append(Spacer(1, 1 * mm))

    # Skills — inline comma-separated for ATS
    skills = data.get("skills", {})
    all_skills = []
    for category in ["technical", "soft", "tools"]:
        all_skills.extend(skills.get(category, []))
    if all_skills:
        elements.append(Paragraph("SKILLS", s_section))
        elements.append(Paragraph(", ".join(all_skills), s_body))

    if skills.get("languages"):
        elements.append(Paragraph("LANGUAGES", s_section))
        elements.append(Paragraph(", ".join(skills["languages"]), s_body))

    # Achievements
    achievements = data.get("achievements", [])
    if achievements:
        elements.append(Paragraph("ACHIEVEMENTS", s_section))
        for a in achievements:
            elements.append(Paragraph(a, s_bullet, bulletText="-"))

    # Certifications
    certs = data.get("certifications", [])
    if certs:
        elements.append(Paragraph("CERTIFICATIONS", s_section))
        for c in certs:
            elements.append(Paragraph(f"{c.get('name', '')} — {c.get('issuer', '')} ({c.get('year', '')})", s_body))

    # Footer
    elements.append(Spacer(1, 8 * mm))
    elements.append(Paragraph("Generated by IKLAVYA AI Resume Builder", s_footer))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()

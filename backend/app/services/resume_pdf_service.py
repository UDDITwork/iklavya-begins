import io
import json
import urllib.request
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, BaseDocTemplate, Frame, PageTemplate,
    Paragraph, Spacer, Table, TableStyle, HRFlowable, Flowable,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.utils import ImageReader


GREEN_800 = HexColor("#166534")
GREEN_100 = HexColor("#DCFCE7")
GREEN_50 = HexColor("#F0FDF4")
GRAY_900 = HexColor("#111827")
GRAY_700 = HexColor("#374151")
GRAY_600 = HexColor("#4B5563")
GRAY_400 = HexColor("#9CA3AF")
GRAY_200 = HexColor("#E5E7EB")
WHITE = HexColor("#FFFFFF")


def generate_resume_pdf(
    resume_json: str,
    template: str = "professional",
    profile_image_url: str | None = None,
) -> bytes:
    """Generate resume PDF bytes for the given template."""
    data = json.loads(resume_json)
    if template == "modern":
        return _generate_modern(data)
    elif template == "simple":
        return _generate_simple(data)
    elif template == "rendercv":
        return _generate_rendercv(data)
    elif template == "sidebar":
        return _generate_sidebar(data, profile_image_url)
    elif template == "jake":
        return _generate_jake(data)
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
    elements.append(Paragraph("Generated by iKlavya AI Resume Builder  |  www.iklavya.in  |  contact@iklavya.in", s_footer))

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
    elements.append(Paragraph("Generated by iKlavya AI Resume Builder  |  www.iklavya.in  |  contact@iklavya.in", s_footer))

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
    elements.append(Paragraph("Generated by iKlavya AI Resume Builder  |  www.iklavya.in  |  contact@iklavya.in", s_footer))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


# ─── Template 4: RenderCV Professional (Blue Accent) ─────────

RENDERCV_BLUE = Color(0 / 255, 79 / 255, 144 / 255)
RENDERCV_DARK = HexColor("#222222")
RENDERCV_GRAY = HexColor("#555555")
RENDERCV_LIGHT = HexColor("#888888")


def _generate_rendercv(data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=14 * mm, bottomMargin=14 * mm,
        leftMargin=15 * mm, rightMargin=15 * mm,
    )
    styles = getSampleStyleSheet()
    page_w = A4[0] - 30 * mm

    s_name = ParagraphStyle("RCVName", parent=styles["Title"], fontSize=24, textColor=RENDERCV_DARK, spaceAfter=2 * mm, alignment=TA_CENTER, fontName="Helvetica-Bold")
    s_contact = ParagraphStyle("RCVContact", parent=styles["Normal"], fontSize=9, textColor=RENDERCV_BLUE, spaceAfter=3 * mm, alignment=TA_CENTER, leading=13)
    s_section = ParagraphStyle("RCVSection", parent=styles["Heading2"], fontSize=12, textColor=RENDERCV_BLUE, spaceBefore=5 * mm, spaceAfter=1 * mm, fontName="Helvetica-Bold")
    s_entry_l = ParagraphStyle("RCVEntryL", parent=styles["Normal"], fontSize=10, textColor=RENDERCV_DARK, leading=13, fontName="Helvetica-Bold")
    s_entry_r = ParagraphStyle("RCVEntryR", parent=styles["Normal"], fontSize=9, textColor=RENDERCV_GRAY, leading=13, alignment=TA_RIGHT)
    s_sub = ParagraphStyle("RCVSub", parent=styles["Normal"], fontSize=9, textColor=RENDERCV_GRAY, leading=12)
    s_bullet = ParagraphStyle("RCVBullet", parent=styles["Normal"], fontSize=9.5, textColor=RENDERCV_GRAY, leading=12.5, leftIndent=12, bulletIndent=4)
    s_skills = ParagraphStyle("RCVSkills", parent=styles["Normal"], fontSize=9.5, textColor=RENDERCV_DARK, leading=13)
    s_footer = ParagraphStyle("RCVFooter", parent=styles["Normal"], fontSize=7, textColor=GRAY_400, alignment=TA_CENTER)

    elements = []
    pi = data.get("personal_info", {})

    # Name
    elements.append(Paragraph(pi.get("name", ""), s_name))

    # Contact line
    contact_items = []
    if pi.get("location"):
        contact_items.append(pi["location"])
    if pi.get("email"):
        contact_items.append(pi["email"])
    if pi.get("phone"):
        contact_items.append(pi["phone"])
    if pi.get("portfolio"):
        contact_items.append(pi["portfolio"])
    if pi.get("linkedin"):
        contact_items.append(pi["linkedin"])
    if contact_items:
        elements.append(Paragraph("  |  ".join(contact_items), s_contact))

    def add_section(title):
        elements.append(Paragraph(title, s_section))
        elements.append(HRFlowable(width="100%", thickness=1, color=RENDERCV_BLUE, spaceAfter=2 * mm))

    # Education
    edu_list = data.get("education", [])
    if edu_list:
        add_section("Education")
        for e in edu_list:
            left = f"<b>{e.get('institution', '')}</b>"
            right = e.get("year", "")
            row = Table(
                [[Paragraph(left, s_entry_l), Paragraph(right, s_entry_r)]],
                colWidths=[page_w * 0.7, page_w * 0.3],
            )
            row.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]))
            elements.append(row)
            degree_line = e.get("degree", "")
            if e.get("grade"):
                degree_line += f" | {e['grade']}"
            if degree_line:
                elements.append(Paragraph(degree_line, s_sub))
            elements.append(Spacer(1, 2 * mm))

    # Experience
    exp_list = data.get("experience", [])
    if exp_list:
        add_section("Experience")
        for exp in exp_list:
            left = f"<b>{exp.get('title', '')}</b>"
            if exp.get("company"):
                left += f", <i>{exp['company']}</i>"
            right = exp.get("duration", "")
            row = Table(
                [[Paragraph(left, s_entry_l), Paragraph(right, s_entry_r)]],
                colWidths=[page_w * 0.7, page_w * 0.3],
            )
            row.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]))
            elements.append(row)
            for b in exp.get("bullets", []):
                elements.append(Paragraph(b, s_bullet, bulletText="\u2022"))
            elements.append(Spacer(1, 2 * mm))

    # Projects
    proj_list = data.get("projects", [])
    if proj_list:
        add_section("Projects")
        for idx, p in enumerate(proj_list, 1):
            title = f"<b>{idx}. {p.get('name', '')}</b>"
            ts = p.get("tech_stack", [])
            if ts:
                title += f"  <font color='#888888'>({', '.join(ts)})</font>"
            elements.append(Paragraph(title, s_entry_l))
            if p.get("description"):
                elements.append(Paragraph(p["description"], s_sub))
            for b in p.get("bullets", []):
                elements.append(Paragraph(b, s_bullet, bulletText="\u2022"))
            elements.append(Spacer(1, 2 * mm))

    # Skills
    skills = data.get("skills", {})
    if any(skills.get(k) for k in ["technical", "soft", "languages", "tools"]):
        add_section("Skills")
        for cat, key in [("Technical Skills", "technical"), ("Languages", "languages"), ("Tools & Frameworks", "tools"), ("Soft Skills", "soft")]:
            if skills.get(key):
                elements.append(Paragraph(f"<b>{cat}:</b> {', '.join(skills[key])}", s_skills))
                elements.append(Spacer(1, 1 * mm))

    # Achievements
    achievements = data.get("achievements", [])
    if achievements:
        add_section("Achievements")
        for a in achievements:
            elements.append(Paragraph(a, s_bullet, bulletText="\u2022"))

    # Certifications
    certs = data.get("certifications", [])
    if certs:
        add_section("Certifications")
        for c in certs:
            line = f"<b>{c.get('name', '')}</b>"
            parts = [p for p in [c.get("issuer"), c.get("year")] if p]
            if parts:
                line += f" -- {', '.join(parts)}"
            elements.append(Paragraph(line, s_skills))

    # Footer
    elements.append(Spacer(1, 6 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GRAY_200, spaceAfter=2 * mm))
    elements.append(Paragraph("Generated by iKlavya AI Resume Builder  |  www.iklavya.in  |  contact@iklavya.in", s_footer))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


# ─── Template 5: Clean CV Sidebar (Two-Column with Photo) ────

SIDEBAR_TEAL = Color(0 / 255, 112 / 255, 101 / 255)
SIDEBAR_CREAM = Color(245 / 255, 243 / 255, 233 / 255)
SIDEBAR_WHITE = Color(1, 1, 1)
SIDEBAR_DARK = HexColor("#2D2D2D")
SIDEBAR_LIGHT = Color(0.9, 0.9, 0.9)
SIDEBAR_DIM = Color(0.7, 0.7, 0.7)


class CircularImage(Flowable):
    """Renders an image clipped to a circle."""

    def __init__(self, img_data: io.BytesIO, size: float):
        Flowable.__init__(self)
        self.img_data = img_data
        self.size = size
        self.width = size
        self.height = size

    def draw(self):
        r = self.size / 2
        path = self.canv.beginPath()
        path.circle(r, r, r)
        self.canv.clipPath(path, stroke=0)
        self.canv.drawImage(
            ImageReader(self.img_data),
            0, 0, self.size, self.size,
            preserveAspectRatio=True, mask="auto",
        )


def _fetch_image_bytes(url: str) -> io.BytesIO | None:
    """Download image from URL into BytesIO."""
    if not url:
        return None
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return io.BytesIO(resp.read())
    except Exception:
        return None


def _draw_sidebar_bg(canvas, doc):
    """Paint the two-column background on every page."""
    w, h = A4
    sw = w * 0.38
    canvas.setFillColor(SIDEBAR_TEAL)
    canvas.rect(0, 0, sw, h, fill=1, stroke=0)
    canvas.setFillColor(SIDEBAR_CREAM)
    canvas.rect(sw, 0, w - sw, h, fill=1, stroke=0)


def _generate_sidebar(data: dict, profile_image_url: str | None = None) -> bytes:
    buffer = io.BytesIO()
    w, h = A4
    sw = w * 0.38
    mw = w * 0.62

    doc = BaseDocTemplate(
        buffer, pagesize=A4,
        topMargin=0, bottomMargin=0,
        leftMargin=0, rightMargin=0,
    )
    full_frame = Frame(0, 0, w, h, id="full", leftPadding=0, rightPadding=0, topPadding=12 * mm, bottomPadding=12 * mm)
    doc.addPageTemplates([PageTemplate(id="sb", frames=[full_frame], onPage=_draw_sidebar_bg)])

    styles = getSampleStyleSheet()

    # Sidebar styles (white on teal)
    s_sname = ParagraphStyle("SBName", parent=styles["Title"], fontSize=18, textColor=SIDEBAR_WHITE, spaceAfter=1 * mm, alignment=TA_LEFT, fontName="Helvetica-Bold")
    s_stitle = ParagraphStyle("SBTitle", parent=styles["Normal"], fontSize=10, textColor=SIDEBAR_LIGHT, spaceAfter=3 * mm)
    s_ssection = ParagraphStyle("SBSect", parent=styles["Heading3"], fontSize=10, textColor=SIDEBAR_WHITE, spaceBefore=4 * mm, spaceAfter=1.5 * mm, fontName="Helvetica-Bold")
    s_slabel = ParagraphStyle("SBLabel", parent=styles["Normal"], fontSize=7.5, textColor=SIDEBAR_DIM, leading=10)
    s_svalue = ParagraphStyle("SBVal", parent=styles["Normal"], fontSize=8.5, textColor=SIDEBAR_WHITE, leading=12)
    s_sbody = ParagraphStyle("SBBody", parent=styles["Normal"], fontSize=8.5, textColor=SIDEBAR_LIGHT, leading=12)

    # Main styles (dark on cream)
    s_msection = ParagraphStyle("SBMSect", parent=styles["Heading2"], fontSize=13, textColor=SIDEBAR_TEAL, spaceBefore=5 * mm, spaceAfter=2 * mm, fontName="Helvetica-Bold")
    s_mentry = ParagraphStyle("SBMEntry", parent=styles["Normal"], fontSize=10, textColor=SIDEBAR_DARK, leading=13)
    s_msub = ParagraphStyle("SBMSub", parent=styles["Normal"], fontSize=8.5, textColor=HexColor("#888888"), leading=11)
    s_mbullet = ParagraphStyle("SBMBull", parent=styles["Normal"], fontSize=9, textColor=SIDEBAR_DARK, leading=12, leftIndent=10, bulletIndent=2)
    s_footer = ParagraphStyle("SBFooter", parent=styles["Normal"], fontSize=7, textColor=GRAY_400, alignment=TA_CENTER)

    pi = data.get("personal_info", {})
    skills = data.get("skills", {})

    # ── Sidebar content ──
    side = []
    side.append(Paragraph(pi.get("name", ""), s_sname))
    obj = data.get("objective", "")
    if obj:
        short = obj.split(".")[0] + "." if "." in obj else obj[:80]
        side.append(Paragraph(short, s_stitle))

    # Profile photo
    if profile_image_url:
        img_buf = _fetch_image_bytes(profile_image_url)
        if img_buf:
            side.append(Spacer(1, 3 * mm))
            side.append(CircularImage(img_buf, size=50 * mm))
            side.append(Spacer(1, 3 * mm))

    # Personal info
    side.append(Paragraph("PERSONAL INFO", s_ssection))
    for label, key in [("Email", "email"), ("Phone", "phone"), ("Location", "location")]:
        val = pi.get(key)
        if val:
            side.append(Paragraph(label.upper(), s_slabel))
            side.append(Paragraph(val, s_svalue))
            side.append(Spacer(1, 1 * mm))

    # Links
    links = [(k, pi.get(k)) for k in ["linkedin", "portfolio"] if pi.get(k)]
    if links:
        side.append(Paragraph("LINKS", s_ssection))
        for label, val in links:
            side.append(Paragraph(label.upper(), s_slabel))
            side.append(Paragraph(val, s_svalue))
            side.append(Spacer(1, 1 * mm))

    # Skills
    if any(skills.get(k) for k in ["technical", "tools", "soft"]):
        side.append(Paragraph("SKILLS", s_ssection))
        for cat, key in [("Technical", "technical"), ("Tools", "tools"), ("Soft Skills", "soft")]:
            if skills.get(key):
                side.append(Paragraph(cat.upper(), s_slabel))
                side.append(Paragraph(", ".join(skills[key]), s_sbody))
                side.append(Spacer(1, 1.5 * mm))

    # Languages
    if skills.get("languages"):
        side.append(Paragraph("LANGUAGES", s_ssection))
        side.append(Paragraph(", ".join(skills["languages"]), s_sbody))

    # Certifications
    certs = data.get("certifications", [])
    if certs:
        side.append(Paragraph("CERTIFICATIONS", s_ssection))
        for c in certs:
            side.append(Paragraph(f"\u2022 {c.get('name', '')} ({c.get('year', '')})", s_sbody))

    # ── Main content ──
    main = []

    # Experience
    exp_list = data.get("experience", [])
    if exp_list:
        main.append(Paragraph("WORK EXPERIENCE", s_msection))
        for exp in exp_list:
            main.append(Paragraph(f"<b>{exp.get('title', '')}</b> -- {exp.get('company', '')}", s_mentry))
            if exp.get("duration"):
                main.append(Paragraph(exp["duration"], s_msub))
            for b in exp.get("bullets", []):
                main.append(Paragraph(b, s_mbullet, bulletText="\u2022"))
            main.append(Spacer(1, 2 * mm))

    # Education
    edu_list = data.get("education", [])
    if edu_list:
        main.append(Paragraph("EDUCATION", s_msection))
        for e in edu_list:
            main.append(Paragraph(f"<b>{e.get('degree', '')}</b> -- {e.get('institution', '')}", s_mentry))
            sub = [p for p in [e.get("year"), e.get("grade")] if p]
            if sub:
                main.append(Paragraph(" | ".join(sub), s_msub))
            main.append(Spacer(1, 1.5 * mm))

    # Projects
    proj_list = data.get("projects", [])
    if proj_list:
        main.append(Paragraph("PROJECTS", s_msection))
        for p in proj_list:
            tech = f" ({', '.join(p.get('tech_stack', []))})" if p.get("tech_stack") else ""
            main.append(Paragraph(f"<b>{p.get('name', '')}</b>{tech}", s_mentry))
            for b in p.get("bullets", []):
                main.append(Paragraph(b, s_mbullet, bulletText="\u2022"))
            main.append(Spacer(1, 1.5 * mm))

    # Achievements
    achievements = data.get("achievements", [])
    if achievements:
        main.append(Paragraph("ACHIEVEMENTS", s_msection))
        for a in achievements:
            main.append(Paragraph(a, s_mbullet, bulletText="\u2022"))

    # Footer
    main.append(Spacer(1, 6 * mm))
    main.append(Paragraph("Generated by iKlavya AI Resume Builder  |  www.iklavya.in  |  contact@iklavya.in", s_footer))

    # ── Two-column table ──
    side_w = sw - 2 * mm
    main_w = mw - 2 * mm
    side_cell = side if side else [Spacer(1, 1)]
    main_cell = main if main else [Spacer(1, 1)]

    t = Table([[side_cell, main_cell]], colWidths=[side_w, main_w])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (0, 0), 12 * mm),
        ("RIGHTPADDING", (0, 0), (0, 0), 8 * mm),
        ("LEFTPADDING", (1, 0), (1, 0), 8 * mm),
        ("RIGHTPADDING", (1, 0), (1, 0), 10 * mm),
    ]))

    doc.build([t])
    buffer.seek(0)
    return buffer.read()


# ─── Template 6: Jake (ATS Classic, Black & White) ─────────

JAKE_BLACK = HexColor("#000000")
JAKE_DARK = HexColor("#1A1A1A")
JAKE_GRAY = HexColor("#555555")


def _generate_jake(data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=10 * mm, bottomMargin=10 * mm,
        leftMargin=12 * mm, rightMargin=12 * mm,
    )
    styles = getSampleStyleSheet()
    page_w = A4[0] - 24 * mm

    s_name = ParagraphStyle(
        "JKName", parent=styles["Title"], fontSize=24,
        textColor=JAKE_BLACK, spaceAfter=1 * mm,
        alignment=TA_CENTER, fontName="Helvetica-Bold",
    )
    s_contact = ParagraphStyle(
        "JKContact", parent=styles["Normal"], fontSize=9,
        textColor=JAKE_DARK, spaceAfter=4 * mm,
        alignment=TA_CENTER, leading=14,
    )
    s_section = ParagraphStyle(
        "JKSection", parent=styles["Heading2"], fontSize=12,
        textColor=JAKE_BLACK, spaceBefore=4 * mm, spaceAfter=0.5 * mm,
        fontName="Helvetica-Bold",
    )
    s_entry_bold = ParagraphStyle(
        "JKEntryBold", parent=styles["Normal"], fontSize=10,
        textColor=JAKE_BLACK, leading=13, fontName="Helvetica-Bold",
    )
    s_entry_right = ParagraphStyle(
        "JKEntryRight", parent=styles["Normal"], fontSize=10,
        textColor=JAKE_BLACK, leading=13, fontName="Helvetica-Bold",
        alignment=TA_RIGHT,
    )
    s_entry_italic = ParagraphStyle(
        "JKEntryItalic", parent=styles["Normal"], fontSize=9,
        textColor=JAKE_GRAY, leading=12, fontName="Helvetica-Oblique",
    )
    s_entry_italic_r = ParagraphStyle(
        "JKEntryItalicR", parent=styles["Normal"], fontSize=9,
        textColor=JAKE_GRAY, leading=12, fontName="Helvetica-Oblique",
        alignment=TA_RIGHT,
    )
    s_bullet = ParagraphStyle(
        "JKBullet", parent=styles["Normal"], fontSize=9.5,
        textColor=JAKE_DARK, leading=12.5,
        leftIndent=12, bulletIndent=4, bulletFontSize=6,
    )
    s_body = ParagraphStyle(
        "JKBody", parent=styles["Normal"], fontSize=9.5,
        textColor=JAKE_DARK, leading=13,
    )
    s_footer = ParagraphStyle(
        "JKFooter", parent=styles["Normal"], fontSize=7,
        textColor=GRAY_400, alignment=TA_CENTER,
    )

    entry_style = TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ])

    elements = []
    pi = data.get("personal_info", {})

    # ── Name (large, centered, uppercase for small-caps effect)
    name = pi.get("name", "")
    elements.append(Paragraph(name.upper(), s_name))

    # ── Contact line (plain text, no unicode icons — Helvetica safe)
    contact_parts = []
    if pi.get("phone"):
        contact_parts.append(pi["phone"])
    if pi.get("email"):
        contact_parts.append(pi["email"])
    if pi.get("linkedin"):
        contact_parts.append(pi["linkedin"])
    if pi.get("github") or pi.get("portfolio"):
        contact_parts.append(pi.get("github") or pi.get("portfolio"))
    if contact_parts:
        elements.append(Paragraph("  |  ".join(contact_parts), s_contact))

    # ── Objective / Summary
    obj = data.get("objective", "")
    if obj:
        elements.append(Paragraph("Summary", s_section))
        elements.append(HRFlowable(width="100%", thickness=1, color=JAKE_BLACK, spaceAfter=2 * mm))
        elements.append(Paragraph(obj, s_body))

    # ── Education
    edu_list = data.get("education", [])
    if edu_list:
        elements.append(Paragraph("Education", s_section))
        elements.append(HRFlowable(width="100%", thickness=1, color=JAKE_BLACK, spaceAfter=2 * mm))
        for e in edu_list:
            row1 = Table(
                [[Paragraph(f"<b>{e.get('institution', '')}</b>", s_entry_bold),
                  Paragraph(f"<b>{e.get('year', '')}</b>", s_entry_right)]],
                colWidths=[page_w * 0.65, page_w * 0.35],
            )
            row1.setStyle(entry_style)
            elements.append(row1)
            sub_left = e.get("degree", "")
            if e.get("stream"):
                sub_left += f", {e['stream']}"
            sub_right = e.get("grade", "")
            if sub_left or sub_right:
                row2 = Table(
                    [[Paragraph(sub_left, s_entry_italic),
                      Paragraph(sub_right, s_entry_italic_r)]],
                    colWidths=[page_w * 0.65, page_w * 0.35],
                )
                row2.setStyle(entry_style)
                elements.append(row2)
            elements.append(Spacer(1, 2 * mm))

    # ── Achievements
    achievements = data.get("achievements", [])
    if achievements:
        elements.append(Paragraph("Achievements", s_section))
        elements.append(HRFlowable(width="100%", thickness=1, color=JAKE_BLACK, spaceAfter=2 * mm))
        for a in achievements:
            elements.append(Paragraph(a, s_bullet, bulletText="\u2022"))

    # ── Experience
    exp_list = data.get("experience", [])
    if exp_list:
        elements.append(Paragraph("Experience", s_section))
        elements.append(HRFlowable(width="100%", thickness=1, color=JAKE_BLACK, spaceAfter=2 * mm))
        for exp in exp_list:
            row1 = Table(
                [[Paragraph(f"<b>{exp.get('company', '')}</b>", s_entry_bold),
                  Paragraph(f"<b>{exp.get('duration', '')}</b>", s_entry_right)]],
                colWidths=[page_w * 0.65, page_w * 0.35],
            )
            row1.setStyle(entry_style)
            elements.append(row1)
            location = exp.get("location", "")
            row2 = Table(
                [[Paragraph(exp.get("title", ""), s_entry_italic),
                  Paragraph(location, s_entry_italic_r)]],
                colWidths=[page_w * 0.65, page_w * 0.35],
            )
            row2.setStyle(entry_style)
            elements.append(row2)
            for b in exp.get("bullets", []):
                elements.append(Paragraph(b, s_bullet, bulletText="\u2022"))
            elements.append(Spacer(1, 2 * mm))

    # ── Projects
    proj_list = data.get("projects", [])
    if proj_list:
        elements.append(Paragraph("Projects", s_section))
        elements.append(HRFlowable(width="100%", thickness=1, color=JAKE_BLACK, spaceAfter=2 * mm))
        for p in proj_list:
            ts = p.get("tech_stack", [])
            title_left = f"<b>{p.get('name', '')}</b>"
            if ts:
                title_left += f"  |  <i>{', '.join(ts)}</i>"
            row1 = Table(
                [[Paragraph(title_left, s_entry_bold),
                  Paragraph("", s_entry_right)]],
                colWidths=[page_w * 0.75, page_w * 0.25],
            )
            row1.setStyle(entry_style)
            elements.append(row1)
            for b in p.get("bullets", []):
                elements.append(Paragraph(b, s_bullet, bulletText="\u2022"))
            elements.append(Spacer(1, 2 * mm))

    # ── Skills
    skills = data.get("skills", {})
    if any(skills.get(k) for k in ["technical", "soft", "languages", "tools"]):
        elements.append(Paragraph("Technical Skills", s_section))
        elements.append(HRFlowable(width="100%", thickness=1, color=JAKE_BLACK, spaceAfter=2 * mm))
        for label, key in [("Languages", "languages"), ("Technologies/Frameworks", "technical"), ("Developer Tools", "tools"), ("Soft Skills", "soft")]:
            if skills.get(key):
                elements.append(Paragraph(f"<b>{label}:</b> {', '.join(skills[key])}", s_body))
                elements.append(Spacer(1, 1 * mm))

    # ── Certifications
    certs = data.get("certifications", [])
    if certs:
        elements.append(Paragraph("Certifications", s_section))
        elements.append(HRFlowable(width="100%", thickness=1, color=JAKE_BLACK, spaceAfter=2 * mm))
        for c in certs:
            line = f"<b>{c.get('name', '')}</b>"
            parts = [p for p in [c.get("issuer"), c.get("year")] if p]
            if parts:
                line += f" -- {', '.join(parts)}"
            elements.append(Paragraph(line, s_body))

    # Footer
    elements.append(Spacer(1, 5 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GRAY_200, spaceAfter=2 * mm))
    elements.append(Paragraph("Generated by iKlavya AI Resume Builder  |  www.iklavya.in  |  contact@iklavya.in", s_footer))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()

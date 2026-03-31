import json

CAREER_COUNSELOR_SYSTEM_PROMPT = """You are IKLAVYA AI Career Counselor — a warm, professional, and deeply insightful career guidance expert for Indian students ranging from Class 8 to post-graduation level.

## Your Mission
Through natural, empathetic conversation, you will:
1. Understand the student's background, interests, strengths, and aspirations
2. Ask 12-15 thoughtful, dynamic questions (not a rigid list — adapt based on their responses)
3. After gathering sufficient information, provide a comprehensive career analysis

## Conversation Guidelines
- Be conversational and encouraging, never robotic or formulaic
- Ask ONE question at a time — never overwhelm with multiple questions
- Adapt your language complexity to the student's education level
- Show genuine curiosity about their answers — reference their previous responses
- If a student seems confused or unsure, provide gentle examples or reframe the question
- Be culturally aware of the Indian education system (CBSE, ICSE, State Boards, JEE, NEET, etc.)
- Be honest — if a career path is extremely competitive, acknowledge it while being supportive

## Question Areas to Cover (adapt dynamically):
- Academic interests and favorite subjects (and WHY they enjoy them)
- Extracurricular activities and hobbies
- Skills they're proud of and skills they want to develop
- Career aspirations and role models (if any)
- Understanding of different career fields
- Work environment preferences (team vs solo, creative vs structured, etc.)
- Short-term and long-term goals
- Concerns or fears about career choices
- Family expectations and support system
- Willingness to relocate, study further, or take unconventional paths

## Interactive Answer Options (REQUIRED for EVERY question)
After EVERY question you ask, you MUST append clickable answer options using this exact tag on its own line:
<options>["Option A", "Option B", "Option C", "Option D", "Something else / I'll type my own"]</options>

Rules for options:
- Provide 4-5 options maximum
- Each option must be under 10 words
- Options must be genuinely distinct and meaningful choices
- Always include "Something else / I'll type my own" as the last option
- The options array MUST be valid JSON (double quotes only, no trailing comma)
- Do NOT include options when giving your final analysis

## Progress Tracking (REQUIRED after EVERY response)
After every response (including questions AND the final analysis), append your confidence level toward generating the final report using this exact tag on its own line:
<progress>{{"percent": 10, "remaining_estimate": 12, "status": "on_track"}}</progress>

Rules for progress:
- "percent": integer 0-100 representing how ready you are to write the final report (start at ~5-10%)
- "remaining_estimate": integer, your best guess of questions still needed (0 when generating analysis)
- "status": one of "on_track" | "direction_changed" | "deepening" | "ready"
  - "on_track": answers are consistent and informative, progress advancing normally
  - "direction_changed": student contradicted or significantly changed a previous answer — REDUCE percent by 10-20, increase remaining_estimate
  - "deepening": student gave a vague/shallow answer, need to probe deeper — hold percent steady
  - "ready": about to generate or generating analysis (percent 90-100)
- When generating final analysis, set percent=100, remaining_estimate=0, status="ready"
- CRITICAL: If a student changes career direction (e.g., said "engineer" before, now says "doctor"), you MUST decrease percent and increase remaining_estimate to reflect that earlier questions are partially invalidated

## When to Provide Analysis
After you have asked approximately 12-15 questions and feel you have a comprehensive understanding of the student, provide your final analysis. You MUST include the analysis in the exact format below.

IMPORTANT: Wrap your analysis in these exact tags:

<analysis_json>
{{
  "top_careers": [
    {{
      "title": "Career Title",
      "match_score": 85,
      "reason": "Why this fits based on their responses"
    }}
  ],
  "strengths_identified": ["strength1", "strength2", "strength3"],
  "areas_to_develop": ["area1", "area2"],
  "personality_traits": ["trait1", "trait2", "trait3"],
  "education_recommendations": ["recommendation1", "recommendation2"]
}}
</analysis_json>

<analysis_markdown>
## Your Career Analysis

### Top Career Recommendations
[Detailed writeup of each recommended career with reasoning]

### Your Key Strengths
[Bulleted list with explanations]

### Areas for Growth
[Constructive suggestions]

### Recommended Next Steps
[Actionable items the student can start working on immediately]
</analysis_markdown>

<roadmap_json>
{{
  "steps": [
    {{
      "order": 1,
      "title": "Step Title",
      "description": "What to do",
      "timeline": "When to do it"
    }}
  ]
}}
</roadmap_json>

{user_context}
{session_context}
{force_analysis_instruction}"""


SESSION_SUMMARY_PROMPT = """Summarize the following career counseling conversation in 150-200 words. Focus on:
- Key interests and aspirations the student mentioned
- Important strengths and weaknesses identified
- Career directions discussed
- Any notable concerns or preferences

Write in third person (e.g., "The student expressed interest in..."). Be factual and concise.

Conversation:
{conversation}"""


def _parse_json_list(value: str | None) -> str:
    """Parse a JSON string list field into a human-readable comma-separated string."""
    if not value:
        return ""
    try:
        items = json.loads(value)
        if isinstance(items, list):
            return ", ".join(str(item) for item in items)
    except (json.JSONDecodeError, TypeError):
        pass
    # If it's already a plain string (not JSON), return as-is
    return value


def build_system_prompt(user, profile=None, context_summary=None, force_analysis=False):
    """Build the complete system prompt with user context interpolated."""
    user_context = f"\n## Student Information\n- Name: {user.name}\n- Institution: {user.college}"

    if profile:
        parts = [user_context]
        if profile.education_level:
            parts.append(f"- Education Level: {profile.education_level}")
        if profile.class_or_year:
            parts.append(f"- Class/Year: {profile.class_or_year}")
        if profile.board:
            parts.append(f"- Board: {profile.board}")
        if profile.stream:
            parts.append(f"- Stream: {profile.stream}")
        if profile.cgpa:
            parts.append(f"- CGPA: {profile.cgpa}")
        if profile.city and profile.state:
            parts.append(f"- Location: {profile.city}, {profile.state}")

        hobbies = _parse_json_list(profile.hobbies)
        if hobbies:
            parts.append(f"- Hobbies: {hobbies}")

        interests = _parse_json_list(profile.interests)
        if interests:
            parts.append(f"- Interests: {interests}")

        strengths = _parse_json_list(profile.strengths)
        if strengths:
            parts.append(f"- Self-reported Strengths: {strengths}")

        weaknesses = _parse_json_list(profile.weaknesses)
        if weaknesses:
            parts.append(f"- Self-reported Weaknesses: {weaknesses}")

        languages = _parse_json_list(profile.languages)
        if languages:
            parts.append(f"- Languages: {languages}")

        if profile.career_aspiration_raw:
            parts.append(f"- Career Aspiration: {profile.career_aspiration_raw}")
        if profile.parent_occupation:
            parts.append(f"- Parent Occupation: {profile.parent_occupation}")
        if profile.income_range:
            parts.append(f"- Family Income Range: {profile.income_range}")
        user_context = "\n".join(parts)

    session_context = ""
    if context_summary and context_summary.cumulative_summary:
        session_context = f"\n## Previous Session Context\nThe student has had previous counseling sessions. Here is a summary of past interactions:\n{context_summary.cumulative_summary}"

    force_analysis_instruction = ""
    if force_analysis:
        force_analysis_instruction = (
            "\n\n## IMPORTANT INSTRUCTION\n"
            "You have asked enough questions. In your NEXT response, you MUST provide "
            "the complete career analysis with <analysis_json>, <analysis_markdown>, "
            "and <roadmap_json> tags. Do NOT ask any more questions."
        )

    return CAREER_COUNSELOR_SYSTEM_PROMPT.format(
        user_context=user_context,
        session_context=session_context,
        force_analysis_instruction=force_analysis_instruction,
    )


# ─── Resume Builder ─────────────────────────────────────────

RESUME_BUILDER_SYSTEM_PROMPT = """You are IKLAVYA AI Resume Builder — a friendly, professional resume-writing assistant for Indian students and fresh graduates.

## Your Mission
Through natural conversation, gather all the information needed to build a complete, ATS-friendly resume. Ask questions one at a time, be encouraging, and help the student articulate their experience effectively.

## Conversation Guidelines
- Be conversational, warm, and supportive — never robotic
- Ask ONE question at a time — never overwhelm with multiple questions
- Start by asking their name and what they are studying / have studied
- Adapt follow-up questions based on their education level (school, college, post-grad)
- Help them reframe weak descriptions into strong, action-verb bullet points
- If they say "I don't have experience", help them identify projects, internships, volunteering, or academic achievements that count
- Be culturally aware of Indian education (CBSE, ICSE, State Boards, B.Tech, B.Com, BA, etc.)
- Suggest quantifiable metrics when possible ("How many users?", "What was the result?")
- For freshers, emphasize projects, skills, and certifications over work experience

## Information to Gather (adapt dynamically):
1. **Personal Info**: Full name, email, phone, city/location
2. **Education**: Degree(s), institution(s), year(s), CGPA/percentage, board (if school)
3. **Career Objective**: What role/field they're targeting (help them write a 2-3 line objective)
4. **Experience**: Internships, part-time jobs, freelance work (title, company, duration, what they did)
5. **Projects**: Academic or personal projects (name, description, tech stack, impact)
6. **Skills**: Technical skills, soft skills, languages known, tools/software
7. **Achievements**: Awards, competitions, publications, hackathons
8. **Certifications**: Online courses, certifications with issuer and year

## Important Rules
- If the student has NO work experience, that is perfectly fine — skip the experience section and focus on projects, skills, and achievements
- Always ask about projects — even class assignments count for freshers
- After gathering skills, suggest additional relevant skills they might have missed
- Keep the conversation to approximately 8-12 exchanges before generating the resume

## When to Generate the Resume
After you have gathered sufficient information (approximately 8-12 exchanges), generate the structured resume data. Before generating, briefly summarize what you have collected and ask "Should I generate your resume now, or would you like to add anything else?"

When ready, output the resume in this EXACT format:

<resume_json>
{{{{
  "personal_info": {{{{
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+91 XXXXX XXXXX",
    "location": "City, State",
    "linkedin": null,
    "portfolio": null,
    "github": null
  }}}},
  "objective": "2-3 sentence career objective tailored to their target role",
  "education": [
    {{{{
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Start - End or Expected Year",
      "grade": "CGPA: X.X/10 or XX%",
      "board": null,
      "stream": "Branch or Stream (e.g. Computer Science, Commerce)"
    }}}}
  ],
  "experience": [
    {{{{
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "location": "City or Remote",
      "bullets": ["Strong action-verb bullet point with metrics"]
    }}}}
  ],
  "projects": [
    {{{{
      "name": "Project Name",
      "description": "One-line description",
      "tech_stack": ["Tech1", "Tech2"],
      "bullets": ["What you built and the impact"]
    }}}}
  ],
  "skills": {{{{
    "technical": ["Skill1", "Skill2"],
    "soft": ["Skill1", "Skill2"],
    "languages": ["English", "Hindi"],
    "tools": ["Tool1", "Tool2"]
  }}}},
  "achievements": ["Achievement 1", "Achievement 2"],
  "certifications": [
    {{{{
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "year": "Year"
    }}}}
  ]
}}}}
</resume_json>

IMPORTANT: The JSON must be valid and complete. Use empty arrays [] for sections the student has no data for. Never use null for array fields. Rewrite all bullet points to start with strong action verbs (Led, Developed, Designed, Implemented, Achieved, etc.) and include quantifiable metrics where possible.

After outputting the resume_json, provide a brief friendly message like "Your resume is ready! You can preview it and choose a template to download as PDF."

{user_context}
{force_resume_instruction}"""


def build_resume_system_prompt(user, profile=None, force_resume=False):
    """Build the system prompt for resume builder with user context."""
    parts = [f"\n## Student Information\n- Name: {user.name}\n- Institution: {user.college}"]

    if profile:
        if profile.education_level:
            parts.append(f"- Education Level: {profile.education_level}")
        if profile.class_or_year:
            parts.append(f"- Class/Year: {profile.class_or_year}")
        if profile.board:
            parts.append(f"- Board: {profile.board}")
        if profile.stream:
            parts.append(f"- Stream: {profile.stream}")
        if profile.cgpa:
            parts.append(f"- CGPA: {profile.cgpa}")
        if profile.city and profile.state:
            parts.append(f"- Location: {profile.city}, {profile.state}")
        languages = _parse_json_list(profile.languages)
        if languages:
            parts.append(f"- Languages: {languages}")
        if profile.career_aspiration_raw:
            parts.append(f"- Career Aspiration: {profile.career_aspiration_raw}")

    user_context = "\n".join(parts)

    force_resume_instruction = ""
    if force_resume:
        force_resume_instruction = (
            "\n\n## IMPORTANT INSTRUCTION\n"
            "You have gathered enough information. In your NEXT response, you MUST output "
            "the complete resume JSON inside <resume_json> tags. Do NOT ask any more questions."
        )

    return RESUME_BUILDER_SYSTEM_PROMPT.format(
        user_context=user_context,
        force_resume_instruction=force_resume_instruction,
    )


# ─── Mentorship Hub ────────────────────────────────────────

MENTORSHIP_SYSTEM_PROMPT = """You are IKLAVYA's personal mentorship assistant. You combine the warmth of a supportive mentor with deep knowledge of the student's journey on the platform.

## Your Personality
- Empathetic and patient — students come to you with confusion, frustration, and self-doubt
- Validate feelings before offering advice ("I understand that can feel overwhelming...")
- Be practical — always give actionable next steps, not just motivation
- Reference the student's actual data when relevant
- You are NOT a generic chatbot. You know this student through their platform activity.

## Available Mentors
When a student needs specialized human guidance, recommend connecting with one of these mentors:
{mentor_profiles}

## What You Can Help With
- Career confusion and decision-making
- Skill gap analysis based on their profile
- Resume and interview preparation guidance
- Emotional support around career anxiety
- Recommending specific platform features (Career Guidance sessions, Resume Builder, Skill Assessments)
- Connecting students with the right mentor

## Guidelines
- Keep responses warm but concise (3-5 sentences unless detail is needed)
- Ask clarifying questions when the student's concern is vague
- If the student seems distressed, prioritize emotional support before advice
- Use simple language — many users are Indian college students
- Never fabricate data about the student — only reference what you actually know
- If you don't have enough context, say so honestly and suggest they complete their profile

{user_context}
{activity_context}"""


def build_mentorship_system_prompt(
    user, profile=None, context_summary=None,
    recent_sessions=None, recent_applications=None, resume_count=0,
):
    """Build system prompt for mentorship chatbot with full user context."""

    # User context (reuse pattern from career guidance)
    parts = [f"\n## Student Information\n- Name: {user.name}\n- Institution: {user.college}"]

    if profile:
        if profile.education_level:
            parts.append(f"- Education: {profile.education_level}")
        if profile.stream:
            parts.append(f"- Stream: {profile.stream}")
        if profile.class_or_year:
            parts.append(f"- Year: {profile.class_or_year}")
        if profile.cgpa:
            parts.append(f"- CGPA: {profile.cgpa}")
        if profile.city and profile.state:
            parts.append(f"- Location: {profile.city}, {profile.state}")

        skills = _parse_json_list(profile.skills)
        if skills:
            parts.append(f"- Skills: {skills}")

        strengths = _parse_json_list(profile.strengths)
        if strengths:
            parts.append(f"- Strengths: {strengths}")

        weaknesses = _parse_json_list(profile.weaknesses)
        if weaknesses:
            parts.append(f"- Weaknesses: {weaknesses}")

        interests = _parse_json_list(profile.interests)
        if interests:
            parts.append(f"- Interests: {interests}")

        if profile.career_aspiration_raw:
            parts.append(f"- Career Aspiration: {profile.career_aspiration_raw}")

        if profile.summary:
            parts.append(f"- Professional Summary: {profile.summary}")

    user_context = "\n".join(parts)

    # Activity context
    activity_parts = ["\n## Platform Activity"]

    if context_summary and context_summary.cumulative_summary:
        activity_parts.append(
            f"\n### Career Guidance Insights\n{context_summary.cumulative_summary}"
        )

    if recent_sessions:
        session_list = ", ".join(
            f"{s.title} ({s.status})" for s in recent_sessions
        )
        activity_parts.append(f"- Recent sessions: {session_list}")

    if recent_applications:
        job_list = ", ".join(
            f"{job.title} at {job.company}" for _app, job in recent_applications[:5]
        )
        activity_parts.append(f"- Jobs explored: {job_list}")

    activity_parts.append(f"- Resumes built: {resume_count}")

    activity_context = "\n".join(activity_parts)

    # Mentor profiles
    mentor_profiles = """- Priya Sharma — Resume Building & ATS Optimization (5+ years helping students craft winning resumes)
- Arjun Mehta — Communication & Interview Skills (Corporate trainer, 200+ mock interviews)
- Dr. Kavita Reddy — Career Planning & Higher Education (PhD counselor, career path guidance)
- Rahul Verma — Technical Skills & Coding (Ex-Google engineer, mentors aspiring developers)"""

    return MENTORSHIP_SYSTEM_PROMPT.format(
        user_context=user_context,
        activity_context=activity_context,
        mentor_profiles=mentor_profiles,
    )

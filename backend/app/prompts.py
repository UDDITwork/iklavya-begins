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

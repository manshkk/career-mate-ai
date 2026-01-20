import json
import os
from openai import OpenAI
from app.schemas.resume_rewrite import ResumeRewriteResponse

# -----------------------------------
# OpenAI client (OpenRouter compatible)
# -----------------------------------
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")  # optional, works for OpenRouter
)

# -----------------------------------
# Rewrite + Rank Resume Bullets
# -----------------------------------
async def rewrite_resume_bullets(
    resume_text: str,
    job_description: str
) -> ResumeRewriteResponse:
    """
    Rewrites weak resume bullets and ranks them by impact (0–100).
    """

    prompt = f"""
You are an ATS optimization and resume rewriting expert.

TASK:
1. Identify weak or generic resume bullets.
2. Rewrite them to strongly match the job description.
3. Assign an impact score (0–100) to each rewritten bullet.

Impact scoring criteria:
- Job description keyword relevance (40%)
- Strong action verbs (20%)
- Quantified impact / metrics (20%)
- Technical specificity (20%)

Return ONLY valid JSON in the following format:
{{
  "rewritten_bullets": [
    {{
      "original": "",
      "rewritten": "",
      "reason": "",
      "impact_score": 0
    }}
  ]
}}

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a professional resume optimization expert."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    raw_output = response.choices[0].message.content.strip()

    try:
        data = json.loads(raw_output)
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON returned by model:\n{raw_output}")

    # -----------------------------------
    # Sort bullets by impact (HIGH → LOW)
    # -----------------------------------
    data["rewritten_bullets"].sort(
        key=lambda x: x.get("impact_score", 0),
        reverse=True
    )

    return ResumeRewriteResponse.model_validate(data)


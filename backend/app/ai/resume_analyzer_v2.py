import os
import json
from openai import OpenAI
from app.schemas.resume_analysis_v2 import ResumeAnalysisV2

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def resume_analyzer_v2(resume_text: str, target_role: str | None):
    role_text = f"For the target role: {target_role}" if target_role else "No target role provided."

    prompt = f"""
You are an ATS resume evaluator.

Evaluate the resume strictly and return ONLY valid JSON.

Scoring rules:
- ATS score: 0–100
- Role match score: 0–100 (null if no role)
- Be strict and realistic
- Give actionable feedback

JSON format:
{{
  "ats_score": 0,
  "role_match_score": null,
  "detected_skills": [],
  "missing_skills": [],
  "strengths": [],
  "critical_improvements": [],
  "section_feedback": [
    {{
      "section": "Experience",
      "score": 0,
      "comments": []
    }}
  ],
  "final_verdict": ""
}}

Resume:
{resume_text}

{role_text}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a strict ATS resume evaluator."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
    )

    raw = response.choices[0].message.content.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON returned:\n{raw}")

    return ResumeAnalysisV2.model_validate(parsed)






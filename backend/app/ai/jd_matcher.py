import os
import json
from openai import OpenAI
from app.schemas.jd_match_analysis import JDMatchAnalysis

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def jd_matcher(resume_text: str, job_description: str):
    prompt = f"""
You are an ATS system comparing a resume against a job description.

Evaluate STRICTLY and return ONLY valid JSON.

Scoring rules:
- Match score: 0–100
- Be realistic (no inflated scores)
- Focus on skills, experience, and keywords

JSON format:
{{
  "match_score": 0,
  "matched_skills": [],
  "missing_skills": [],
  "experience_gaps": [],
  "keyword_coverage_percentage": 0,
  "improvement_suggestions": [],
  "final_verdict": ""
}}

Resume:
{resume_text}

Job Description:
{job_description}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a strict ATS matcher."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
    )

    raw = response.choices[0].message.content.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON returned:\n{raw}")

    return JDMatchAnalysis.model_validate(parsed)

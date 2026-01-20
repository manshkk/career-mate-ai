import json
import os
from dotenv import load_dotenv
from openai import OpenAI
from app.schemas.resume_analysis import ResumeAnalysis

# ---------------------------------
# LOAD ENV HERE (CRITICAL FIX)
# ---------------------------------
load_dotenv()

# Debug (keep temporarily)
print("Analyzer sees API key:", bool(os.getenv("OPENAI_API_KEY")))

# ---------------------------------
# OpenRouter client
# ---------------------------------
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
)

# ---------------------------------
# Resume analysis
# ---------------------------------
async def analyze_resume(resume_text: str) -> ResumeAnalysis:
    prompt = f"""
You are a resume analysis expert.

Return ONLY valid JSON with EXACT structure:

{{
  "skills_detected": [],
  "strengths": [],
  "weak_areas": [],
  "suggestions": []
}}

Resume:
{resume_text}
"""

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a professional resume analyst."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )

    raw_output = response.choices[0].message.content.strip()

    print("\nRAW MODEL OUTPUT:\n", raw_output)

    try:
        parsed = json.loads(raw_output)
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON:\n{raw_output}")

    return ResumeAnalysis.model_validate(parsed)














from app.ai.jd_matcher import jd_matcher


async def analyze_jd_match(resume_text: str, job_description: str):
    return await jd_matcher(resume_text, job_description)

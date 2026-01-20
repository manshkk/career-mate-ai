from app.ai.resume_analyzer_v2 import resume_analyzer_v2


async def analyze_resume_v2(resume_text: str, target_role: str | None):
    return await resume_analyzer_v2(resume_text, target_role)


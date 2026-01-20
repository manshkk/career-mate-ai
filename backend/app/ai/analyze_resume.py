from app.ai.resume_analyzer import analyze_resume

async def analyze_resume_text(resume_text: str):
    return await analyze_resume(resume_text)



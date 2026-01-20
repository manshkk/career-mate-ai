from pydantic import BaseModel
from typing import List, Optional


class ResumeSectionFeedback(BaseModel):
    section: str
    score: int
    comments: List[str]


class ResumeAnalysisV2(BaseModel):
    ats_score: int
    role_match_score: Optional[int] = None
    detected_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    critical_improvements: List[str]
    section_feedback: List[ResumeSectionFeedback]
    final_verdict: str

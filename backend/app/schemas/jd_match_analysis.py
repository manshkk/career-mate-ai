from pydantic import BaseModel
from typing import List


class JDMatchAnalysis(BaseModel):
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    experience_gaps: List[str]
    keyword_coverage_percentage: int
    improvement_suggestions: List[str]
    final_verdict: str

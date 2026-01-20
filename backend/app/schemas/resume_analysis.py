from pydantic import BaseModel
from typing import List


class ResumeAnalysis(BaseModel):
    skills_detected: List[str]
    strengths: List[str]
    weak_areas: List[str]
    suggestions: List[str]



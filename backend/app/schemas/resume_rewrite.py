from pydantic import BaseModel
from typing import List

class RewrittenBullet(BaseModel):
    original: str
    rewritten: str
    reason: str
    impact_score: int   # 🔥 NEW

class ResumeRewriteResponse(BaseModel):
    rewritten_bullets: List[RewrittenBullet]


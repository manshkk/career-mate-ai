from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import fitz  # PyMuPDF

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()
print("OPENAI_API_KEY loaded:", bool(os.getenv("OPENAI_API_KEY")))

# -----------------------------
# App imports
# -----------------------------
from app.ai.analyze_resume import analyze_resume_text
from app.ai.analyze_resume_v2 import analyze_resume_v2
from app.ai.analyze_jd_match import analyze_jd_match

from app.schemas.resume_analysis_v2 import ResumeAnalysisV2
from app.schemas.jd_match_analysis import JDMatchAnalysis


# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="Career Mate AI")

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Health check
# -----------------------------
@app.get("/")
def health_check():
    return {"status": "ok"}

# -----------------------------
# PDF Text Extraction
# -----------------------------
def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to read PDF") from e


# ======================================================
# V1 — BASIC RESUME ANALYSIS
# ======================================================
@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    resume_bytes = await file.read()
    resume_text = extract_text_from_pdf(resume_bytes)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract resume text")

    try:
        return await analyze_resume_text(resume_text)
    except Exception as e:
        print("V1 Resume analysis error:", e)
        raise HTTPException(status_code=500, detail="Resume analysis failed")


# ======================================================
# V2 — ATS RESUME SCORING
# ======================================================
@app.post("/upload-resume/v2", response_model=ResumeAnalysisV2)
async def upload_resume_v2(
    file: UploadFile = File(...),
    target_role: str = Form(None),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    resume_bytes = await file.read()
    resume_text = extract_text_from_pdf(resume_bytes)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract resume text")

    try:
        return await analyze_resume_v2(
            resume_text=resume_text,
            target_role=target_role,
        )
    except Exception as e:
        print("V2 Resume analysis error:", e)
        raise HTTPException(status_code=500, detail="Resume analysis failed")


# ======================================================
# V3 — RESUME + JOB DESCRIPTION MATCHING
# ======================================================
@app.post("/match-resume-jd", response_model=JDMatchAnalysis)
async def match_resume_with_jd(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    resume_bytes = await file.read()
    resume_text = extract_text_from_pdf(resume_bytes)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract resume text")

    try:
        return await analyze_jd_match(
            resume_text=resume_text,
            job_description=job_description,
        )
    except Exception as e:
        print("JD match error:", e)
        raise HTTPException(status_code=500, detail="JD matching failed")

from app.ai.rewrite_resume import rewrite_resume_bullets
from app.schemas.resume_rewrite import ResumeRewriteResponse

@app.post("/rewrite-resume", response_model=ResumeRewriteResponse)
async def rewrite_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported")

    resume_bytes = await file.read()
    resume_text = extract_text_from_pdf(resume_bytes)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract resume text")

    return await rewrite_resume_bullets(
        resume_text=resume_text,
        job_description=job_description,
    )


@app.post("/rewrite-resume", response_model=ResumeRewriteResponse)
async def rewrite_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported")

    resume_bytes = await file.read()
    resume_text = extract_text_from_pdf(resume_bytes)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract resume text")

    return await rewrite_resume_bullets(
        resume_text=resume_text,
        job_description=job_description,
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)









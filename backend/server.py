"""
GitGenie API — thin FastAPI wrapper around the existing CrewAI pipeline
(crew.py / agents.py / tasks.py) so the Lovable-generated frontend has a real
HTTP backend to talk to instead of its built-in mock data.

Run with:
    uvicorn server:app --reload --port 8000

Two crews are involved and both are slow (LLM calls + GitHub API calls), so
every analysis runs in a background thread and the frontend polls
GET /api/analyze/{job_id} for progress, matching the existing "loading"
pipeline UI in the dashboard.
"""

import json
import os
import threading
import traceback
import uuid
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from crew import profile_crew, recommendation_crew  # noqa: E402
from mapper import build_analysis_result, parse_json  # noqa: E402

app = FastAPI(title="GitGenie API")

# Dev-friendly CORS: the frontend runs on its own Vite/TanStack Start dev
# port, this API runs on 8000. Lock this down to a real origin in production.
allowed_origins = os.getenv("CORS_ALLOW_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allowed_origins == "*" else allowed_origins.split(","),
    allow_credentials=allowed_origins != "*",
    allow_methods=["*"],
    allow_headers=["*"],
)

JOBS: dict[str, dict] = {}
_LOCK = threading.Lock()


class StartRequest(BaseModel):
    github_username: str
    user_repository: Optional[str] = ""


class ManualProfileRequest(BaseModel):
    experience: Optional[str] = ""
    languages: Optional[str] = ""
    interests: Optional[str] = ""
    projects: Optional[str] = ""
    goal: Optional[str] = ""


def _set(job_id: str, **fields):
    with _LOCK:
        JOBS[job_id].update(fields)


def _run_pipeline(job_id: str, manual: bool = False):
    job = JOBS[job_id]
    inputs = job["inputs"]

    try:
        profile_result = profile_crew.kickoff(inputs=inputs)
        profile = parse_json(profile_result.raw)

        if profile.get("github_data_used") is False and not manual:
            _set(job_id, status="needs_profile", profile_draft=profile)
            return

        inputs["developer_profile"] = json.dumps(profile)
        rec_result = recommendation_crew.kickoff(inputs=inputs)

        # Tasks run in this order inside recommendation_crew (see crew.py):
        # repository_task, explanation_task, issue_task, roadmap_task, checklist_task
        outputs = rec_result.tasks_output
        repo_json = parse_json(outputs[0].raw)
        explain_json = parse_json(outputs[1].raw)
        issues_json = parse_json(outputs[2].raw)
        roadmap_json = parse_json(outputs[3].raw)
        checklist_json = parse_json(outputs[4].raw)

        result = build_analysis_result(
            inputs.get("github_username", ""),
            profile,
            repo_json,
            explain_json,
            issues_json,
            roadmap_json,
            checklist_json,
        )
        _set(job_id, status="done", result=result)

    except Exception as e:  # noqa: BLE001
        traceback.print_exc()
        _set(job_id, status="error", error=str(e))


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/analyze")
def start_analyze(req: StartRequest):
    if not req.github_username.strip():
        raise HTTPException(400, "github_username is required")

    job_id = str(uuid.uuid4())
    JOBS[job_id] = {
        "status": "running",
        "inputs": {
            "github_username": req.github_username.strip(),
            "user_repository": (req.user_repository or "").strip() or "not provided",
            "experience": "",
            "languages": "",
            "interests": "",
            "projects": "",
            "goal": "",
        },
        "result": None,
        "error": None,
    }
    threading.Thread(target=_run_pipeline, args=(job_id,), daemon=True).start()
    return {"job_id": job_id, "status": "running"}


@app.post("/api/analyze/{job_id}/manual")
def submit_manual_profile(job_id: str, req: ManualProfileRequest):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "job not found")

    job["inputs"].update(
        {
            "experience": req.experience or "",
            "languages": req.languages or "",
            "interests": req.interests or "",
            "projects": req.projects or "",
            "goal": req.goal or "",
        }
    )
    _set(job_id, status="running", result=None, error=None)
    threading.Thread(target=_run_pipeline, args=(job_id, True), daemon=True).start()
    return {"job_id": job_id, "status": "running"}


@app.get("/api/analyze/{job_id}")
def get_analyze(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    return {"status": job["status"], "result": job.get("result"), "error": job.get("error")}

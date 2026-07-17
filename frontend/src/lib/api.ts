// Thin client for the GitGenie backend (see /backend/server.py).
// Configure the backend origin with VITE_API_BASE_URL in a .env file;
// defaults to the FastAPI dev server's default port.

import type { AnalysisResult, ManualProfileInput } from "./mock-data";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export type JobStatus = "running" | "needs_profile" | "done" | "error";

export type JobStatusResponse = {
  status: JobStatus;
  result: AnalysisResult | null;
  error: string | null;
};

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore — no JSON body
    }
    throw new Error(`GitGenie API error (${res.status}): ${detail}`);
  }
  return res.json() as Promise<T>;
}

export async function startAnalysis(githubUsername: string, userRepository: string) {
  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      github_username: githubUsername,
      user_repository: userRepository,
    }),
  });
  return asJson<{ job_id: string; status: JobStatus }>(res);
}

export async function submitManualProfile(jobId: string, input: ManualProfileInput) {
  const res = await fetch(`${BASE_URL}/api/analyze/${jobId}/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      languages: input.skills,
      experience: input.experience,
      interests: input.interests,
      goal: input.goal || "",
      projects: "",
    }),
  });
  return asJson<{ job_id: string; status: JobStatus }>(res);
}

export async function getAnalysisStatus(jobId: string) {
  const res = await fetch(`${BASE_URL}/api/analyze/${jobId}`);
  return asJson<JobStatusResponse>(res);
}

import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { AnalysisResult, ManualProfileInput, Repository } from "./mock-data";
import { getAnalysisStatus, startAnalysis as apiStartAnalysis, submitManualProfile as apiSubmitManualProfile } from "./api";

export type DashboardView =
  | "overview"
  | "profile"
  | "repositories"
  | "details"
  | "issues"
  | "roadmap"
  | "checklist"
  | "settings";

export type AnalysisStatus = "idle" | "loading" | "needs-profile" | "done";

type AnalysisState = {
  status: AnalysisStatus;
  progress: number; // 0..8, drives the LoadingPipeline animation only
  result: AnalysisResult | null;
  username: string;
  repoQuery: string;
  view: DashboardView;
  jobId: string | null;
  error: string | null;
  checkedItems: Record<string, boolean>;
};

type Ctx = AnalysisState & {
  setView: (v: DashboardView) => void;
  startAnalysis: (username: string, repoQuery: string) => void;
  submitManualProfile: (input: ManualProfileInput) => void;
  toggleChecklistItem: (id: string) => void;
  reset: () => void;
};

const AnalysisCtx = createContext<Ctx | null>(null);

const INITIAL: AnalysisState = {
  status: "idle",
  progress: 0,
  result: null,
  username: "",
  repoQuery: "",
  view: "overview",
  jobId: null,
  error: null,
  checkedItems: {},
};

const POLL_INTERVAL_MS = 2500;
const PROGRESS_TICK_MS = 1400;

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnalysisState>(INITIAL);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimers = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  const pollJob = (jobId: string) => {
    pollTimer.current = setInterval(async () => {
      try {
        const res = await getAnalysisStatus(jobId);

        if (res.status === "needs_profile") {
          stopTimers();
          setState((s) => ({ ...s, status: "needs-profile", progress: 8 }));
          return;
        }

        if (res.status === "done" && res.result) {
          stopTimers();
          setState((s) => ({
            ...s,
            status: "done",
            progress: 8,
            result: res.result,
            view: "repositories",
          }));
          return;
        }

        if (res.status === "error") {
          stopTimers();
          setState((s) => ({
            ...s,
            status: "idle",
            progress: 0,
            error: res.error || "Analysis failed. Please try again.",
          }));
          return;
        }
        // status === "running" — keep polling
      } catch (err) {
        stopTimers();
        setState((s) => ({
          ...s,
          status: "idle",
          progress: 0,
          error: err instanceof Error ? err.message : "Could not reach the GitGenie backend.",
        }));
      }
    }, POLL_INTERVAL_MS);
  };

  const beginLoading = (username: string, repoQuery: string) => {
    stopTimers();
    setState((s) => ({
      ...s,
      status: "loading",
      progress: 0,
      username,
      repoQuery,
      result: null,
      error: null,
      checkedItems: {},
    }));

    // Purely cosmetic: advances the LoadingPipeline's step indicator while
    // we wait on the real backend job. Caps at 7 so it never claims "done"
    // before the poll actually confirms completion.
    progressTimer.current = setInterval(() => {
      setState((s) => (s.status === "loading" ? { ...s, progress: Math.min(7, s.progress + 1) } : s));
    }, PROGRESS_TICK_MS);
  };

  const api = useMemo<Ctx>(
    () => ({
      ...state,
      setView: (view) => setState((s) => ({ ...s, view })),
      toggleChecklistItem: (id) =>
        setState((s) => ({
          ...s,
          checkedItems: { ...s.checkedItems, [id]: !s.checkedItems[id] },
        })),
      reset: () => {
        stopTimers();
        setState(INITIAL);
      },
      startAnalysis: (username, repoQuery) => {
        beginLoading(username, repoQuery);
        apiStartAnalysis(username, repoQuery)
          .then(({ job_id }) => {
            setState((s) => ({ ...s, jobId: job_id }));
            pollJob(job_id);
          })
          .catch((err) => {
            stopTimers();
            setState((s) => ({
              ...s,
              status: "idle",
              progress: 0,
              error: err instanceof Error ? err.message : "Could not reach the GitGenie backend.",
            }));
          });
      },
      submitManualProfile: (input) => {
        const jobId = state.jobId;
        if (!jobId) return;
        beginLoading(state.username, state.repoQuery);
        apiSubmitManualProfile(jobId, input)
          .then(() => {
            setState((s) => ({ ...s, jobId }));
            pollJob(jobId);
          })
          .catch((err) => {
            stopTimers();
            setState((s) => ({
              ...s,
              status: "idle",
              progress: 0,
              error: err instanceof Error ? err.message : "Could not reach the GitGenie backend.",
            }));
          });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  return <AnalysisCtx.Provider value={api}>{children}</AnalysisCtx.Provider>;
}

export function useAnalysis() {
  const ctx = useContext(AnalysisCtx);
  if (!ctx) throw new Error("useAnalysis must be used inside <AnalysisProvider>");
  return ctx;
}

/** The single Selected Repository — driven by the backend, never by clicks on suggestions. */
export function useActiveRepo(): Repository | null {
  const { result } = useAnalysis();
  if (!result) return null;
  return result.repositories.find((r) => r.id === result.selectedRepoId) ?? null;
}

import { useState } from "react";
import { useAnalysis } from "@/lib/analysis-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Github } from "lucide-react";

export function InputPanel() {
  const { startAnalysis, status, error } = useAnalysis();
  const [username, setUsername] = useState("torvalds");
  const [repo, setRepo] = useState("");

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.5)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Wish upon a repo ✨</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell the Genie your GitHub username. He'll craft a full contribution plan just for you.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/50 px-2.5 py-1 text-xs text-muted-foreground md:inline-flex">
          <Sparkles className="h-3 w-3 text-primary" /> Powered by CrewAI
        </div>
      </div>

      <form
        className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!username.trim()) return;
          startAnalysis(username.trim(), repo.trim());
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">GitHub Username</span>
          <div className="relative">
            <Github className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. torvalds"
              className="h-11 rounded-xl pl-9"
              required
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Repository <span className="text-muted-foreground/60">(optional)</span>
          </span>
          <Input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="owner/name"
            className="h-11 rounded-xl"
          />
        </label>

        <Button
          type="submit"
          size="lg"
          className="h-11 gap-1.5 rounded-xl px-6 font-semibold transition-transform hover:scale-[1.03]"
          disabled={status === "loading"}
        >
          <Sparkles className="h-4 w-4" />
          Analyze
        </Button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}

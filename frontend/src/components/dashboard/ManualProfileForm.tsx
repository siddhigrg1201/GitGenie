import { useState } from "react";
import { useAnalysis } from "@/lib/analysis-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, UserRound } from "lucide-react";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export function ManualProfileForm() {
  const { submitManualProfile, status } = useAnalysis();
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState<(typeof LEVELS)[number]>("Intermediate");
  const [interests, setInterests] = useState("");
  const [goal, setGoal] = useState("");

  return (
    <div className="rounded-2xl border border-primary/40 bg-card p-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <UserRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Help us know you better ✨</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn't gather enough information from your GitHub profile. Share a few details and
            the Genie will pick up where it left off.
          </p>
        </div>
      </div>

      <form
        className="mt-5 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!skills.trim() || !interests.trim()) return;
          submitManualProfile({ skills: skills.trim(), experience, interests: interests.trim(), goal: goal.trim() });
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Programming Languages / Skills
          </span>
          <Input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. TypeScript, Python, React"
            className="h-11 rounded-xl"
            required
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Experience Level</span>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setExperience(l)}
                className={
                  "rounded-xl border px-3 py-2 text-sm font-medium transition-colors " +
                  (experience === l
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background/40 text-muted-foreground hover:text-foreground")
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Areas of Interest</span>
          <Input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. Developer tools, AI agents, DX"
            className="h-11 rounded-xl"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Learning Goal <span className="text-muted-foreground/60">(optional)</span>
          </span>
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do you want to learn from your next contribution?"
            className="h-11 rounded-xl"
          />
        </label>

        <div>
          <Button
            type="submit"
            size="lg"
            className="h-11 gap-1.5 rounded-xl px-6 font-semibold"
            disabled={status === "loading"}
          >
            <Sparkles className="h-4 w-4" />
            Continue analysis
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAnalysis } from "@/lib/analysis-store";
import { Loader2 } from "lucide-react";
import genieMascot from "@/assets/genie-mascot.png";

const MESSAGES = [
  "✨ Finding repositories...",
  "🧞 Understanding your skills...",
  "🚀 Searching GitHub...",
  "📚 Reading repository...",
  "🤖 Analyzing codebase...",
  "💡 Finding beginner issues...",
  "🎯 Building your roadmap...",
  "✅ Preparing final report...",
];

export function LoadingPipeline() {
  const { progress } = useAnalysis();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(iv);
  }, []);

  const currentMsg = MESSAGES[Math.max(0, Math.min(MESSAGES.length - 1, Math.max(progress, tick % MESSAGES.length)))];

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-10 text-center animate-[fade-in_0.4s_ease-out]">
      <div className="relative">
        <img
          src={genieMascot}
          alt="GitGenie mascot floating"
          width={380}
          height={380}
          className="h-64 w-64 animate-[float_4s_ease-in-out_infinite] drop-shadow-[0_25px_35px_rgba(139,92,246,0.35)]"
        />
        <span className="absolute -left-2 top-10 h-2 w-2 rounded-full bg-[color:var(--warning)] animate-[sparkle_2.4s_ease-in-out_infinite]" />
        <span className="absolute right-4 top-24 h-1.5 w-1.5 rounded-full bg-accent animate-[sparkle_2s_ease-in-out_infinite]" />
        <span className="absolute right-12 bottom-6 h-2 w-2 rounded-full bg-[color:var(--success)] animate-[sparkle_3s_ease-in-out_infinite]" />
      </div>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
        Running analysis
      </div>

      <h2 className="mt-3 text-3xl font-bold tracking-tight">Casting a little magic...</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Hang tight — the Genie is working through your GitHub footprint.
      </p>

      <div
        key={currentMsg}
        className="mt-6 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm animate-[slide-up_0.4s_ease-out]"
      >
        {currentMsg}
      </div>

      <div className="mt-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-card">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${Math.round((progress / 8) * 100)}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground tabular-nums">
        Step {Math.min(progress + 1, 8)} of 8
      </div>
    </div>
  );
}

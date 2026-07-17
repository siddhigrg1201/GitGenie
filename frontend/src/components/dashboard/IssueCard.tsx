import type { Issue } from "@/lib/mock-data";
import { Github, Clock, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const NOTE_COLORS = [
  { bg: "bg-[#FFE58A]", ink: "text-[#4a3a00]", tilt: "-rotate-1" },
  { bg: "bg-[#A8D8FF]", ink: "text-[#0b3b6b]", tilt: "rotate-1" },
  { bg: "bg-[#B7EFC5]", ink: "text-[#0d3d1f]", tilt: "-rotate-2" },
  { bg: "bg-[#FFC1D5]", ink: "text-[#5a0f2a]", tilt: "rotate-2" },
];

export function IssueCard({ issue, index = 0 }: { issue: Issue; index?: number }) {
  const c = NOTE_COLORS[index % NOTE_COLORS.length];

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl p-5 shadow-[0_18px_30px_-18px_rgba(0,0,0,0.55)] transition-transform duration-200",
        "hover:-translate-y-1 hover:rotate-0",
        c.bg,
        c.ink,
        c.tilt,
      )}
    >
      {/* tape */}
      <span className="absolute -top-2.5 left-1/2 h-4 w-16 -translate-x-1/2 rounded-sm bg-white/50 shadow-sm" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[11px] opacity-70">#{issue.number}</div>
          <h3 className="mt-0.5 text-base font-bold leading-snug">{issue.title}</h3>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
            issue.difficulty === "Easy" && "border-[#0d3d1f]/30 bg-[#57C785] text-[#0d3d1f]",
            issue.difficulty === "Medium" && "border-[#4a3a00]/30 bg-[#F5B14C] text-[#4a3a00]",
            issue.difficulty === "Hard" && "border-[#5a0f2a]/30 bg-[#FF6B6B] text-white",
          )}
        >
          {issue.difficulty}
        </span>
      </div>

      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium opacity-80">
        <Clock className="h-3.5 w-3.5" />
        {issue.estimatedTime}
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Skills</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {issue.requiredSkills.map((s) => (
            <span
              key={s}
              className="rounded-full bg-white/40 px-2 py-0.5 text-[11px] font-semibold"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-white/35 p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-80">
          <Sparkles className="h-3 w-3" /> Learning outcome
        </div>
        <p className="mt-1 text-sm font-medium">{issue.learningOutcome}</p>
      </div>

      <div className="mt-3 rounded-xl bg-white/35 p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-80">
          <Target className="h-3 w-3" /> Why suitable
        </div>
        <p className="mt-1 text-sm font-medium">
          Matches your skill profile and lands within {issue.estimatedTime.toLowerCase()}.
        </p>
      </div>

      <a
        href={issue.url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-black/80 px-3 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
      >
        <Github className="h-3.5 w-3.5" />
        View on GitHub
      </a>
    </article>
  );
}

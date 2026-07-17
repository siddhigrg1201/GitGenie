import type { Repository } from "@/lib/mock-data";
import { Github, Star, Rocket, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function difficultyStyles(d: string) {
  const v = d.toLowerCase();
  if (v.includes("begin") || v === "easy")
    return "bg-[color-mix(in_oklab,var(--success)_22%,transparent)] text-[color:var(--success)] border-[color-mix(in_oklab,var(--success)_45%,transparent)]";
  if (v.includes("inter") || v === "medium")
    return "bg-[color-mix(in_oklab,var(--warning)_22%,transparent)] text-[color:var(--warning)] border-[color-mix(in_oklab,var(--warning)_45%,transparent)]";
  return "bg-[color-mix(in_oklab,var(--destructive)_22%,transparent)] text-[color:var(--destructive)] border-[color-mix(in_oklab,var(--destructive)_45%,transparent)]";
}

export function RepositoryCard({
  repo,
  active,
  onSelect,
  onOpenDetails,
}: {
  repo: Repository;
  rank: number;
  active: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_20px_40px_-30px_rgba(0,0,0,0.6)] transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-[0_25px_45px_-25px_rgba(0,0,0,0.7)]",
        active
          ? "border-primary ring-2 ring-primary/40 shadow-[0_0_0_1px_var(--primary),0_20px_40px_-20px_rgba(79,140,255,0.35)]"
          : "border-border hover:border-primary/40",
      )}
    >
      {/* macOS titlebar */}
      <div className="flex items-center gap-2 border-b border-border bg-[color:var(--sidebar)] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#FF6B6B]" />
        <span className="h-3 w-3 rounded-full bg-[#F5B14C]" />
        <span className="h-3 w-3 rounded-full bg-[#57C785]" />
        <div className="ml-2 flex-1 truncate text-center font-mono text-[11px] text-muted-foreground">
          {repo.owner}/{repo.name}
        </div>
        {active && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <Check className="h-3 w-3" /> Selected
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{repo.owner}</div>
            <h3 className="truncate text-xl font-bold tracking-tight">{repo.name}</h3>
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1 inline-flex items-center gap-1 truncate font-mono text-[11px] text-muted-foreground hover:text-primary"
            >
              <Github className="h-3 w-3" />
              {repo.url.replace("https://", "")}
            </a>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-4xl font-extrabold leading-none tabular-nums text-primary">
              {repo.score}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Match
            </div>
          </div>
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{repo.reason}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              difficultyStyles(repo.difficulty),
            )}
          >
            {repo.difficulty}
          </span>
          {repo.matchedSkills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-full border border-border bg-background/40 px-2.5 py-0.5 text-xs font-medium text-foreground/90"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-[color:var(--warning)]" />
            {repo.stars.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {repo.language}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            onSelect();
            onOpenDetails();
          }}
          className={cn(
            "mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
            active
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground",
          )}
        >
          <Rocket className="h-4 w-4" />
          {active ? "Explore Repository" : "🚀 Analyze Repository"}
        </button>
        {!active && (
          <button
            type="button"
            onClick={onSelect}
            className="mt-2 w-full rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Select as active repository
          </button>
        )}
      </div>
    </div>
  );
}

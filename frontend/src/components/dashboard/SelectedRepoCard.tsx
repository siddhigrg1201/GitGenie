import type { Repository } from "@/lib/mock-data";
import { Github, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function difficultyStyles(d: string) {
  const v = d.toLowerCase();
  if (v.includes("begin") || v === "easy")
    return "bg-[color-mix(in_oklab,var(--success)_22%,transparent)] text-[color:var(--success)] border-[color-mix(in_oklab,var(--success)_45%,transparent)]";
  if (v.includes("inter") || v === "medium")
    return "bg-[color-mix(in_oklab,var(--warning)_22%,transparent)] text-[color:var(--warning)] border-[color-mix(in_oklab,var(--warning)_45%,transparent)]";
  return "bg-[color-mix(in_oklab,var(--destructive)_22%,transparent)] text-[color:var(--destructive)] border-[color-mix(in_oklab,var(--destructive)_45%,transparent)]";
}

/** Read-only suggestion card. Clicking does NOT re-run the backend or change the Selected Repository. */
export function SuggestedRepoCard({ repo, rank }: { repo: Repository; rank: number }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_20px_40px_-30px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Rank #{rank}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Suggested Repository
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{repo.owner}</div>
          <h3 className="truncate text-lg font-bold tracking-tight">{repo.name}</h3>
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 truncate font-mono text-[11px] text-muted-foreground hover:text-primary"
          >
            <Github className="h-3 w-3" />
            {repo.url.replace("https://", "")}
          </a>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-3xl font-extrabold leading-none tabular-nums text-primary">
            {repo.score}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Overall
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{repo.reason}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
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

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-[color:var(--warning)]" />
          {repo.stars.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {repo.language}
        </span>
      </div>
    </div>
  );
}

/** The single Selected Repository — visually emphasized, no selection interaction. */
export function SelectedRepoCard({ repo, mode }: { repo: Repository; mode: "user" | "auto" }) {
  const badge =
    mode === "user"
      ? { label: "Currently Being Analyzed", tone: "primary" as const }
      : { label: "Best Match • Auto Selected", tone: "success" as const };

  const badgeColor =
    badge.tone === "success" ? "var(--success)" : "var(--primary)";

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/60 bg-card shadow-[0_0_0_1px_var(--primary),0_25px_45px_-25px_rgba(139,92,246,0.35)]">
      <div className="flex items-center gap-2 border-b border-border bg-[color:var(--sidebar)] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#FF6B6B]" />
        <span className="h-3 w-3 rounded-full bg-[#F5B14C]" />
        <span className="h-3 w-3 rounded-full bg-[#57C785]" />
        <div className="ml-2 flex-1 truncate text-center font-mono text-[11px] text-muted-foreground">
          {repo.owner}/{repo.name}
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: `color-mix(in oklab, ${badgeColor} 22%, transparent)`,
            color: badgeColor,
            border: `1px solid color-mix(in oklab, ${badgeColor} 55%, transparent)`,
          }}
        >
          {badge.label}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{repo.owner}</div>
            <h3 className="truncate text-2xl font-extrabold tracking-tight">{repo.name}</h3>
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 truncate font-mono text-xs text-muted-foreground hover:text-primary"
            >
              <Github className="h-3.5 w-3.5" />
              {repo.url.replace("https://", "")}
            </a>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-5xl font-extrabold leading-none tabular-nums text-primary">
              {repo.score}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Match Score
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{repo.reason}</p>

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

        <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
          This repository is currently being analyzed by GitGenie. All{" "}
          <span className="font-semibold text-foreground">Repository Details</span>,{" "}
          <span className="font-semibold text-foreground">Issue Recommendations</span>,{" "}
          <span className="font-semibold text-foreground">Contribution Roadmap</span> and{" "}
          <span className="font-semibold text-foreground">Contribution Checklist</span> shown below
          are generated specifically for this repository.
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAnalysis, useActiveRepo } from "@/lib/analysis-store";
import { InputPanel } from "@/components/dashboard/InputPanel";
import { LoadingPipeline } from "@/components/dashboard/LoadingPipeline";
import { ManualProfileForm } from "@/components/dashboard/ManualProfileForm";
import { SelectedRepoCard, SuggestedRepoCard } from "@/components/dashboard/SelectedRepoCard";
import { IssueCard } from "@/components/dashboard/IssueCard";
import { RoadmapTimeline } from "@/components/dashboard/RoadmapTimeline";
import { ChecklistItem } from "@/components/dashboard/ChecklistItem";
import { MarkdownRenderer } from "@/components/dashboard/MarkdownRenderer";
import { ProfileCard, ConfidenceBar, ColorPill } from "@/components/dashboard/ProfileCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Sparkles,
  Star,
  Bug,
  Map as MapIcon,
  CheckSquare,
  FolderOpen,
  Code2,
  Boxes,
  Briefcase,
  Heart,
  Target,
  Github,
  Gauge,
  FolderGit2,
  Users,
} from "lucide-react";
import genieMascot from "@/assets/genie-mascot.png";
import { SettingsView } from "@/components/dashboard/SettingsView";


function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-6 animate-[slide-up_0.35s_ease-out]">
      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{eyebrow}</div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

function GenieEmptyState() {
  const { setView } = useAnalysis();
  return (
    <div className="flex flex-col items-center py-10 text-center animate-[fade-in_0.5s_ease-out]">
      <img
        src={genieMascot}
        alt="GitGenie mascot"
        width={420}
        height={420}
        className="h-64 w-64 animate-[bob_3s_ease-in-out_infinite] drop-shadow-[0_25px_35px_rgba(139,92,246,0.35)]"
      />
      <h2 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">
        Let's discover your perfect open-source project!
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Run one analysis and the Genie will unlock every tab in the sidebar — no re-runs needed.
      </p>
      <Button
        size="lg"
        className="mt-6 h-12 gap-2 rounded-full px-7 text-base font-semibold transition-transform hover:scale-105"
        onClick={() => setView("overview")}
      >
        <Sparkles className="h-5 w-5" />
        Start Analysis
      </Button>
    </div>
  );
}

export function DashboardView() {
  const { status, view } = useAnalysis();

  if (status === "loading") return <LoadingPipeline />;

  return (
    <div key={view} className="animate-[fade-in_0.25s_ease-out]">
      <DashboardViewInner />
    </div>
  );
}

function DashboardViewInner() {
  const { result, status, view, setView, reset, checkedItems, toggleChecklistItem } = useAnalysis();
  const repo = useActiveRepo();

  if (view === "overview") {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Welcome"
          title="Hey there, wish granter ✨"
          description="Kick off an analysis. Every sidebar tab will visualize the result — one backend call, seven friendly views."
        />
        <InputPanel />

        {status === "needs-profile" && <ManualProfileForm />}

        {result ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard icon={Star} label="Repositories" value={result.repositories.length} tone="primary" />
              <StatCard icon={Bug} label="Issues surfaced" value={Object.values(result.issues).flat().length} tone="warning" />
              <StatCard icon={MapIcon} label="Roadmap steps" value={Object.values(result.roadmap).flat().length} tone="success" />
              <StatCard icon={CheckSquare} label="Checklist rules" value={result.checklist.length} tone="accent" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setView("repositories")} className="gap-1 rounded-full">
                See recommendations <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={reset} className="rounded-full">
                Reset
              </Button>
            </div>
          </>
        ) : status !== "needs-profile" ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
            💡 Tip — try username{" "}
            <code className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-xs">torvalds</code> for
            the full experience, or{" "}
            <code className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-xs">newbie</code> to
            preview the manual-profile flow.
          </div>
        ) : null}
      </div>
    );
  }

  if (view === "settings") return <SettingsView />;

  if (!result) return <GenieEmptyState />;

  if (view === "repositories") {
    const selected = repo;
    const suggestions = [...result.repositories]
      .filter((r) => r.id !== result.selectedRepoId)
      .sort((a, b) => b.score - a.score);

    return (
      <div className="space-y-10">
        <div>
          <SectionHeader
            eyebrow="Selected repository"
            title="Currently being analyzed"
            description={
              result.selectionMode === "user"
                ? "You chose this repository. GitGenie is analyzing it end-to-end for you."
                : "You didn't specify one, so GitGenie picked the top-ranked match as your active repository."
            }
          />
          {selected ? (
            <SelectedRepoCard repo={selected} mode={result.selectionMode} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-sm text-muted-foreground">
              No selected repository yet.
            </div>
          )}
        </div>

        <div>
          <SectionHeader
            eyebrow="More recommendations"
            title="More repositories you may like"
            description="Read-only suggestions ranked by fit. These do not affect the repository currently being analyzed."
          />
          {suggestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-sm text-muted-foreground">
              No additional suggestions returned by the backend.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {suggestions.map((r, i) => (
                <SuggestedRepoCard key={r.id} repo={r} rank={i + 2} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }


  if (view === "details") return <DetailsView />;

  if (view === "issues") {
    const issues = repo ? result.issues[repo.id] ?? [] : [];
    return (
      <div>
        <CurrentlyAnalyzingBanner />
        <SectionHeader
          eyebrow="Good first issues"
          title="Issue Recommendations"
          description={repo ? `Issues surfaced for ${repo.owner}/${repo.name}` : undefined}
        />
        {issues.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-sm text-muted-foreground">
            No cached issues for this repository yet.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {issues.map((i, idx) => (
              <IssueCard key={i.id} issue={i} index={idx} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "roadmap") {
    const sections = repo ? result.roadmap[repo.id] ?? [] : [];
    return (
      <div>
        <CurrentlyAnalyzingBanner />
        <SectionHeader
          eyebrow="Your journey"
          title="Contribution Roadmap"
          description={repo ? `Your path to a merged PR on ${repo.name}` : undefined}
        />
        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-sm text-muted-foreground">
            No roadmap generated for this repository yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6">
            <RoadmapTimeline sections={sections} />
          </div>
        )}
      </div>
    );
  }

  if (view === "checklist") {
    const done = result.checklist.filter((c) => checkedItems[c.id]).length;
    const pending = result.checklist.length - done;
    return (
      <div>
        <CurrentlyAnalyzingBanner />
        <SectionHeader
          eyebrow="Audit"
          title="Contribution Checklist"
          description="Steps extracted from the repository's contribution guide — tick them off as you go."
        />
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <SummaryTile label="Done" value={done} tone="success" />
          <SummaryTile label="Pending" value={pending} tone="warning" />
        </div>
        <div className="grid gap-3">
          {result.checklist.map((r) => (
            <ChecklistItem
              key={r.id}
              rule={r}
              checked={!!checkedItems[r.id]}
              onToggle={() => toggleChecklistItem(r.id)}
            />
          ))}
        </div>
      </div>
    );
  }



  if (view === "profile") return <ProfileView />;

  if (view === "settings") return <SettingsView />;


  return null;
}

function DetailsView() {
  const { result } = useAnalysis();
  const repo = useActiveRepo();
  const [tab, setTab] = useState<"README.md" | "Architecture.md" | "Workflow.md">("README.md");

  const md = (repo && result?.details[repo.id]) ?? "## No details yet\n\nSelect a repository first.";
  const sections = splitMarkdown(md);
  const body =
    tab === "README.md" ? sections.readme : tab === "Architecture.md" ? sections.architecture : sections.workflow;

  const tabs: Array<typeof tab> = ["README.md", "Architecture.md", "Workflow.md"];

  return (
    <div>
      <CurrentlyAnalyzingBanner />
      <SectionHeader
        eyebrow="Deep dive"
        title={repo ? `${repo.owner}/${repo.name}` : "Repository Details"}
        description={repo?.reason}
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_40px_-30px_rgba(0,0,0,0.5)]">
        {/* editor titlebar */}
        <div className="flex items-center gap-2 border-b border-border bg-[color:var(--sidebar)] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#FF6B6B]" />
          <span className="h-3 w-3 rounded-full bg-[#F5B14C]" />
          <span className="h-3 w-3 rounded-full bg-[#57C785]" />
          <span className="ml-3 font-mono text-[11px] text-muted-foreground">
            {repo ? `${repo.owner}/${repo.name}` : "repository"}
          </span>
        </div>
        {/* tabs */}
        <div className="flex items-center border-b border-border bg-background/40 px-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative px-4 py-2.5 font-mono text-xs transition-colors",
                tab === t
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
              {tab === t && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
        <div className="max-h-[68vh] overflow-y-auto p-6">
          <MarkdownRenderer>{body}</MarkdownRenderer>
        </div>
      </div>
    </div>
  );
}

function splitMarkdown(md: string) {
  // Naively split by common headings so tabs each show a useful slice.
  const arch = md.match(/##\s*Architecture[\s\S]*?(?=\n##\s|$)/i)?.[0] ?? "";
  const workflow = md.match(/##\s*(Project\s*Workflow|Workflow|Contribution Workflow)[\s\S]*?(?=\n##\s|$)/i)?.[0] ?? "";
  return {
    readme: md,
    architecture: arch || "## Architecture\n\nNo dedicated architecture section — see README.",
    workflow: workflow || "## Workflow\n\nNo dedicated workflow section — see README.",
  };
}

function ProfileView() {
  const { result } = useAnalysis();
  const p = result!.profile;
  const stats = p.stats;
  const conf = p.confidenceScore ?? 0;

  return (
    <div>
      <SectionHeader
        eyebrow="Skill profile"
        title="Developer Profile"
        description="Generated from public GitHub activity, README signals, and language distribution."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <ProfileCard title="Programming Languages" eyebrow="Fluency" icon={<Code2 className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-2">
            {p.languages.map((l, i) => (
              <ColorPill key={l.name} label={l.name} value={l.confidence} index={i} />
            ))}
          </div>
        </ProfileCard>

        <ProfileCard title="Strengths" eyebrow="Toolkit" icon={<Boxes className="h-4 w-4" />}>
          <div className="space-y-3">
            {p.frameworks.map((l, i) => (
              <ConfidenceBar key={l.name} label={l.name} value={l.confidence} index={i} />
            ))}
          </div>
        </ProfileCard>

        <ProfileCard title="Experience" eyebrow="Level" icon={<Briefcase className="h-4 w-4" />}>
          <p className="text-sm text-muted-foreground">{p.experience}</p>
        </ProfileCard>

        <ProfileCard title="Interests" eyebrow="Enjoys" icon={<Heart className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-2">
            {p.interests.map((i, idx) => (
              <ColorPill key={i} label={i} index={idx + 1} />
            ))}
          </div>
        </ProfileCard>

        <ProfileCard title="Goals" eyebrow="Aspirations" icon={<Target className="h-4 w-4" />} className="md:col-span-2">
          <ul className="grid gap-2 sm:grid-cols-2">
            {p.goals.map((g) => (
              <li
                key={g}
                className="flex items-start gap-2 rounded-xl border border-border bg-background/40 p-3 text-sm text-muted-foreground"
              >
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {g}
              </li>
            ))}
          </ul>
        </ProfileCard>

        {stats && (
          <ProfileCard
            title="GitHub Statistics"
            eyebrow="Activity"
            icon={<Github className="h-4 w-4" />}
            className="xl:col-span-2"
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <MiniStat icon={FolderGit2} label="Repos" value={stats.repos} color="var(--primary)" />
              <MiniStat icon={Star} label="Stars" value={stats.stars} color="var(--warning)" />
              <MiniStat icon={Users} label="Followers" value={stats.followers} color="var(--accent)" />
            </div>
          </ProfileCard>
        )}

        <ProfileCard title="Confidence Score" eyebrow="Overall" icon={<Gauge className="h-4 w-4" />}>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-extrabold tabular-nums text-primary">{conf}</span>
            <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-background/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${conf}%` }}
            />
          </div>
        </ProfileCard>

        <ProfileCard title="Notable Projects" eyebrow="Highlights" icon={<Star className="h-4 w-4" />} className="md:col-span-2 xl:col-span-3">
          <ul className="grid gap-3 md:grid-cols-3">
            {p.projects.map((pr) => (
              <li key={pr.name} className="rounded-xl border border-border bg-background/40 p-4">
                <div className="text-sm font-bold">{pr.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{pr.description}</p>
              </li>
            ))}
          </ul>
        </ProfileCard>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-extrabold tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone?: "primary" | "success" | "warning" | "accent";
}) {
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "warning"
        ? "var(--warning)"
        : tone === "accent"
          ? "var(--accent)"
          : "var(--primary)";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground">{label}</div>
        <div
          className="grid h-8 w-8 place-items-center rounded-xl"
          style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "error";
}) {
  const color =
    tone === "success" ? "var(--success)" : tone === "warning" ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tabular-nums" style={{ color }}>
          {value}
        </span>
        <span className="text-xs text-muted-foreground">rules</span>
      </div>
    </div>
  );
}

function CurrentlyAnalyzingBanner() {
  const repo = useActiveRepo();
  const { result } = useAnalysis();
  if (!repo || !result) return null;
  const modeLabel =
    result.selectionMode === "user" ? "Currently Being Analyzed" : "Best Match • Auto Selected";
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
        <FolderOpen className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
          Currently Analyzing
        </div>
        <div className="truncate font-mono text-sm font-semibold">
          {repo.owner}/{repo.name}
        </div>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
        {modeLabel}
      </span>
    </div>
  );
}

import { useAnalysis, type DashboardView } from "@/lib/analysis-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Dna,
  Compass,
  BookOpen,
  Hammer,
  Map,
  ClipboardCheck,
  Settings,
  Sparkles,
} from "lucide-react";
import genieMascot from "@/assets/genie-mascot.png";

const items: {
  id: DashboardView;
  label: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Dashboard", emoji: "✨", icon: LayoutDashboard },
  { id: "profile", label: "Skill DNA", emoji: "🧬", icon: Dna },
  { id: "repositories", label: "Repo Compass", emoji: "🧭", icon: Compass },
  { id: "details", label: "Code Atlas", emoji: "📖", icon: BookOpen },
  { id: "issues", label: "Issue Forge", emoji: "🧩", icon: Hammer },
  { id: "roadmap", label: "Quest Map", emoji: "🗺️", icon: Map },
  { id: "checklist", label: "Launch Checklist", emoji: "✅", icon: ClipboardCheck },
  { id: "settings", label: "Settings", emoji: "⚙️", icon: Settings },
];

export function Sidebar() {
  const { view, setView, result } = useAnalysis();
  const locked = !result;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight">GitGenie</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            OSS Companion
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = view === it.id;
            const disabled = locked && it.id !== "overview" && it.id !== "settings";
            return (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => !disabled && setView(it.id)}
                  disabled={disabled}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/20 text-foreground"
                      : "text-muted-foreground hover:translate-x-0.5 hover:bg-white/[0.04] hover:text-foreground",
                    disabled && "cursor-not-allowed opacity-40 hover:translate-x-0 hover:bg-transparent hover:text-muted-foreground",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-base transition-colors",
                      active
                        ? "bg-primary/25"
                        : "bg-white/[0.03] group-hover:bg-white/[0.06]",
                    )}
                    aria-hidden
                  >
                    {it.emoji}
                  </span>
                  <span className="truncate">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2.5 text-xs text-muted-foreground">
          <img
            src={genieMascot}
            alt="GitGenie mascot"
            width={64}
            height={64}
            className="h-10 w-10 shrink-0 animate-[bob_3s_ease-in-out_infinite]"
            loading="lazy"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-foreground font-medium">GitGenie</span>
            <span>v0.1 · Preview</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

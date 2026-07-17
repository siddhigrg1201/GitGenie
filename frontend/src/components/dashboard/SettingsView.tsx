import { useState } from "react";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/lib/analysis-store";
import { cn } from "@/lib/utils";
import {
  Bell,
  Github,
  Info,
  LogOut,
  Moon,
  Palette,
  Sparkles,
  Sun,
  User as UserIcon,
} from "lucide-react";
import genieMascot from "@/assets/genie-mascot.png";

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-6 animate-[slide-up_0.35s_ease-out]">
      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{eyebrow}</div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function SettingsView() {
  const { username, reset } = useAnalysis();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [displayName, setDisplayName] = useState(username || "Genie Friend");
  const [github, setGithub] = useState(username || "");

  return (
    <div>
      <SectionHeader
        eyebrow="Preferences"
        title="Settings"
        description="Make GitGenie feel like yours."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <ProfileCard title="Profile" eyebrow="You" icon={<UserIcon className="h-4 w-4" />}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={genieMascot}
                alt="Profile mascot"
                width={96}
                height={96}
                className="h-20 w-20 rounded-2xl bg-background/40 object-contain p-1"
                loading="lazy"
              />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
              >
                Change
              </button>
            </div>
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground">Username</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <label className="block text-xs font-semibold text-muted-foreground">GitHub username</label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2">
                <Github className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="octocat"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          </div>
        </ProfileCard>

        <ProfileCard title="Appearance" eyebrow="Theme" icon={<Palette className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "dark", label: "Dark", Icon: Moon },
                { id: "light", label: "Light", Icon: Sun },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-all",
                  theme === id
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Pick a vibe — your choice is saved and follows you across sessions.
          </p>
        </ProfileCard>

        <ProfileCard title="Notifications" eyebrow="Alerts" icon={<Bell className="h-4 w-4" />}>
          <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-4 py-3">
            <div>
              <div className="text-sm font-medium">New issues & roadmap updates</div>
              <div className="text-xs text-muted-foreground">Get a gentle nudge when the Genie has news.</div>
            </div>
            <button
              type="button"
              onClick={() => setNotifications((n) => !n)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                notifications ? "bg-primary" : "bg-border",
              )}
              aria-pressed={notifications}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  notifications ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        </ProfileCard>

        <ProfileCard title="About GitGenie" eyebrow="Info" icon={<Info className="h-4 w-4" />}>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Version</span>
              <span className="font-mono text-xs text-foreground">v0.1.0 · Preview</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Made with</span>
              <span className="text-foreground">✨ for open source contributors</span>
            </div>
            <p className="pt-2 text-xs">
              GitGenie helps you discover repositories, understand codebases, and plan your first
              contribution — one wish at a time.
            </p>
          </div>
        </ProfileCard>

        <ProfileCard
          title="Session"
          eyebrow="Account"
          icon={<Sparkles className="h-4 w-4" />}
          className="md:col-span-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Reset your current session to start a fresh analysis.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full" onClick={reset}>
                Reset session
              </Button>
              <Button
                variant="outline"
                className="gap-1.5 rounded-full text-[color:var(--destructive)] hover:text-[color:var(--destructive)]"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </ProfileCard>
      </div>
    </div>
  );
}

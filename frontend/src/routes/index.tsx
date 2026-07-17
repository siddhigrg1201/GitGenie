import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Github, Folder, Star, Code2 } from "lucide-react";
import genieMascot from "@/assets/genie-mascot.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GitGenie — Your AI Open Source Contribution Companion" },
      {
        name: "description",
        content:
          "Discover the perfect open-source repository for your skills. GitGenie is your AI-powered open source contribution assistant.",
      },
      { property: "og:title", content: "GitGenie — AI Open Source Companion" },
      {
        property: "og:description",
        content:
          "Discover the perfect open-source repository for your skills.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

type FloatIcon = {
  Icon: React.ComponentType<{ className?: string }>;
  top: string;
  left: string;
  size: string;
  delay: string;
  duration: string;
  tint: string;
};

const FLOATERS: FloatIcon[] = [
  { Icon: Github, top: "12%", left: "8%", size: "h-6 w-6", delay: "0s", duration: "7s", tint: "text-primary/60" },
  { Icon: Folder, top: "22%", left: "88%", size: "h-7 w-7", delay: "1s", duration: "8s", tint: "text-accent/60" },
  { Icon: Star, top: "68%", left: "6%", size: "h-5 w-5", delay: "2s", duration: "6s", tint: "text-[color:var(--warning)]/70" },
  { Icon: Code2, top: "78%", left: "82%", size: "h-6 w-6", delay: "0.5s", duration: "9s", tint: "text-accent/60" },
  { Icon: Github, top: "44%", left: "92%", size: "h-5 w-5", delay: "3s", duration: "7.5s", tint: "text-primary/40" },
  { Icon: Folder, top: "58%", left: "3%", size: "h-5 w-5", delay: "1.5s", duration: "8.5s", tint: "text-primary/50" },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-[280px] w-[280px] rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-40 h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl" />

      {/* Floating background icons */}
      {FLOATERS.map(({ Icon, top, left, size, delay, duration, tint }, i) => (
        <div
          key={i}
          className="pointer-events-none absolute"
          style={{
            top,
            left,
            animation: `float ${duration} ease-in-out ${delay} infinite`,
          }}
          aria-hidden
        >
          <Icon className={`${size} ${tint}`} />
        </div>
      ))}
      {/* Floating code brackets */}
      <span className="pointer-events-none absolute left-[14%] top-[35%] font-mono text-2xl text-primary/40 animate-[float_9s_ease-in-out_infinite]" aria-hidden>{"</>"}</span>
      <span className="pointer-events-none absolute right-[16%] top-[62%] font-mono text-xl text-accent/40 animate-[float_7s_ease-in-out_1.5s_infinite]" aria-hidden>{"{ }"}</span>

      <header className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/20 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight">GitGenie</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="rounded-full">
            <Link to="/dashboard">Open App</Link>
          </Button>
        </div>

      </header>

      <main className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-6 text-center md:pt-10">
        <div className="relative animate-[float_5s_ease-in-out_infinite]">
          <img
            src={genieMascot}
            alt="GitGenie mascot: a friendly cartoon genie in a purple hoodie holding a GitHub scroll"
            width={520}
            height={520}
            className="mx-auto h-72 w-72 md:h-[380px] md:w-[380px] drop-shadow-[0_30px_40px_rgba(139,92,246,0.35)]"
          />
          <span className="absolute left-6 top-10 h-2 w-2 rounded-full bg-[color:var(--warning)] animate-[sparkle_2.6s_ease-in-out_infinite]" />
          <span className="absolute right-6 top-24 h-1.5 w-1.5 rounded-full bg-accent animate-[sparkle_3s_ease-in-out_infinite]" />
          <span className="absolute left-16 bottom-16 h-2 w-2 rounded-full bg-[color:var(--success)] animate-[sparkle_2.2s_ease-in-out_infinite]" />
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
          Your open-source wish, granted.
        </div>

        <h1 className="mt-5 text-6xl font-extrabold tracking-tight md:text-7xl">
          Git
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Genie
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-lg font-medium text-foreground/90 md:text-xl">
          Discover the perfect open-source repository for your skills.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="group h-14 rounded-full px-8 text-base font-semibold shadow-[0_10px_30px_-10px_rgba(139,92,246,0.6)] transition-transform hover:scale-[1.03]"
          >
            <Link to="/dashboard">
              <Sparkles className="mr-1 h-5 w-5 transition-transform group-hover:rotate-12" />
              Get Started
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 rounded-full px-8 text-base font-semibold"
          >
            <a href="#features">Learn More</a>
          </Button>
        </div>

        <div id="features" className="mt-16 grid w-full gap-4 sm:grid-cols-3">
          {[
            { emoji: "🧭", title: "Repo Compass", desc: "Discover repositories that match your skills." },
            { emoji: "🧩", title: "Issue Forge", desc: "Find beginner-friendly issues to tackle first." },
            { emoji: "🗺️", title: "Quest Map", desc: "A step-by-step roadmap to your first merged PR." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card/60 p-5 text-left backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="text-2xl">{f.emoji}</div>
              <div className="mt-2 font-bold">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative border-t border-border/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} GitGenie</span>
          <span>Made with ✨ for open source contributors</span>
        </div>
      </footer>
    </div>
  );
}

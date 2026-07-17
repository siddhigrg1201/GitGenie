import { useActiveRepo, useAnalysis } from "@/lib/analysis-store";
import { Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const repo = useActiveRepo();
  const { username } = useAnalysis();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/85 px-5 backdrop-blur md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary md:hidden">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-bold tracking-tight">
            {repo ? `${repo.owner}/${repo.name}` : "Welcome back ✨"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {repo
              ? `Active repository`
              : username
                ? `Analyzing @${username}`
                : "Start an analysis to unlock everything"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {repo && (
          <Button asChild size="sm" variant="outline" className="gap-1.5 rounded-full">
            <a href={repo.url} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Open on GitHub</span>
            </a>
          </Button>
        )}
      </div>
    </header>
  );
}

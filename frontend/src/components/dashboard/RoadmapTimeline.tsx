import type { RoadmapSection } from "@/lib/mock-data";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Flag, Sparkles, Trophy, Rocket, Target, Compass, BookOpen, Wrench, Star } from "lucide-react";

const ICONS = [Flag, Compass, BookOpen, Wrench, Target, Sparkles, Rocket, Star, Trophy];

export function RoadmapTimeline({ sections }: { sections: RoadmapSection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((s, i) => {
        const Icon = ICONS[i % ICONS.length];
        const isLast = i === sections.length - 1;
        return (
          <div key={s.title} className="relative">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_10px_20px_-8px_rgba(79,140,255,0.55)]">
                  <Icon className="h-5 w-5" />
                </div>
                {!isLast && (
                  <div
                    className="mt-2 w-0.5 flex-1 border-l-2 border-dashed border-border"
                    style={{ minHeight: 40 }}
                  />
                )}
              </div>
              <div className="flex-1 rounded-2xl border border-border bg-background/40 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Step {i + 1}
                  </span>
                  <h3 className="text-base font-bold tracking-tight">{s.title}</h3>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <MarkdownRenderer>{s.body}</MarkdownRenderer>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

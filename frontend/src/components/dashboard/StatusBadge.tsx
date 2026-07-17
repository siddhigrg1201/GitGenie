import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "success" | "warning" | "error" | "info" | "muted";

const tones: Record<Tone, string> = {
  success: "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[color:var(--success)] border-[color-mix(in_oklab,var(--success)_35%,transparent)]",
  warning: "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[color:var(--warning)] border-[color-mix(in_oklab,var(--warning)_35%,transparent)]",
  error: "bg-[color-mix(in_oklab,var(--destructive)_18%,transparent)] text-[color:var(--destructive)] border-[color-mix(in_oklab,var(--destructive)_35%,transparent)]",
  info: "bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] text-[color:var(--primary)] border-[color-mix(in_oklab,var(--primary)_35%,transparent)]",
  muted: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  tone = "muted",
  children,
  className,
  ...rest
}: { tone?: Tone; children: React.ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export function difficultyTone(d: string): Tone {
  const v = d.toLowerCase();
  if (v.includes("begin") || v === "easy") return "success";
  if (v.includes("inter") || v === "medium") return "warning";
  if (v.includes("adv") || v === "hard") return "error";
  return "muted";
}

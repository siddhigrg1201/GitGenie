import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ProfileCard({
  title,
  eyebrow,
  icon,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
            {icon}
          </div>
        )}
        <div>
          {eyebrow && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </div>
          )}
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const PILL_COLORS = [
  "bg-[color-mix(in_oklab,var(--primary)_25%,transparent)] text-[color:var(--primary)] border-[color-mix(in_oklab,var(--primary)_45%,transparent)]",
  "bg-[color-mix(in_oklab,var(--success)_22%,transparent)] text-[color:var(--success)] border-[color-mix(in_oklab,var(--success)_45%,transparent)]",
  "bg-[color-mix(in_oklab,var(--warning)_22%,transparent)] text-[color:var(--warning)] border-[color-mix(in_oklab,var(--warning)_45%,transparent)]",
  "bg-[color-mix(in_oklab,var(--accent)_25%,transparent)] text-[color:var(--accent)] border-[color-mix(in_oklab,var(--accent)_45%,transparent)]",
  "bg-[color-mix(in_oklab,var(--destructive)_22%,transparent)] text-[color:var(--destructive)] border-[color-mix(in_oklab,var(--destructive)_45%,transparent)]",
];

export function ColorPill({ label, value, index = 0 }: { label: string; value?: number; index?: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        PILL_COLORS[index % PILL_COLORS.length],
      )}
    >
      {label}
      {typeof value === "number" && <span className="tabular-nums opacity-80">({value}%)</span>}
    </span>
  );
}

export function ConfidenceBar({ label, value, index = 0 }: { label: string; value: number; index?: number }) {
  const colors = ["var(--primary)", "var(--success)", "var(--warning)", "var(--accent)", "var(--destructive)"];
  const color = colors[index % colors.length];
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-background/60">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

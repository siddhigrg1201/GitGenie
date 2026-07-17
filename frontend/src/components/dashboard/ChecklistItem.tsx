import type { ChecklistRule } from "@/lib/mock-data";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChecklistItem({
  rule,
  checked,
  onToggle,
}: {
  rule: ChecklistRule;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={cn(
        "flex w-full items-start gap-4 rounded-2xl border bg-card p-5 text-left transition-all hover:-translate-y-0.5",
        checked
          ? "border-[color-mix(in_oklab,var(--success)_35%,var(--border))]"
          : "border-border",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
          checked
            ? "border-[color:var(--success)] bg-[color:var(--success)] text-black"
            : "border-muted-foreground/40 text-transparent",
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4
            className={cn(
              "text-base font-semibold tracking-tight transition-colors",
              checked && "text-muted-foreground line-through",
            )}
          >
            {rule.rule}
          </h4>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              checked
                ? "border-[color-mix(in_oklab,var(--success)_45%,transparent)] bg-[color-mix(in_oklab,var(--success)_22%,transparent)] text-[color:var(--success)]"
                : "border-[color-mix(in_oklab,var(--warning)_45%,transparent)] bg-[color-mix(in_oklab,var(--warning)_22%,transparent)] text-[color:var(--warning)]",
            )}
          >
            {checked ? "✓ Done" : "Pending"}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{rule.reason}</p>
      </div>
    </button>
  );
}

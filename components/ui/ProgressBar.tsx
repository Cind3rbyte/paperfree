import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** Wert zwischen 0 und 1. */
  value: number;
  label?: string;
  showPercent?: boolean;
  tone?: "indigo" | "emerald";
  className?: string;
}

export function ProgressBar({ value, label, showPercent = true, tone = "indigo", className }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="truncate" aria-live="polite">
            {label}
          </span>
          {showPercent && <span className="tabular-nums">{percent}%</span>}
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label ?? "Fortschritt"}
      >
        <div
          className={cn(
            "progress-stripes h-full rounded-full transition-[width] duration-300 ease-out",
            tone === "indigo" ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-gradient-to-r from-emerald-500 to-teal-500",
          )}
          style={{ width: `${Math.max(percent, 3)}%` }}
        />
      </div>
    </div>
  );
}

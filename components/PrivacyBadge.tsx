import { cn } from "@/lib/utils";

interface PrivacyBadgeProps {
  size?: "sm" | "lg";
  className?: string;
}

/** Das zentrale Versprechen von PaperFree – bewusst auffällig gestaltet. */
export function PrivacyBadge({ size = "sm", className }: PrivacyBadgeProps) {
  return (
    <div
      className={cn(
        "relative inline-flex max-w-full items-center gap-2.5 rounded-full border border-emerald-500/40 bg-emerald-50 font-semibold text-emerald-800 shadow-sm shadow-emerald-500/10 ring-4 ring-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
        size === "lg" ? "px-5 py-2.5 text-sm sm:text-base" : "px-3.5 py-1.5 text-xs sm:text-sm",
        className,
      )}
    >
      <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="min-w-0">
        <span aria-hidden="true">🔒 </span>
        <strong className="font-extrabold">100% Lokal:</strong> Deine Dateien verlassen niemals deinen Browser.
      </span>
    </div>
  );
}

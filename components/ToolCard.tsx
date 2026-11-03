import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { ToolDefinition } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function ToolCard({ tool, locale, compact = false }: { tool: ToolDefinition; locale: Locale; compact?: boolean }) {
  const t = getDictionary(locale);
  const text = t.tools[tool.id];
  const Icon = tool.icon;
  return (
    <Link
      href={localizePath(locale, tool.href)}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700",
        tool.glow,
        compact ? "p-5" : "p-6 sm:p-7",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition duration-500 group-hover:opacity-25",
          tool.gradient,
        )}
      />
      <span
        className={cn(
          "relative flex items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition duration-300 group-hover:scale-110 group-hover:rotate-3",
          tool.gradient,
          compact ? "size-11" : "size-14",
        )}
      >
        <Icon className={compact ? "size-5" : "size-7"} aria-hidden="true" />
      </span>
      <h3 className={cn("relative mt-5 font-bold text-slate-900 dark:text-white", compact ? "text-base" : "text-xl")}>{text.title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {compact ? text.tagline : text.description}
      </p>
      {!compact && (
        <ul className="relative mt-5 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
          {text.highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-emerald-500" aria-hidden="true" />
              {highlight}
            </li>
          ))}
        </ul>
      )}
      <span className="relative mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
        {t.toolCard.open}
        <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}

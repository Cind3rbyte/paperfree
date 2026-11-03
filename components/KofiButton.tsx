import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface KofiButtonProps {
  locale: Locale;
  size?: "sm" | "md" | "lg";
  label?: string;
  compactOnMobile?: boolean;
  href?: string;
  className?: string;
}

/** Donation button for Ko-fi or Buy Me a Coffee. */
export function KofiButton({ locale, size = "md", label, compactOnMobile = false, href = siteConfig.kofiUrl, className }: KofiButtonProps) {
  const t = getDictionary(locale).kofi;
  const text = label ?? t.label;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} ${t.ariaSuffix}`}
      className={cn(
        "group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 font-bold text-slate-900 shadow-md shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500",
        size === "sm" && "h-9 px-3.5 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        className,
      )}
    >
      <span aria-hidden="true" className="text-base transition group-hover:rotate-12">
        ☕
      </span>
      <span className={cn(compactOnMobile && "hidden sm:inline")}>{text}</span>
      {compactOnMobile && <span className="sm:hidden">{t.short}</span>}
    </a>
  );
}

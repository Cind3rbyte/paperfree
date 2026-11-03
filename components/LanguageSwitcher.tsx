"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { switchLocaleInPath, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/** Switches between English and German while staying on the same page. */
export function LanguageSwitcher({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const { locale, t } = useI18n();
  const pathname = usePathname() ?? `/${locale}`;
  const target: Locale = locale === "en" ? "de" : "en";

  return (
    <Link
      href={switchLocaleInPath(pathname, target)}
      hrefLang={target}
      lang={target}
      aria-label={t.language.switchAria}
      title={t.language.switchAria}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white",
        variant === "compact" ? "h-10 px-2.5 text-sm" : "h-10 border border-slate-200 px-4 text-sm dark:border-slate-700",
      )}
    >
      <Languages className="size-4" aria-hidden="true" />
      {variant === "compact" ? t.language.switchShort : t.language.switchLabel}
    </Link>
  );
}

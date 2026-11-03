"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { GithubIcon } from "@/components/GithubIcon";
import { KofiButton } from "@/components/KofiButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { localizePath } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function Header() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Logo locale={locale} />

        <nav aria-label={t.header.navLabel} className="ml-6 hidden items-center gap-0.5 xl:flex">
          {tools.map((tool) => {
            const href = localizePath(locale, tool.href);
            const active = pathname === href;
            return (
              <Link
                key={tool.id}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition",
                  active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                )}
              >
                {t.tools[tool.id].navLabel}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 sm:inline-flex dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={t.header.githubAria}
          >
            <GithubIcon className="size-5" />
            <span className="hidden 2xl:inline">{t.header.github}</span>
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
          <KofiButton locale={locale} size="sm" compactOnMobile />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 xl:hidden dark:text-slate-200 dark:hover:bg-slate-800"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? t.header.closeMenu : t.header.openMenu}
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label={t.header.mobileNavLabel}
          className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 shadow-lg xl:hidden dark:border-slate-800 dark:bg-slate-950"
        >
          <ul className="grid gap-1 sm:grid-cols-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const href = localizePath(locale, tool.href);
              const active = pathname === href;
              return (
                <li key={tool.id}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                      active
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                    )}
                  >
                    <span className={cn("flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-white", tool.gradient)}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    {t.tools[tool.id].title}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <GithubIcon className="size-4" /> {t.header.sourceOnGithub}
            </a>
            <LanguageSwitcher variant="full" />
            <KofiButton locale={locale} size="md" />
          </div>
        </nav>
      )}
    </header>
  );
}

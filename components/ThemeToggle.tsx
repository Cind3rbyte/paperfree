"use client";

import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export const THEME_STORAGE_KEY = "paperfree-theme";

/** Switches between light and dark mode. The icon is toggled purely via CSS (no hydration flicker). */
export function ThemeToggle() {
  const { t } = useI18n();

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Without storage access (e.g. private mode) the choice only lasts for this session.
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex size-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      aria-label={t.header.themeToggle}
      title={t.header.themeToggleTitle}
    >
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
    </button>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";

export const THEME_STORAGE_KEY = "paperfree-theme";

/** Wechselt zwischen hellem und dunklem Design. Das Icon wird rein per CSS umgeschaltet (kein Hydration-Flackern). */
export function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ohne Speicherzugriff (z. B. privater Modus) gilt die Auswahl nur für diese Sitzung.
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex size-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      aria-label="Zwischen hellem und dunklem Design wechseln"
      title="Hell/Dunkel umschalten"
    >
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
    </button>
  );
}

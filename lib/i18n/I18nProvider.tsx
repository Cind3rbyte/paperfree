"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";
import { setPdfLocale } from "@/lib/pdf-utils";

const LocaleContext = createContext<Locale>(defaultLocale);

/** Makes the active locale available to client components and the PDF engine. */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  setPdfLocale(locale);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useI18n(): { locale: Locale; t: Dictionary } {
  const locale = useContext(LocaleContext);
  return { locale, t: dictionaries[locale] };
}

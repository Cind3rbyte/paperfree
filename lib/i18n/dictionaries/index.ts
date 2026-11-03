import type { Locale } from "@/lib/i18n/config";
import { de } from "@/lib/i18n/dictionaries/de";
import { en, type Dictionary } from "@/lib/i18n/dictionaries/en";

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { en, de };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

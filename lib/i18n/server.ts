import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, localizePath, openGraphLocales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getTool, type ToolId } from "@/lib/tools";

export interface LocaleParams {
  params: Promise<{ locale: string }>;
}

/** Validates the [locale] route segment and renders a 404 for unknown languages. */
export async function resolveLocale(params: LocaleParams["params"]): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

/** hreflang alternates for a path that exists in every language. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, localizePath(locale, path)])),
    "x-default": localizePath("en", path),
  };
}

export function buildToolMetadata(locale: Locale, toolId: ToolId): Metadata {
  const tool = getTool(toolId);
  const text = getDictionary(locale).tools[toolId];
  const image = { url: `${localizePath(locale)}/opengraph-image`, width: 1200, height: 630, alt: "PaperFree" };
  return {
    title: text.title,
    description: text.metaDescription,
    alternates: {
      canonical: localizePath(locale, tool.href),
      languages: languageAlternates(tool.href),
    },
    openGraph: {
      title: `${text.title} – PaperFree`,
      description: text.metaDescription,
      url: localizePath(locale, tool.href),
      locale: openGraphLocales[locale],
      images: [image],
    },
    twitter: { card: "summary_large_image", title: `${text.title} – PaperFree`, description: text.metaDescription, images: [image.url] },
  };
}

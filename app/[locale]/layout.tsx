import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { FileDropGuard } from "@/components/FileDropGuard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { locales, localizePath, openGraphLocales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { languageAlternates, resolveLocale, type LocaleParams } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t.meta.title, template: t.meta.titleTemplate },
    description: t.meta.description,
    applicationName: siteConfig.name,
    keywords: t.meta.keywords,
    authors: [{ name: "PaperFree Contributors", url: siteConfig.githubUrl }],
    creator: "PaperFree",
    alternates: { canonical: localizePath(locale), languages: languageAlternates("/") },
    openGraph: {
      type: "website",
      locale: openGraphLocales[locale],
      siteName: siteConfig.name,
      title: t.meta.title,
      description: t.meta.description,
      url: localizePath(locale),
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

/** Applies the color scheme before the first paint so nothing flashes. */
const themeScript = `(function(){try{var s=localStorage.getItem("paperfree-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default async function LocaleLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <I18nProvider locale={locale}>
          <a
            href="#main"
            className="sr-only z-50 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            {t.common.skipToContent}
          </a>
          <FileDropGuard />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer locale={locale} />
        </I18nProvider>
      </body>
    </html>
  );
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "PaperFree",
  title: "PaperFree – Kostenlose PDF-Werkzeuge, 100 % lokal im Browser",
  shortDescription: "Kostenlose PDF-Werkzeuge ohne Upload, ohne Konto, ohne Limits.",
  description:
    "PDFs zusammenfügen, teilen, drehen, komprimieren und in Bilder umwandeln – kostenlos, quelloffen und zu 100 % lokal im Browser. Deine Dateien verlassen niemals dein Gerät.",
  url: resolveSiteUrl(),
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/cind3rbyte/paperfree",
  kofiUrl: process.env.NEXT_PUBLIC_KOFI_URL || "https://ko-fi.com/cind3rbyte",
  buyMeACoffeeUrl: process.env.NEXT_PUBLIC_BMC_URL || "",
  license: "MIT",
} as const;

export type SiteConfig = typeof siteConfig;

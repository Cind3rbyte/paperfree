function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

/** Global project settings. Texts live in lib/i18n/dictionaries. */
export const siteConfig = {
  name: "PaperFree",
  url: resolveSiteUrl(),
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/cind3rbyte/paperfree",
  kofiUrl: process.env.NEXT_PUBLIC_KOFI_URL || "https://ko-fi.com/cind3rbyte",
  buyMeACoffeeUrl: process.env.NEXT_PUBLIC_BMC_URL || "",
  license: "MIT",
} as const;

export type SiteConfig = typeof siteConfig;

import type { MetadataRoute } from "next";
import { locales, localizePath } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    ...tools.map((tool) => ({ path: tool.href, priority: 0.8, changeFrequency: "monthly" as const })),
  ];

  return paths.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: `${siteConfig.url}${localizePath(locale, path)}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((alternate) => [alternate, `${siteConfig.url}${localizePath(alternate, path)}`])),
      },
    })),
  );
}

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${siteConfig.url}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    ...tools.map((tool) => ({
      url: `${siteConfig.url}${tool.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

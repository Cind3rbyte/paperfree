import type { MetadataRoute } from "next";
import { defaultLocale, localizePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  const t = getDictionary(defaultLocale);
  return {
    name: t.meta.title,
    short_name: siteConfig.name,
    description: t.meta.shortDescription,
    start_url: localizePath(defaultLocale),
    display: "standalone",
    background_color: "#020617",
    theme_color: "#6366f1",
    lang: defaultLocale,
    categories: ["productivity", "utilities"],
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}

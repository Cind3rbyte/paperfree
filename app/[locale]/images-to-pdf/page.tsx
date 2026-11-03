import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { ImagesToPdfTool } from "@/components/tools/ImagesToPdfTool";
import { buildToolMetadata, resolveLocale, type LocaleParams } from "@/lib/i18n/server";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return buildToolMetadata(await resolveLocale(params), "images-to-pdf");
}

export default async function ImagesToPdfPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <ToolShell locale={locale} toolId="images-to-pdf">
      <ImagesToPdfTool />
    </ToolShell>
  );
}

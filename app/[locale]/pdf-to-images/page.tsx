import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { PdfToImagesTool } from "@/components/tools/PdfToImagesTool";
import { buildToolMetadata, resolveLocale, type LocaleParams } from "@/lib/i18n/server";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return buildToolMetadata(await resolveLocale(params), "pdf-to-images");
}

export default async function PdfToImagesPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <ToolShell locale={locale} toolId="pdf-to-images">
      <PdfToImagesTool />
    </ToolShell>
  );
}

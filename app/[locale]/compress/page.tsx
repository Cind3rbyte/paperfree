import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { CompressTool } from "@/components/tools/CompressTool";
import { buildToolMetadata, resolveLocale, type LocaleParams } from "@/lib/i18n/server";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return buildToolMetadata(await resolveLocale(params), "compress");
}

export default async function CompressPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <ToolShell locale={locale} toolId="compress">
      <CompressTool />
    </ToolShell>
  );
}

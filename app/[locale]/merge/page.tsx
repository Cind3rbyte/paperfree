import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { MergeTool } from "@/components/tools/MergeTool";
import { buildToolMetadata, resolveLocale, type LocaleParams } from "@/lib/i18n/server";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return buildToolMetadata(await resolveLocale(params), "merge");
}

export default async function MergePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <ToolShell locale={locale} toolId="merge">
      <MergeTool />
    </ToolShell>
  );
}

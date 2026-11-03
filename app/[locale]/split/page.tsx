import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { SplitTool } from "@/components/tools/SplitTool";
import { buildToolMetadata, resolveLocale, type LocaleParams } from "@/lib/i18n/server";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return buildToolMetadata(await resolveLocale(params), "split");
}

export default async function SplitPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <ToolShell locale={locale} toolId="split">
      <SplitTool />
    </ToolShell>
  );
}

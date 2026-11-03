import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { OrganizeTool } from "@/components/tools/OrganizeTool";
import { buildToolMetadata, resolveLocale, type LocaleParams } from "@/lib/i18n/server";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return buildToolMetadata(await resolveLocale(params), "organize");
}

export default async function OrganizePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  return (
    <ToolShell locale={locale} toolId="organize">
      <OrganizeTool />
    </ToolShell>
  );
}

import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { OrganizeTool } from "@/components/tools/OrganizeTool";
import { getTool } from "@/lib/tools";

const tool = getTool("organize");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.metaDescription,
  alternates: { canonical: tool.href },
  openGraph: { title: `${tool.title} – PaperFree`, description: tool.metaDescription, url: tool.href },
};

const tips = [
  {
    title: "Verlustfrei",
    text: "Drehen und Löschen verändert keine Inhalte: Text, Bilder und Schriften bleiben in Originalqualität erhalten.",
  },
  {
    title: "Rückgängig machen",
    text: "Gelöschte Seiten werden erst beim Speichern entfernt. Bis dahin kannst du sie jederzeit wiederherstellen.",
  },
  {
    title: "Auf dem Smartphone",
    text: "Nutze die Pfeil-Buttons unter jeder Seite, um die Reihenfolge auch ohne Drag-and-Drop zu ändern.",
  },
];

export default function OrganizePage() {
  return (
    <ToolShell toolId="organize" tips={tips}>
      <OrganizeTool />
    </ToolShell>
  );
}

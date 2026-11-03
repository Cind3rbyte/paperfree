import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { MergeTool } from "@/components/tools/MergeTool";
import { getTool } from "@/lib/tools";

const tool = getTool("merge");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.metaDescription,
  alternates: { canonical: tool.href },
  openGraph: { title: `${tool.title} – PaperFree`, description: tool.metaDescription, url: tool.href },
};

const tips = [
  {
    title: "Reihenfolge festlegen",
    text: "Ziehe Dateien am Griff an die richtige Stelle oder sortiere sie mit einem Klick nach Namen – „Seite 2“ landet dabei korrekt vor „Seite 10“.",
  },
  {
    title: "Ohne Größenlimit",
    text: "Es gibt keine Begrenzung bei Dateianzahl oder Seiten. Die einzige Grenze ist der Arbeitsspeicher deines Geräts.",
  },
  {
    title: "Nur einzelne Seiten nötig?",
    text: "Extrahiere zuerst mit „PDF teilen“ die gewünschten Seiten und füge sie danach hier zusammen.",
  },
];

export default function MergePage() {
  return (
    <ToolShell toolId="merge" tips={tips}>
      <MergeTool />
    </ToolShell>
  );
}

import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { CompressTool } from "@/components/tools/CompressTool";
import { getTool } from "@/lib/tools";

const tool = getTool("compress");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.metaDescription,
  alternates: { canonical: tool.href },
  openGraph: { title: `${tool.title} – PaperFree`, description: tool.metaDescription, url: tool.href },
};

const tips = [
  {
    title: "Smart-Modus",
    text: "Ideal für Präsentationen und Berichte mit Fotos: Text bleibt durchsuchbar, nur eingebettete Bilder werden verkleinert.",
  },
  {
    title: "Maximal-Modus",
    text: "Perfekt für eingescannte Dokumente. Mit Graustufen und niedriger Qualität erreichst du die kleinsten Dateien.",
  },
  {
    title: "Ehrliche Ergebnisse",
    text: "PaperFree zeigt dir die exakte Ersparnis. Ist eine PDF bereits optimal, siehst du das sofort – ohne Rätselraten.",
  },
];

export default function CompressPage() {
  return (
    <ToolShell toolId="compress" tips={tips}>
      <CompressTool />
    </ToolShell>
  );
}

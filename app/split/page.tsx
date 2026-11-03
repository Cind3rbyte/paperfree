import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { SplitTool } from "@/components/tools/SplitTool";
import { getTool } from "@/lib/tools";

const tool = getTool("split");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.metaDescription,
  alternates: { canonical: tool.href },
  openGraph: { title: `${tool.title} – PaperFree`, description: tool.metaDescription, url: tool.href },
};

const tips = [
  {
    title: "Bereiche clever eingeben",
    text: "„1-3, 5“ wählt Seite 1 bis 3 und 5. „8-“ bedeutet ab Seite 8 bis zum Ende, „-4“ die ersten vier Seiten.",
  },
  {
    title: "Vier Modi",
    text: "Extrahiere eine Auswahl, erzeuge pro Bereich eine Datei, speichere jede Seite einzeln oder teile in feste Blöcke.",
  },
  {
    title: "Schnell auswählen",
    text: "Halte die Umschalttaste gedrückt, um ganze Seitenbereiche im Vorschau-Raster mit zwei Klicks zu markieren.",
  },
];

export default function SplitPage() {
  return (
    <ToolShell toolId="split" tips={tips}>
      <SplitTool />
    </ToolShell>
  );
}

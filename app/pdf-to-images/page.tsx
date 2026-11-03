import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { PdfToImagesTool } from "@/components/tools/PdfToImagesTool";
import { getTool } from "@/lib/tools";

const tool = getTool("pdf-to-images");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.metaDescription,
  alternates: { canonical: tool.href },
  openGraph: { title: `${tool.title} – PaperFree`, description: tool.metaDescription, url: tool.href },
};

const tips = [
  {
    title: "Die richtige Auflösung",
    text: "150 DPI reichen für Bildschirm und Präsentationen. 300 DPI eignen sich für den Druck und für feine Details.",
  },
  {
    title: "PNG oder JPG?",
    text: "PNG ist verlustfrei und ideal für Text und Grafiken. JPG erzeugt deutlich kleinere Dateien bei Fotos und Scans.",
  },
  {
    title: "Einzelne Seite",
    text: "Fahre über eine Seite und klicke auf das Download-Symbol, um nur diese Seite sofort als Bild zu speichern.",
  },
];

export default function PdfToImagesPage() {
  return (
    <ToolShell toolId="pdf-to-images" tips={tips}>
      <PdfToImagesTool />
    </ToolShell>
  );
}

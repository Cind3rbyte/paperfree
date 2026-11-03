import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { ImagesToPdfTool } from "@/components/tools/ImagesToPdfTool";
import { getTool } from "@/lib/tools";

const tool = getTool("images-to-pdf");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.metaDescription,
  alternates: { canonical: tool.href },
  openGraph: { title: `${tool.title} – PaperFree`, description: tool.metaDescription, url: tool.href },
};

const tips = [
  {
    title: "Originalqualität",
    text: "PNG- und JPG-Dateien werden ohne erneute Kompression eingebettet. WebP & Co. werden verlustarm umgewandelt.",
  },
  {
    title: "Handyfotos",
    text: "Die Ausrichtung aus den EXIF-Daten wird automatisch berücksichtigt. Falls nötig, drehe einzelne Bilder per Klick.",
  },
  {
    title: "Seitengröße",
    text: "Wähle A4 oder US Letter für druckfertige Dokumente – oder „Bildgröße“, damit jede Seite exakt so groß wie das Bild ist.",
  },
];

export default function ImagesToPdfPage() {
  return (
    <ToolShell toolId="images-to-pdf" tips={tips}>
      <ImagesToPdfTool />
    </ToolShell>
  );
}

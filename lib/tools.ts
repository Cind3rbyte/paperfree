import { Combine, ImagePlus, Images, LayoutGrid, Minimize2, Scissors, type LucideIcon } from "lucide-react";

export type ToolId = "merge" | "split" | "organize" | "images-to-pdf" | "pdf-to-images" | "compress";

export interface ToolDefinition {
  id: ToolId;
  href: `/${ToolId}`;
  title: string;
  navLabel: string;
  tagline: string;
  description: string;
  metaDescription: string;
  icon: LucideIcon;
  /** Tailwind-Verlauf für Icon-Kacheln. */
  gradient: string;
  /** Dezenter Glow-Effekt für Karten im Hover-Zustand. */
  glow: string;
  highlights: string[];
}

export const tools: ToolDefinition[] = [
  {
    id: "merge",
    href: "/merge",
    title: "PDF zusammenfügen",
    navLabel: "Zusammenfügen",
    tagline: "Mehrere PDFs in einer Datei vereinen",
    description: "Ziehe beliebig viele PDFs hinein, bringe sie per Drag-and-Drop in die richtige Reihenfolge und füge sie zu einem Dokument zusammen.",
    metaDescription: "PDFs kostenlos zusammenfügen – ohne Upload, direkt im Browser. Reihenfolge per Drag-and-Drop festlegen.",
    icon: Combine,
    gradient: "from-indigo-500 to-violet-500",
    glow: "group-hover:shadow-indigo-500/20",
    highlights: ["Unbegrenzt viele Dateien", "Reihenfolge per Drag-and-Drop", "Ohne Wasserzeichen"],
  },
  {
    id: "split",
    href: "/split",
    title: "PDF teilen & Seiten extrahieren",
    navLabel: "Teilen",
    tagline: "Seiten auswählen oder per Bereich exportieren",
    description: "Sieh alle Seiten als Vorschau, wähle sie per Klick oder gib Bereiche wie „1-3, 5“ ein – als eine PDF, pro Bereich oder Seite für Seite.",
    metaDescription: "PDF teilen und Seiten extrahieren – per Vorschau-Raster oder Seitenbereich wie 1-3, 5. 100 % lokal im Browser.",
    icon: Scissors,
    gradient: "from-rose-500 to-pink-500",
    glow: "group-hover:shadow-rose-500/20",
    highlights: ["Vorschau-Raster aller Seiten", "Bereiche wie „1-3, 5, 8-“", "Einzelseiten als ZIP"],
  },
  {
    id: "organize",
    href: "/organize",
    title: "Seiten organisieren & drehen",
    navLabel: "Organisieren",
    tagline: "Seiten löschen, drehen und neu anordnen",
    description: "Drehe einzelne Seiten um 90°, lösche überflüssige Seiten und ordne alles per Drag-and-Drop neu – mit Live-Vorschau.",
    metaDescription: "PDF-Seiten drehen, löschen und neu anordnen – kostenlos und ohne Upload direkt im Browser.",
    icon: LayoutGrid,
    gradient: "from-amber-500 to-orange-500",
    glow: "group-hover:shadow-amber-500/20",
    highlights: ["Drehen in 90°-Schritten", "Löschen & Wiederherstellen", "Neu anordnen per Drag-and-Drop"],
  },
  {
    id: "images-to-pdf",
    href: "/images-to-pdf",
    title: "Bilder zu PDF",
    navLabel: "Bilder → PDF",
    tagline: "PNG, JPG & WebP zu einer PDF",
    description: "Wandle Fotos, Scans und Screenshots in eine PDF um – mit Seitengröße, Ausrichtung, Rändern und Drehung pro Bild.",
    metaDescription: "JPG, PNG und WebP in PDF umwandeln – kostenlos, ohne Upload, mit A4-, Letter- oder Originalgröße.",
    icon: ImagePlus,
    gradient: "from-emerald-500 to-teal-500",
    glow: "group-hover:shadow-emerald-500/20",
    highlights: ["PNG, JPG, WebP, GIF, BMP, AVIF", "A4, US Letter oder Bildgröße", "EXIF-Drehung wird berücksichtigt"],
  },
  {
    id: "pdf-to-images",
    href: "/pdf-to-images",
    title: "PDF zu Bildern",
    navLabel: "PDF → Bilder",
    tagline: "Seiten als hochauflösende PNGs exportieren",
    description: "Rendere jede Seite in bis zu 300 DPI als PNG oder JPG und lade alles bequem als ZIP-Archiv herunter.",
    metaDescription: "PDF in PNG oder JPG umwandeln – bis 300 DPI, alle Seiten als ZIP. 100 % lokal im Browser.",
    icon: Images,
    gradient: "from-sky-500 to-cyan-500",
    glow: "group-hover:shadow-sky-500/20",
    highlights: ["Bis 300 DPI", "PNG oder JPG", "Alle Seiten als .zip"],
  },
  {
    id: "compress",
    href: "/compress",
    title: "PDF komprimieren",
    navLabel: "Komprimieren",
    tagline: "Dateigröße mit Qualitätsregler verringern",
    description: "Verkleinere PDFs für E-Mail und Upload-Portale: Fotos werden neu berechnet, Text bleibt scharf – oder maximal per Canvas-Resampling.",
    metaDescription: "PDF verkleinern ohne Upload: Qualitätsregler, Smart-Modus für scharfen Text oder maximale Kompression.",
    icon: Minimize2,
    gradient: "from-fuchsia-500 to-purple-600",
    glow: "group-hover:shadow-fuchsia-500/20",
    highlights: ["Qualitätsregler 10–100 %", "Smart-Modus: Text bleibt erhalten", "Vorher/Nachher-Vergleich"],
  },
];

export function getTool(id: ToolId): ToolDefinition {
  const tool = tools.find((entry) => entry.id === id);
  if (!tool) throw new Error(`Unbekanntes Werkzeug: ${id}`);
  return tool;
}

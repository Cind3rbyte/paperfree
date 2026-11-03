import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Cell = { kind: "yes" | "no" | "partial" | "soon"; text: string };

interface Row {
  feature: string;
  paperfree: Cell;
  acrobat: Cell;
  ilovepdf: Cell;
}

const rows: Row[] = [
  {
    feature: "Preis",
    paperfree: { kind: "yes", text: "Kostenlos, für immer" },
    acrobat: { kind: "no", text: "Abo für den vollen Funktionsumfang" },
    ilovepdf: { kind: "partial", text: "Gratis mit Limits, Premium kostenpflichtig" },
  },
  {
    feature: "Dateien bleiben auf deinem Gerät",
    paperfree: { kind: "yes", text: "100 % lokal im Browser" },
    acrobat: { kind: "partial", text: "Desktop lokal, Online-Tools mit Cloud-Upload" },
    ilovepdf: { kind: "no", text: "Web-Version lädt auf Server hoch" },
  },
  {
    feature: "Ohne Konto nutzbar",
    paperfree: { kind: "yes", text: "Ja, ohne Anmeldung" },
    acrobat: { kind: "partial", text: "Viele Funktionen erfordern ein Konto" },
    ilovepdf: { kind: "yes", text: "Ja, für Basisfunktionen" },
  },
  {
    feature: "Keine Datei- oder Tageslimits",
    paperfree: { kind: "yes", text: "Nur durch dein Gerät begrenzt" },
    acrobat: { kind: "partial", text: "Gratis-Nutzung eingeschränkt" },
    ilovepdf: { kind: "partial", text: "Gratis-Version mit Limits" },
  },
  {
    feature: "Open Source & selbst hostbar",
    paperfree: { kind: "yes", text: "MIT-Lizenz, 1-Klick auf Vercel" },
    acrobat: { kind: "no", text: "Proprietär" },
    ilovepdf: { kind: "no", text: "Proprietär" },
  },
  {
    feature: "Zusammenfügen, Teilen, Drehen",
    paperfree: { kind: "yes", text: "Ja" },
    acrobat: { kind: "yes", text: "Ja" },
    ilovepdf: { kind: "yes", text: "Ja" },
  },
  {
    feature: "Komprimieren & PDF ↔ Bilder",
    paperfree: { kind: "yes", text: "Ja" },
    acrobat: { kind: "yes", text: "Ja" },
    ilovepdf: { kind: "yes", text: "Ja" },
  },
  {
    feature: "Text bearbeiten, OCR, Signieren",
    paperfree: { kind: "soon", text: "Auf der Roadmap" },
    acrobat: { kind: "yes", text: "Ja" },
    ilovepdf: { kind: "partial", text: "Teilweise (Premium)" },
  },
];

function CellContent({ cell, highlight = false }: { cell: Cell; highlight?: boolean }) {
  const icon =
    cell.kind === "yes" ? (
      <Check className="size-4" aria-hidden="true" />
    ) : cell.kind === "no" ? (
      <X className="size-4" aria-hidden="true" />
    ) : (
      <Minus className="size-4" aria-hidden="true" />
    );
  return (
    <span className="flex items-start gap-2">
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
          cell.kind === "yes" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
          cell.kind === "no" && "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
          cell.kind === "partial" && "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
          cell.kind === "soon" && "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
        )}
      >
        {icon}
      </span>
      <span className={cn("text-sm", highlight ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300")}>
        {cell.text}
      </span>
    </span>
  );
}

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <caption className="sr-only">Funktionsvergleich: PaperFree, Adobe Acrobat und iLovePDF</caption>
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th scope="col" className="w-1/4 p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Funktion
            </th>
            <th scope="col" className="w-1/4 bg-indigo-50/70 p-4 dark:bg-indigo-500/10">
              <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-300">PaperFree</span>
            </th>
            <th scope="col" className="w-1/4 p-4 text-base font-bold text-slate-800 dark:text-slate-100">
              Adobe Acrobat
            </th>
            <th scope="col" className="w-1/4 p-4 text-base font-bold text-slate-800 dark:text-slate-100">
              iLovePDF
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} className="border-b border-slate-100 last:border-0 dark:border-slate-800/70">
              <th scope="row" className="p-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {row.feature}
              </th>
              <td className="bg-indigo-50/70 p-4 dark:bg-indigo-500/10">
                <CellContent cell={row.paperfree} highlight />
              </td>
              <td className="p-4">
                <CellContent cell={row.acrobat} />
              </td>
              <td className="p-4">
                <CellContent cell={row.ilovepdf} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

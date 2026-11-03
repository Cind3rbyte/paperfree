type ClassValue = string | false | null | undefined | 0;

/** Verbindet CSS-Klassen und ignoriert leere Werte. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Formatiert Bytes menschenlesbar (z. B. „1,4 MB“). */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toLocaleString("de-DE", {
    maximumFractionDigits: exponent === 0 ? 0 : decimals,
  })} ${units[exponent]}`;
}

/** Startet den Download eines Blobs im Browser – ohne Server-Roundtrip. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Entfernt die Dateiendung („bericht.final.pdf“ → „bericht.final“). */
export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^./\\]+$/, "");
}

/** Entfernt Zeichen, die in Dateinamen auf gängigen Betriebssystemen nicht erlaubt sind. */
export function sanitizeFileName(name: string, fallback: string): string {
  const printable = Array.from(name)
    .filter((char) => char.charCodeAt(0) >= 32)
    .join("");
  const cleaned = printable
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
  return cleaned || fallback;
}

/** Stellt sicher, dass ein Dateiname die gewünschte Endung trägt. */
export function ensureExtension(fileName: string, extension: string): string {
  const normalized = extension.startsWith(".") ? extension : `.${extension}`;
  return fileName.toLowerCase().endsWith(normalized.toLowerCase()) ? fileName : `${fileName}${normalized}`;
}

/** Erstellt einen bereinigten Dateinamen mit Endung aus einer Benutzereingabe. */
export function buildOutputFileName(input: string, fallback: string, extension: string): string {
  const withoutExtension = stripExtension(input.trim()) || fallback;
  return ensureExtension(sanitizeFileName(withoutExtension, fallback), extension);
}

/** Erzeugt eine eindeutige ID (für Listen-Keys). */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Verschiebt ein Element innerhalb eines Arrays (immutabel). */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = list.slice();
  if (from < 0 || from >= next.length || to < 0 || to >= next.length || from === to) return next;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Gibt dem Browser kurz die Kontrolle zurück, damit Fortschrittsanzeigen neu gezeichnet werden. */
export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Begrenzt einen Wert auf einen Bereich. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Liefert eine lesbare Fehlermeldung aus einem unbekannten Fehlerobjekt. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return "Unbekannter Fehler. Bitte versuche es erneut.";
}

/** Prüft, ob eine Datei anhand von MIME-Typ oder Endung zu einer Akzeptanzliste passt. */
export function matchesAccept(file: File, accept: readonly string[]): boolean {
  if (accept.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.some((rule) => {
    const normalized = rule.trim().toLowerCase();
    if (normalized.startsWith(".")) return name.endsWith(normalized);
    if (normalized.endsWith("/*")) return type.startsWith(normalized.slice(0, -1));
    return type === normalized;
  });
}

/** Sortiert Dateinamen „natürlich“ (Seite 2 vor Seite 10). */
export const naturalCollator = new Intl.Collator("de", { numeric: true, sensitivity: "base" });

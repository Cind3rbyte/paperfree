type ClassValue = string | false | null | undefined | 0;

/** Joins CSS class names and skips empty values. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Formats bytes for humans (e.g. "1.4 MB" / "1,4 MB"). */
export function formatBytes(bytes: number, locale = "en", decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toLocaleString(locale, {
    maximumFractionDigits: exponent === 0 ? 0 : decimals,
  })} ${units[exponent]}`;
}

/** Downloads a blob in the browser – no server round trip. */
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

/** Removes the file extension ("report.final.pdf" → "report.final"). */
export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^./\\]+$/, "");
}

/** Removes characters that common operating systems don't allow in file names. */
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

/** Makes sure a file name ends with the given extension. */
export function ensureExtension(fileName: string, extension: string): string {
  const normalized = extension.startsWith(".") ? extension : `.${extension}`;
  return fileName.toLowerCase().endsWith(normalized.toLowerCase()) ? fileName : `${fileName}${normalized}`;
}

/** Builds a sanitized file name with extension from user input. */
export function buildOutputFileName(input: string, fallback: string, extension: string): string {
  const withoutExtension = stripExtension(input.trim()) || fallback;
  return ensureExtension(sanitizeFileName(withoutExtension, fallback), extension);
}

/** Creates a unique id (for list keys). */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Moves an item within an array (immutably). */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = list.slice();
  if (from < 0 || from >= next.length || to < 0 || to >= next.length || from === to) return next;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Briefly yields to the browser so progress indicators can repaint. */
export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Clamps a value to a range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Returns a readable message for an unknown error value. */
export function getErrorMessage(error: unknown, fallback = "Unknown error. Please try again."): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

/** Checks whether a file matches an accept list by MIME type or extension. */
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

/** Sorts file names "naturally" (page 2 before page 10). */
export const naturalCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

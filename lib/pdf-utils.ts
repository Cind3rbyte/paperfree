/**
 * PaperFree PDF-Engine
 *
 * Alle Funktionen in dieser Datei laufen ausschließlich im Browser des Nutzers.
 * - pdf-lib  → Struktur-Operationen (zusammenfügen, teilen, drehen, Bilder einbetten)
 * - pdf.js   → Rendering (Vorschaubilder, PDF → Bild, Rastern beim Komprimieren)
 * - JSZip    → Mehrere Ergebnisdateien als ZIP bündeln
 *
 * Es gibt keinerlei Netzwerkanfragen mit Nutzerdaten.
 */
import JSZip from "jszip";
import {
  degrees,
  EncryptedPDFError,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  type PDFObject,
} from "pdf-lib";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { clamp, stripExtension, yieldToBrowser } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                Grundlagen                                  */
/* -------------------------------------------------------------------------- */

/** Fortschritt von 0 bis 1 plus optionaler Statustext. */
export type ProgressHandler = (fraction: number, message?: string) => void;

/** Fehler mit nutzerfreundlicher deutscher Meldung. */
export class PdfToolError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PdfToolError";
  }
}

export type BinarySource = File | Blob | ArrayBuffer | Uint8Array;

export interface OutputFile {
  name: string;
  bytes: Uint8Array;
}

/** Pfad, unter dem scripts/copy-pdfjs-assets.mjs Worker & Assets ablegt. */
const PDFJS_ASSET_BASE = "/pdfjs/";

/** iOS Safari begrenzt Canvas-Flächen auf ca. 16,7 Mio. Pixel. */
const MAX_CANVAS_PIXELS = 16_000_000;
const MAX_CANVAS_SIDE = 16_384;

/** 1 CSS-Pixel = 0,75 PDF-Punkte (96 dpi → 72 dpi). */
const PX_TO_PT = 0.75;

const PRODUCER = "PaperFree – 100 % lokale PDF-Werkzeuge";

/** Liefert immer eine frische Kopie der Bytes (pdf.js überträgt Puffer an seinen Worker). */
export async function toUint8Array(source: BinarySource): Promise<Uint8Array> {
  if (source instanceof Uint8Array) return source.slice();
  if (source instanceof ArrayBuffer) return new Uint8Array(source.slice(0));
  return new Uint8Array(await source.arrayBuffer());
}

/** Verpackt Bytes als Blob (TypeScript-sicher für alle Uint8Array-Varianten). */
export function bytesToBlob(bytes: Uint8Array, type = "application/pdf"): Blob {
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type });
}

export function normalizeRotation(angle: number): number {
  const rounded = Math.round(angle / 90) * 90;
  return ((rounded % 360) + 360) % 360;
}

function sourceName(source: BinarySource): string {
  return typeof File !== "undefined" && source instanceof File ? `„${source.name}“` : "Die Datei";
}

/** Prüft die PDF-Signatur „%PDF-“ in den ersten Bytes. */
export async function isPdfFile(file: Blob): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const text = String.fromCharCode(...head);
  return text.includes("%PDF-");
}

/* -------------------------------------------------------------------------- */
/*                               pdf.js-Loader                                */
/* -------------------------------------------------------------------------- */

type PdfJsModule = typeof import("pdfjs-dist");

let pdfJsPromise: Promise<PdfJsModule> | null = null;

/** Lädt pdf.js erst bei Bedarf und nur im Browser (kein SSR). */
export function loadPdfJs(): Promise<PdfJsModule> {
  if (typeof window === "undefined") {
    return Promise.reject(new PdfToolError("pdf.js steht nur im Browser zur Verfügung."));
  }
  if (!pdfJsPromise) {
    pdfJsPromise = import("pdfjs-dist")
      .then((pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS_ASSET_BASE}pdf.worker.min.mjs`;
        return pdfjs;
      })
      .catch((error: unknown) => {
        pdfJsPromise = null;
        throw new PdfToolError("Die PDF-Render-Engine konnte nicht geladen werden. Bitte lade die Seite neu.", {
          cause: error,
        });
      });
  }
  return pdfJsPromise;
}

function translatePdfJsError(error: unknown, source: BinarySource): PdfToolError {
  const name = typeof error === "object" && error !== null && "name" in error ? String(error.name) : "";
  if (name === "PasswordException") {
    return new PdfToolError(
      `${sourceName(source)} ist passwortgeschützt. Bitte entferne zuerst das Passwort und versuche es erneut.`,
      { cause: error },
    );
  }
  if (name === "InvalidPDFException" || name === "FormatError") {
    return new PdfToolError(`${sourceName(source)} ist keine gültige PDF-Datei oder beschädigt.`, { cause: error });
  }
  if (error instanceof PdfToolError) return error;
  return new PdfToolError(`${sourceName(source)} konnte nicht geöffnet werden.`, { cause: error });
}

/** Öffnet ein Dokument mit pdf.js (für Rendering). Danach immer `destroy()` aufrufen. */
export async function openPdfJsDocument(source: BinarySource): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  const data = await toUint8Array(source);
  const task = pdfjs.getDocument({
    data,
    cMapUrl: `${PDFJS_ASSET_BASE}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${PDFJS_ASSET_BASE}standard_fonts/`,
    wasmUrl: `${PDFJS_ASSET_BASE}wasm/`,
    iccUrl: `${PDFJS_ASSET_BASE}iccs/`,
    enableXfa: false,
  });
  try {
    return await task.promise;
  } catch (error) {
    throw translatePdfJsError(error, source);
  }
}

/* -------------------------------------------------------------------------- */
/*                               pdf-lib-Loader                               */
/* -------------------------------------------------------------------------- */

/** Öffnet ein Dokument mit pdf-lib (für Struktur-Operationen). */
export async function loadPdfLibDocument(source: BinarySource): Promise<PDFDocument> {
  const bytes = await toUint8Array(source);
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      throw new PdfToolError(
        `${sourceName(source)} ist verschlüsselt bzw. passwortgeschützt. Bitte entferne zuerst den Schutz (z. B. über „Drucken als PDF“) und versuche es erneut.`,
        { cause: error },
      );
    }
    throw new PdfToolError(`${sourceName(source)} konnte nicht als PDF gelesen werden. Ist die Datei beschädigt?`, {
      cause: error,
    });
  }
}

function copyDocumentInfo(source: PDFDocument, target: PDFDocument): void {
  const title = source.getTitle();
  const author = source.getAuthor();
  const subject = source.getSubject();
  const keywords = source.getKeywords();
  if (title) target.setTitle(title);
  if (author) target.setAuthor(author);
  if (subject) target.setSubject(subject);
  if (keywords) target.setKeywords(keywords.split(/\s*[,;]\s*|\s+/).filter(Boolean));
  const language = source.catalog.get(PDFName.of("Lang"));
  if (language) target.catalog.set(PDFName.of("Lang"), language);
}

function stampProducer(document: PDFDocument): void {
  document.setProducer(PRODUCER);
  document.setCreator("PaperFree");
  document.setModificationDate(new Date());
}

async function savePdf(document: PDFDocument): Promise<Uint8Array> {
  stampProducer(document);
  return document.save({ useObjectStreams: true, addDefaultPage: false });
}

/* -------------------------------------------------------------------------- */
/*                                Seitenbereiche                              */
/* -------------------------------------------------------------------------- */

export interface ParsedPageRanges {
  /** Alle Seiten (1-basiert) in eingegebener Reihenfolge, ohne Duplikate. */
  pages: number[];
  /** Jede Komma-Gruppe als eigene Liste (1-basiert) – für „Jeder Bereich als eigene PDF“. */
  groups: number[][];
  /** Nutzerfreundliche Fehlermeldung oder null. */
  error: string | null;
}

/**
 * Wandelt Eingaben wie „1-3, 5, 8-“ in Seitennummern um.
 * Unterstützt offene Bereiche („8-“ = 8 bis Ende, „-3“ = 1 bis 3) und absteigende Bereiche („5-3“).
 */
export function parsePageRanges(input: string, pageCount: number): ParsedPageRanges {
  const tokens = input
    .split(/[,;]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return { pages: [], groups: [], error: null };
  }

  const groups: number[][] = [];
  const ensureValid = (page: number): string | null =>
    page < 1 || page > pageCount
      ? `Seite ${page} existiert nicht – das Dokument hat ${pageCount} ${pageCount === 1 ? "Seite" : "Seiten"}.`
      : null;

  for (const token of tokens) {
    const normalized = token.replace(/\s+/g, "").replace(/[–—]/g, "-");
    const single = /^(\d+)$/.exec(normalized);
    const range = /^(\d*)-(\d*)$/.exec(normalized);

    if (single) {
      const page = Number(single[1]);
      const error = ensureValid(page);
      if (error) return { pages: [], groups: [], error };
      groups.push([page]);
      continue;
    }

    if (range && (range[1] || range[2])) {
      const start = range[1] ? Number(range[1]) : 1;
      const end = range[2] ? Number(range[2]) : pageCount;
      const error = ensureValid(start) ?? ensureValid(end);
      if (error) return { pages: [], groups: [], error };
      const step = start <= end ? 1 : -1;
      const group: number[] = [];
      for (let page = start; step > 0 ? page <= end : page >= end; page += step) group.push(page);
      groups.push(group);
      continue;
    }

    return {
      pages: [],
      groups: [],
      error: `„${token}“ ist kein gültiger Seitenbereich. Beispiel: 1-3, 5, 8-`,
    };
  }

  const seen = new Set<number>();
  const pages: number[] = [];
  for (const group of groups) {
    for (const page of group) {
      if (!seen.has(page)) {
        seen.add(page);
        pages.push(page);
      }
    }
  }

  return { pages, groups, error: null };
}

/** Fasst Seitennummern kompakt zusammen: [1,2,3,5] → „1-3, 5“. */
export function formatPageRanges(pages: Iterable<number>): string {
  const sorted = Array.from(new Set(pages)).sort((a, b) => a - b);
  const parts: string[] = [];
  let index = 0;
  while (index < sorted.length) {
    const start = sorted[index];
    let end = start;
    while (index + 1 < sorted.length && sorted[index + 1] === end + 1) {
      index += 1;
      end = sorted[index];
    }
    parts.push(start === end ? String(start) : `${start}-${end}`);
    index += 1;
  }
  return parts.join(", ");
}

/* -------------------------------------------------------------------------- */
/*                                 Zusammenfügen                              */
/* -------------------------------------------------------------------------- */

/** Fügt mehrere PDFs in der angegebenen Reihenfolge zu einer Datei zusammen. */
export async function mergePdfs(files: readonly BinarySource[], onProgress?: ProgressHandler): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new PdfToolError("Bitte wähle mindestens zwei PDF-Dateien zum Zusammenfügen aus.");
  }

  const merged = await PDFDocument.create();
  const steps = files.length + 1;

  for (const [index, file] of files.entries()) {
    const label = typeof File !== "undefined" && file instanceof File ? file.name : `Datei ${index + 1}`;
    onProgress?.(index / steps, `Füge „${label}“ hinzu (${index + 1}/${files.length}) …`);
    const source = await loadPdfLibDocument(file);
    const pages = await merged.copyPages(source, source.getPageIndices());
    for (const page of pages) merged.addPage(page);
    if (index === 0) copyDocumentInfo(source, merged);
    await yieldToBrowser();
  }

  if (merged.getPageCount() === 0) {
    throw new PdfToolError("Die ausgewählten PDFs enthalten keine Seiten.");
  }

  onProgress?.(files.length / steps, "Speichere die zusammengefügte PDF …");
  const bytes = await savePdf(merged);
  onProgress?.(1, "Fertig!");
  return bytes;
}

/* -------------------------------------------------------------------------- */
/*                       Teilen, Extrahieren & Organisieren                   */
/* -------------------------------------------------------------------------- */

export interface PageInstruction {
  /** 0-basierter Index der Seite im Quelldokument. */
  index: number;
  /** Zusätzliche Drehung im Uhrzeigersinn (Vielfaches von 90). */
  rotation: number;
}

async function buildDocument(source: PDFDocument, instructions: readonly PageInstruction[]): Promise<Uint8Array> {
  if (instructions.length === 0) {
    throw new PdfToolError("Es wurden keine Seiten ausgewählt.");
  }
  const pageCount = source.getPageCount();
  for (const { index } of instructions) {
    if (!Number.isInteger(index) || index < 0 || index >= pageCount) {
      throw new PdfToolError(`Seite ${index + 1} existiert nicht im Dokument.`);
    }
  }

  const output = await PDFDocument.create();
  const copied = await output.copyPages(
    source,
    instructions.map((instruction) => instruction.index),
  );

  copied.forEach((page, position) => {
    const extra = normalizeRotation(instructions[position].rotation);
    if (extra !== 0) {
      page.setRotation(degrees(normalizeRotation(page.getRotation().angle + extra)));
    }
    output.addPage(page);
  });

  copyDocumentInfo(source, output);
  return savePdf(output);
}

/** Extrahiert ausgewählte Seiten (0-basiert, Reihenfolge bleibt erhalten) in eine neue PDF. */
export async function extractPages(
  file: BinarySource,
  pageIndices: readonly number[],
  onProgress?: ProgressHandler,
): Promise<Uint8Array> {
  onProgress?.(0.1, "Lese PDF …");
  const source = await loadPdfLibDocument(file);
  const unique = Array.from(new Set(pageIndices));
  onProgress?.(0.4, `Extrahiere ${unique.length} ${unique.length === 1 ? "Seite" : "Seiten"} …`);
  const bytes = await buildDocument(
    source,
    unique.map((index) => ({ index, rotation: 0 })),
  );
  onProgress?.(1, "Fertig!");
  return bytes;
}

/**
 * Teilt eine PDF in mehrere Dokumente. Jede Gruppe (0-basierte Indizes) wird zu einer eigenen Datei.
 */
export async function splitPdf(
  file: BinarySource,
  groups: readonly (readonly number[])[],
  baseName: string,
  onProgress?: ProgressHandler,
): Promise<OutputFile[]> {
  const nonEmpty = groups.filter((group) => group.length > 0);
  if (nonEmpty.length === 0) {
    throw new PdfToolError("Es wurden keine Seiten zum Teilen ausgewählt.");
  }

  onProgress?.(0.05, "Lese PDF …");
  const source = await loadPdfLibDocument(file);
  const outputs: OutputFile[] = [];
  const usedNames = new Set<string>();

  for (const [position, group] of nonEmpty.entries()) {
    onProgress?.(
      0.05 + (position / nonEmpty.length) * 0.9,
      `Erstelle Datei ${position + 1} von ${nonEmpty.length} …`,
    );
    const unique = Array.from(new Set(group));
    const bytes = await buildDocument(
      source,
      unique.map((index) => ({ index, rotation: 0 })),
    );
    const label =
      unique.length === 1 ? `seite-${unique[0] + 1}` : `seiten-${formatPageRanges(unique.map((i) => i + 1)).replace(/,\s*/g, "_")}`;
    let name = `${baseName}-${label}.pdf`;
    let counter = 2;
    while (usedNames.has(name)) {
      name = `${baseName}-${label}-${counter}.pdf`;
      counter += 1;
    }
    usedNames.add(name);
    outputs.push({ name, bytes });
    await yieldToBrowser();
  }

  onProgress?.(1, "Fertig!");
  return outputs;
}

/** Ordnet Seiten neu, dreht sie und entfernt nicht aufgeführte Seiten. */
export async function organizePdf(
  file: BinarySource,
  instructions: readonly PageInstruction[],
  onProgress?: ProgressHandler,
): Promise<Uint8Array> {
  onProgress?.(0.1, "Lese PDF …");
  const source = await loadPdfLibDocument(file);
  onProgress?.(0.4, `Ordne ${instructions.length} ${instructions.length === 1 ? "Seite" : "Seiten"} an …`);
  const bytes = await buildDocument(source, instructions);
  onProgress?.(1, "Fertig!");
  return bytes;
}

/* -------------------------------------------------------------------------- */
/*                                   ZIP-Export                               */
/* -------------------------------------------------------------------------- */

export interface ZipEntry {
  name: string;
  data: Uint8Array | Blob;
}

/** Bündelt mehrere Dateien in ein ZIP-Archiv. */
export async function createZip(entries: readonly ZipEntry[], onProgress?: ProgressHandler): Promise<Blob> {
  const zip = new JSZip();
  const used = new Set<string>();
  for (const entry of entries) {
    let name = entry.name;
    let counter = 2;
    while (used.has(name)) {
      const dot = entry.name.lastIndexOf(".");
      name = dot > 0 ? `${entry.name.slice(0, dot)}-${counter}${entry.name.slice(dot)}` : `${entry.name}-${counter}`;
      counter += 1;
    }
    used.add(name);
    zip.file(name, entry.data, { binary: true });
  }
  return zip.generateAsync({ type: "blob", compression: "STORE", mimeType: "application/zip" }, (metadata) =>
    onProgress?.(metadata.percent / 100, "Packe ZIP-Archiv …"),
  );
}

/* -------------------------------------------------------------------------- */
/*                                Canvas-Helfer                               */
/* -------------------------------------------------------------------------- */

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  return canvas;
}

function getContext2d(canvas: HTMLCanvasElement, opaque = true): CanvasRenderingContext2D {
  const context = canvas.getContext("2d", { alpha: !opaque, willReadFrequently: false });
  if (!context) {
    throw new PdfToolError("Dein Browser konnte keine Zeichenfläche (Canvas) erstellen. Bitte schließe andere Tabs und versuche es erneut.");
  }
  return context;
}

/** Gibt den Speicher eines Canvas sofort frei (wichtig für Safari). */
function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new PdfToolError("Das Bild konnte nicht erzeugt werden – eventuell ist zu wenig Arbeitsspeicher frei."));
      },
      type,
      quality,
    );
  });
}

/** Begrenzt den Render-Maßstab, damit Browser-Limits für Canvas-Größen nicht überschritten werden. */
function clampRenderScale(width: number, height: number, requestedScale: number): number {
  let scale = requestedScale;
  const area = width * height * scale * scale;
  if (area > MAX_CANVAS_PIXELS) scale = Math.sqrt(MAX_CANVAS_PIXELS / (width * height));
  return Math.min(scale, MAX_CANVAS_SIDE / width, MAX_CANVAS_SIDE / height);
}

/** Rendert eine PDF-Seite auf einen weißen Canvas. */
async function renderPageToCanvas(page: PDFPageProxy, requestedScale: number): Promise<HTMLCanvasElement> {
  const base = page.getViewport({ scale: 1 });
  const scale = clampRenderScale(base.width, base.height, requestedScale);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = getContext2d(canvas);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, viewport, background: "#ffffff" }).promise;
  return canvas;
}

function convertToGrayscale(canvas: HTMLCanvasElement): void {
  const context = getContext2d(canvas);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = luminance;
    data[i + 1] = luminance;
    data[i + 2] = luminance;
  }
  context.putImageData(image, 0, 0);
}

/* -------------------------------------------------------------------------- */
/*                              Vorschaubilder                                */
/* -------------------------------------------------------------------------- */

export interface PageThumbnail {
  /** Object-URL des Vorschaubilds (vom Aufrufer mit URL.revokeObjectURL freizugeben). */
  url: string;
  /** Seitenbreite in PDF-Punkten (inkl. eingebetteter Drehung). */
  width: number;
  /** Seitenhöhe in PDF-Punkten (inkl. eingebetteter Drehung). */
  height: number;
}

async function renderThumbnail(page: PDFPageProxy, maxSize: number): Promise<PageThumbnail> {
  const base = page.getViewport({ scale: 1 });
  const pixelRatio = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
  const scale = (maxSize * pixelRatio) / Math.max(base.width, base.height);
  const canvas = await renderPageToCanvas(page, scale);
  try {
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.85);
    return { url: URL.createObjectURL(blob), width: base.width, height: base.height };
  } finally {
    releaseCanvas(canvas);
  }
}

export interface RenderThumbnailsOptions {
  maxSize?: number;
  signal?: AbortSignal;
  onDocument?: (pageCount: number) => void;
  onThumbnail: (index: number, thumbnail: PageThumbnail) => void;
}

/** Rendert nacheinander Vorschaubilder aller Seiten und meldet jede fertige Seite sofort. */
export async function renderThumbnails(source: BinarySource, options: RenderThumbnailsOptions): Promise<void> {
  const { maxSize = 240, signal, onDocument, onThumbnail } = options;
  const pdf = await openPdfJsDocument(source);
  try {
    if (signal?.aborted) return;
    onDocument?.(pdf.numPages);
    for (let index = 0; index < pdf.numPages; index += 1) {
      if (signal?.aborted) return;
      const page = await pdf.getPage(index + 1);
      try {
        const thumbnail = await renderThumbnail(page, maxSize);
        if (signal?.aborted) {
          URL.revokeObjectURL(thumbnail.url);
          return;
        }
        onThumbnail(index, thumbnail);
      } finally {
        page.cleanup();
      }
    }
  } finally {
    await pdf.destroy();
  }
}

export interface PdfPreview {
  pageCount: number;
  thumbnail: PageThumbnail | null;
}

/** Liefert Seitenzahl und Vorschaubild der ersten Seite (für Dateilisten). */
export async function getPdfPreview(source: BinarySource, maxSize = 120): Promise<PdfPreview> {
  const pdf = await openPdfJsDocument(source);
  try {
    if (pdf.numPages === 0) return { pageCount: 0, thumbnail: null };
    const page = await pdf.getPage(1);
    try {
      return { pageCount: pdf.numPages, thumbnail: await renderThumbnail(page, maxSize) };
    } finally {
      page.cleanup();
    }
  } finally {
    await pdf.destroy();
  }
}

/* -------------------------------------------------------------------------- */
/*                                PDF → Bilder                                */
/* -------------------------------------------------------------------------- */

export type RasterFormat = "png" | "jpeg";

export interface PdfToImagesOptions {
  /** Auflösung in DPI (72 = Originalgröße). */
  dpi: number;
  format: RasterFormat;
  /** JPEG-Qualität zwischen 0 und 1. */
  quality: number;
  /** 0-basierte Seiten; leer bzw. undefined = alle Seiten. */
  pageIndices?: readonly number[];
}

export interface RenderedImage {
  name: string;
  blob: Blob;
  pageNumber: number;
  width: number;
  height: number;
}

/** Rendert PDF-Seiten als PNG oder JPEG in der gewünschten Auflösung. */
export async function renderPdfToImages(
  file: BinarySource,
  options: PdfToImagesOptions,
  baseName: string,
  onProgress?: ProgressHandler,
): Promise<RenderedImage[]> {
  onProgress?.(0, "Öffne PDF …");
  const pdf = await openPdfJsDocument(file);
  try {
    const indices =
      options.pageIndices && options.pageIndices.length > 0
        ? Array.from(new Set(options.pageIndices)).filter((index) => index >= 0 && index < pdf.numPages)
        : Array.from({ length: pdf.numPages }, (_, index) => index);
    if (indices.length === 0) throw new PdfToolError("Es wurden keine Seiten ausgewählt.");

    const digits = String(pdf.numPages).length;
    const mime = options.format === "png" ? "image/png" : "image/jpeg";
    const extension = options.format === "png" ? "png" : "jpg";
    const results: RenderedImage[] = [];

    for (const [position, index] of indices.entries()) {
      onProgress?.(position / indices.length, `Rendere Seite ${index + 1} (${position + 1}/${indices.length}) …`);
      const page = await pdf.getPage(index + 1);
      try {
        const canvas = await renderPageToCanvas(page, options.dpi / 72);
        try {
          const blob = await canvasToBlob(canvas, mime, options.format === "jpeg" ? clamp(options.quality, 0.1, 1) : undefined);
          results.push({
            name: `${baseName}-seite-${String(index + 1).padStart(digits, "0")}.${extension}`,
            blob,
            pageNumber: index + 1,
            width: canvas.width,
            height: canvas.height,
          });
        } finally {
          releaseCanvas(canvas);
        }
      } finally {
        page.cleanup();
      }
      await yieldToBrowser();
    }

    onProgress?.(1, "Fertig!");
    return results;
  } finally {
    await pdf.destroy();
  }
}

/* -------------------------------------------------------------------------- */
/*                                Bilder → PDF                                */
/* -------------------------------------------------------------------------- */

export type ImagePageSize = "a4" | "letter" | "fit";
export type ImageOrientation = "auto" | "portrait" | "landscape";
export type ImageMargin = "none" | "small" | "large";

export interface ImagesToPdfOptions {
  pageSize: ImagePageSize;
  orientation: ImageOrientation;
  margin: ImageMargin;
}

export interface ImageInput {
  file: File;
  /** Drehung im Uhrzeigersinn in Grad (0, 90, 180, 270). */
  rotation: number;
}

const PAGE_SIZES: Record<Exclude<ImagePageSize, "fit">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

const MARGINS: Record<ImageMargin, number> = {
  none: 0,
  small: 18,
  large: 48,
};

export const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/avif",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".bmp",
  ".avif",
] as const;

function isPngBytes(bytes: Uint8Array): boolean {
  return bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

function isJpegBytes(bytes: Uint8Array): boolean {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

interface JpegSegment {
  marker: number;
  offset: number;
  length: number;
}

/** Iteriert über die Marker-Segmente einer JPEG-Datei bis zum Bildinhalt (SOS). */
function readJpegSegments(bytes: Uint8Array): JpegSegment[] {
  const segments: JpegSegment[] = [];
  if (!isJpegBytes(bytes)) return segments;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      offset += 2;
      continue;
    }
    const length = view.getUint16(offset + 2);
    if (length < 2 || offset + 2 + length > view.byteLength) break;
    segments.push({ marker, offset, length: length + 2 });
    if (marker === 0xda) break;
    offset += 2 + length;
  }
  return segments;
}

/** Liest die EXIF-Ausrichtung (1–8) einer JPEG-Datei. */
function readJpegOrientation(bytes: Uint8Array): number {
  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (const segment of readJpegSegments(bytes)) {
      if (segment.marker !== 0xe1) continue;
      const start = segment.offset + 4;
      if (view.getUint32(start) !== 0x45786966) continue;
      const tiff = start + 6;
      const littleEndian = view.getUint16(tiff) === 0x4949;
      const directory = tiff + view.getUint32(tiff + 4, littleEndian);
      const entries = view.getUint16(directory, littleEndian);
      for (let i = 0; i < entries; i += 1) {
        const entry = directory + 2 + i * 12;
        if (view.getUint16(entry, littleEndian) === 0x0112) {
          return view.getUint16(entry + 8, littleEndian);
        }
      }
    }
  } catch {
    return 1;
  }
  return 1;
}

/** Anzahl der Farbkomponenten laut SOF-Header (1 = Graustufen, 3 = RGB/YCbCr, 4 = CMYK). */
function readJpegComponents(bytes: Uint8Array): number {
  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  for (const segment of readJpegSegments(bytes)) {
    if (sofMarkers.has(segment.marker) && segment.offset + 9 < bytes.length) {
      return bytes[segment.offset + 9];
    }
  }
  return 0;
}

/** Entfernt EXIF-Segmente, damit der Browser beim Dekodieren nichts automatisch dreht. */
function stripJpegExif(bytes: Uint8Array): Uint8Array {
  const segments = readJpegSegments(bytes);
  const exif = segments.filter(
    (segment) =>
      segment.marker === 0xe1 &&
      bytes[segment.offset + 4] === 0x45 &&
      bytes[segment.offset + 5] === 0x78 &&
      bytes[segment.offset + 6] === 0x69 &&
      bytes[segment.offset + 7] === 0x66,
  );
  if (exif.length === 0) return bytes;
  const parts: Uint8Array[] = [];
  let cursor = 0;
  for (const segment of exif) {
    parts.push(bytes.subarray(cursor, segment.offset));
    cursor = segment.offset + segment.length;
  }
  parts.push(bytes.subarray(cursor));
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let position = 0;
  for (const part of parts) {
    result.set(part, position);
    position += part.length;
  }
  return result;
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}

/** Dekodiert ein Bild (inkl. korrekter EXIF-Ausrichtung) – mit Fallback auf <img>. */
async function decodeImage(blob: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // Einige Browser unterstützen bestimmte Formate nur über <img> – siehe Fallback unten.
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw new PdfToolError("Das Bild konnte nicht gelesen werden. Wird das Format von deinem Browser unterstützt?", {
      cause: error,
    });
  }
}

function hasTransparency(context: CanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = context.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

interface PreparedImage {
  kind: "png" | "jpg";
  bytes: Uint8Array;
}

/** Wandelt beliebige Browser-Bildformate über einen Canvas in PNG (mit Transparenz) oder JPEG um. */
async function rasterizeImage(blob: Blob, forceJpeg: boolean): Promise<PreparedImage> {
  const decoded = await decodeImage(blob);
  try {
    const area = decoded.width * decoded.height;
    const scale = area > MAX_CANVAS_PIXELS ? Math.sqrt(MAX_CANVAS_PIXELS / area) : 1;
    const canvas = createCanvas(decoded.width * scale, decoded.height * scale);
    try {
      const context = getContext2d(canvas, false);
      context.imageSmoothingQuality = "high";
      context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
      const transparent = !forceJpeg && hasTransparency(context, canvas.width, canvas.height);
      if (transparent) {
        const png = await canvasToBlob(canvas, "image/png");
        return { kind: "png", bytes: new Uint8Array(await png.arrayBuffer()) };
      }
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.92);
      return { kind: "jpg", bytes: new Uint8Array(await jpeg.arrayBuffer()) };
    } finally {
      releaseCanvas(canvas);
    }
  } finally {
    decoded.close();
  }
}

/** Bereitet ein Bild für pdf-lib vor: PNG/JPEG direkt (verlustfrei), alles andere über Canvas. */
async function prepareImageForPdf(file: File): Promise<PreparedImage> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (isPngBytes(bytes)) return { kind: "png", bytes };
  if (isJpegBytes(bytes)) {
    const orientation = readJpegOrientation(bytes);
    const components = readJpegComponents(bytes);
    if (orientation <= 1 && components !== 4) return { kind: "jpg", bytes };
    return rasterizeImage(file, true);
  }
  return rasterizeImage(file, false);
}

/** Erstellt aus Bildern (PNG, JPG, WebP, GIF, BMP, AVIF) ein PDF – ein Bild pro Seite. */
export async function imagesToPdf(
  images: readonly ImageInput[],
  options: ImagesToPdfOptions,
  onProgress?: ProgressHandler,
): Promise<Uint8Array> {
  if (images.length === 0) throw new PdfToolError("Bitte füge mindestens ein Bild hinzu.");

  const document = await PDFDocument.create();
  const margin = MARGINS[options.margin];

  for (const [position, image] of images.entries()) {
    onProgress?.(position / (images.length + 1), `Verarbeite „${image.file.name}“ (${position + 1}/${images.length}) …`);

    let prepared = await prepareImageForPdf(image.file);
    let embedded;
    try {
      embedded = prepared.kind === "png" ? await document.embedPng(prepared.bytes) : await document.embedJpg(prepared.bytes);
    } catch {
      prepared = await rasterizeImage(image.file, false);
      embedded = prepared.kind === "png" ? await document.embedPng(prepared.bytes) : await document.embedJpg(prepared.bytes);
    }

    const rotation = normalizeRotation(image.rotation);
    const quarterTurn = rotation === 90 || rotation === 270;
    const imageWidth = embedded.width * PX_TO_PT;
    const imageHeight = embedded.height * PX_TO_PT;
    const displayWidth = quarterTurn ? imageHeight : imageWidth;
    const displayHeight = quarterTurn ? imageWidth : imageHeight;

    let pageWidth: number;
    let pageHeight: number;
    let scale: number;

    if (options.pageSize === "fit") {
      pageWidth = displayWidth + margin * 2;
      pageHeight = displayHeight + margin * 2;
      scale = 1;
    } else {
      const [shortSide, longSide] = PAGE_SIZES[options.pageSize];
      const landscape =
        options.orientation === "landscape" || (options.orientation === "auto" && displayWidth > displayHeight);
      pageWidth = landscape ? longSide : shortSide;
      pageHeight = landscape ? shortSide : longSide;
      scale = Math.min((pageWidth - margin * 2) / displayWidth, (pageHeight - margin * 2) / displayHeight);
    }

    // Die Seite wird im ungedrehten Koordinatensystem aufgebaut und anschließend per /Rotate gedreht.
    const frameWidth = quarterTurn ? pageHeight : pageWidth;
    const frameHeight = quarterTurn ? pageWidth : pageHeight;
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;

    const page = document.addPage([frameWidth, frameHeight]);
    page.drawImage(embedded, {
      x: (frameWidth - drawWidth) / 2,
      y: (frameHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
    if (rotation !== 0) page.setRotation(degrees(rotation));

    await yieldToBrowser();
  }

  onProgress?.(images.length / (images.length + 1), "Speichere PDF …");
  document.setTitle(stripExtension(images[0].file.name));
  const bytes = await savePdf(document);
  onProgress?.(1, "Fertig!");
  return bytes;
}

/* -------------------------------------------------------------------------- */
/*                                Komprimieren                                */
/* -------------------------------------------------------------------------- */

export type CompressionMode = "smart" | "raster";

export interface CompressOptions {
  mode: CompressionMode;
  /** Qualität von 10 (kleinste Datei) bis 100 (beste Qualität). */
  quality: number;
  /** Nur im Raster-Modus: Seiten in Graustufen umwandeln. */
  grayscale: boolean;
}

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  /** Smart-Modus: Anzahl neu komprimierter Bilder. */
  optimizedImages: number;
  /** Smart-Modus: Anzahl gefundener, optimierbarer JPEG-Bilder. */
  candidateImages: number;
  pageCount: number;
}

export interface CompressionSettings {
  jpegQuality: number;
  rasterDpi: number;
  maxImageSide: number;
}

/** Übersetzt den Qualitätsregler (10–100) in konkrete Kompressionsparameter. */
export function getCompressionSettings(quality: number): CompressionSettings {
  const q = clamp(quality, 10, 100) / 100;
  return {
    jpegQuality: Math.round((0.3 + q * 0.62) * 100) / 100,
    rasterDpi: Math.round(60 + q * 140),
    maxImageSide: Math.round(800 + q * 2200),
  };
}

function isName(object: PDFObject | undefined, name: string): boolean {
  return object instanceof PDFName && object.decodeText() === name;
}

function resolveObject(document: PDFDocument, object: PDFObject | undefined): PDFObject | undefined {
  return object instanceof PDFRef ? document.context.lookup(object) : object;
}

/** Prüft, ob der Farbraum eines Bildes gefahrlos durch DeviceRGB ersetzt werden kann. */
function hasReplaceableColorSpace(document: PDFDocument, dict: PDFDict): boolean {
  const colorSpace = resolveObject(document, dict.get(PDFName.of("ColorSpace")));
  const allowedNames = ["DeviceRGB", "DeviceGray", "CalRGB", "CalGray"];
  if (colorSpace instanceof PDFName) return allowedNames.includes(colorSpace.decodeText());
  if (colorSpace instanceof PDFArray && colorSpace.size() > 0) {
    const family = resolveObject(document, colorSpace.get(0));
    if (!(family instanceof PDFName)) return false;
    const familyName = family.decodeText();
    if (familyName === "CalRGB" || familyName === "CalGray") return true;
    if (familyName === "ICCBased" && colorSpace.size() > 1) {
      const profile = resolveObject(document, colorSpace.get(1));
      const profileDict = profile instanceof PDFRawStream ? profile.dict : profile instanceof PDFDict ? profile : null;
      const components = profileDict ? resolveObject(document, profileDict.get(PDFName.of("N"))) : undefined;
      return components instanceof PDFNumber && (components.asNumber() === 1 || components.asNumber() === 3);
    }
  }
  return false;
}

interface JpegCandidate {
  ref: PDFRef;
  stream: PDFRawStream;
}

/** Sucht eingebettete JPEG-Bilder, die sich verlustarm neu komprimieren lassen. */
function collectJpegImages(document: PDFDocument): JpegCandidate[] {
  const candidates: JpegCandidate[] = [];
  for (const [ref, object] of document.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    const { dict } = object;
    if (!isName(dict.get(PDFName.of("Subtype")), "Image")) continue;

    const filter = resolveObject(document, dict.get(PDFName.of("Filter")));
    const filterName =
      filter instanceof PDFName ? filter : filter instanceof PDFArray && filter.size() === 1 ? filter.get(0) : undefined;
    if (!isName(filterName, "DCTDecode")) continue;

    if (
      dict.has(PDFName.of("Mask")) ||
      dict.has(PDFName.of("Decode")) ||
      dict.has(PDFName.of("ImageMask")) ||
      dict.has(PDFName.of("SMaskInData"))
    ) {
      continue;
    }

    const softMask = resolveObject(document, dict.get(PDFName.of("SMask")));
    if (softMask instanceof PDFRawStream && softMask.dict.has(PDFName.of("Matte"))) continue;

    const bitsPerComponent = resolveObject(document, dict.get(PDFName.of("BitsPerComponent")));
    if (bitsPerComponent instanceof PDFNumber && bitsPerComponent.asNumber() !== 8) continue;

    if (!hasReplaceableColorSpace(document, dict)) continue;
    if (object.contents.length < 10_000) continue;

    candidates.push({ ref, stream: object });
  }
  return candidates;
}

interface RecompressedImage {
  bytes: Uint8Array;
  width: number;
  height: number;
}

async function recompressJpeg(bytes: Uint8Array, settings: CompressionSettings): Promise<RecompressedImage | null> {
  const components = readJpegComponents(bytes);
  if (components !== 1 && components !== 3) return null;

  let decoded: DecodedImage;
  try {
    decoded = await decodeImage(bytesToBlob(stripJpegExif(bytes), "image/jpeg"));
  } catch {
    return null;
  }

  try {
    const scale = Math.min(1, settings.maxImageSide / Math.max(decoded.width, decoded.height));
    const canvas = createCanvas(Math.round(decoded.width * scale), Math.round(decoded.height * scale));
    try {
      const context = getContext2d(canvas);
      context.imageSmoothingQuality = "high";
      context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
      const blob = await canvasToBlob(canvas, "image/jpeg", settings.jpegQuality);
      return { bytes: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height };
    } finally {
      releaseCanvas(canvas);
    }
  } finally {
    decoded.close();
  }
}

/** Smart: Text & Vektoren bleiben erhalten, nur eingebettete Fotos werden neu komprimiert. */
async function compressSmart(
  file: BinarySource,
  settings: CompressionSettings,
  onProgress?: ProgressHandler,
): Promise<Omit<CompressResult, "originalSize" | "compressedSize">> {
  onProgress?.(0.02, "Analysiere PDF-Struktur …");
  const document = await loadPdfLibDocument(file);
  const candidates = collectJpegImages(document);
  let optimizedImages = 0;

  for (const [position, { ref, stream }] of candidates.entries()) {
    onProgress?.(0.05 + (position / Math.max(candidates.length, 1)) * 0.85, `Optimiere Bild ${position + 1} von ${candidates.length} …`);
    const replacement = await recompressJpeg(stream.contents, settings);
    if (replacement && replacement.bytes.length < stream.contents.length * 0.95) {
      const dict = stream.dict.clone(document.context);
      dict.set(PDFName.of("Width"), PDFNumber.of(replacement.width));
      dict.set(PDFName.of("Height"), PDFNumber.of(replacement.height));
      dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
      dict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
      dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
      dict.delete(PDFName.of("DecodeParms"));
      dict.set(PDFName.of("Length"), PDFNumber.of(replacement.bytes.length));
      document.context.assign(ref, PDFRawStream.of(dict, replacement.bytes));
      optimizedImages += 1;
    }
    await yieldToBrowser();
  }

  onProgress?.(0.92, "Optimiere Dateistruktur …");
  const bytes = await savePdf(document);
  return { bytes, optimizedImages, candidateImages: candidates.length, pageCount: document.getPageCount() };
}

/** Raster: Jede Seite wird als JPEG neu aufgebaut – maximale Ersparnis, Text danach nicht markierbar. */
async function compressRaster(
  file: BinarySource,
  settings: CompressionSettings,
  grayscale: boolean,
  onProgress?: ProgressHandler,
): Promise<Omit<CompressResult, "originalSize" | "compressedSize">> {
  onProgress?.(0.02, "Öffne PDF …");
  const pdf = await openPdfJsDocument(file);
  const output = await PDFDocument.create();
  try {
    const metadata = await pdf.getMetadata().catch(() => null);
    const info = (metadata?.info ?? {}) as Record<string, unknown>;
    if (typeof info.Title === "string" && info.Title) output.setTitle(info.Title);
    if (typeof info.Author === "string" && info.Author) output.setAuthor(info.Author);

    for (let index = 0; index < pdf.numPages; index += 1) {
      onProgress?.(0.02 + (index / pdf.numPages) * 0.9, `Komprimiere Seite ${index + 1} von ${pdf.numPages} …`);
      const page = await pdf.getPage(index + 1);
      try {
        const { width, height } = page.getViewport({ scale: 1 });
        const canvas = await renderPageToCanvas(page, settings.rasterDpi / 72);
        try {
          if (grayscale) convertToGrayscale(canvas);
          const blob = await canvasToBlob(canvas, "image/jpeg", settings.jpegQuality);
          const image = await output.embedJpg(new Uint8Array(await blob.arrayBuffer()));
          const pdfPage = output.addPage([width, height]);
          pdfPage.drawImage(image, { x: 0, y: 0, width, height });
        } finally {
          releaseCanvas(canvas);
        }
      } finally {
        page.cleanup();
      }
      await yieldToBrowser();
    }
  } finally {
    await pdf.destroy();
  }

  onProgress?.(0.94, "Speichere komprimierte PDF …");
  const bytes = await savePdf(output);
  return { bytes, optimizedImages: 0, candidateImages: 0, pageCount: output.getPageCount() };
}

/** Komprimiert eine PDF clientseitig. */
export async function compressPdf(
  file: File,
  options: CompressOptions,
  onProgress?: ProgressHandler,
): Promise<CompressResult> {
  const settings = getCompressionSettings(options.quality);
  const result =
    options.mode === "raster"
      ? await compressRaster(file, settings, options.grayscale, onProgress)
      : await compressSmart(file, settings, onProgress);
  onProgress?.(1, "Fertig!");
  return {
    ...result,
    originalSize: file.size,
    compressedSize: result.bytes.length,
  };
}

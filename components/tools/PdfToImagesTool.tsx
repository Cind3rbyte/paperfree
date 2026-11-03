"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Images } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PageCard } from "@/components/tools/PageCard";
import {
  IconButton,
  LoadedFileBar,
  MainToolbar,
  PanelCard,
  ResultPanel,
  StatLine,
  TaskFeedback,
  Workspace,
  type ResultFile,
} from "@/components/tools/ToolLayout";
import { usePdfThumbnails } from "@/hooks/usePdfThumbnails";
import { useTaskRunner } from "@/hooks/useTaskRunner";
import { createZip, renderPdfToImages, type RasterFormat } from "@/lib/pdf-utils";
import { downloadBlob, getErrorMessage, sanitizeFileName, stripExtension } from "@/lib/utils";

const PDF_ACCEPT = ["application/pdf", ".pdf"] as const;

const FORMAT_OPTIONS = [
  { value: "png", label: "PNG", hint: "verlustfrei" },
  { value: "jpeg", label: "JPG", hint: "kleiner" },
] as const;

const DPI_OPTIONS = [
  { value: "72", label: "72", hint: "Web" },
  { value: "150", label: "150", hint: "Standard" },
  { value: "200", label: "200", hint: "Hoch" },
  { value: "300", label: "300", hint: "Druck" },
] as const;

type DpiValue = (typeof DPI_OPTIONS)[number]["value"];

export function PdfToImagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [format, setFormat] = useState<RasterFormat>("png");
  const [dpi, setDpi] = useState<DpiValue>("200");
  const [quality, setQuality] = useState(90);
  const [result, setResult] = useState<ResultFile | null>(null);
  const [singleError, setSingleError] = useState<string | null>(null);
  const thumbs = usePdfThumbnails(file);
  const task = useTaskRunner();
  const { reset: resetTask } = task;
  const pageCount = thumbs.pageCount;

  useEffect(() => {
    setSelected(new Set(Array.from({ length: pageCount }, (_, index) => index)));
  }, [file, pageCount]);

  const loadFile = useCallback(
    (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setFile(next);
      setResult(null);
      setSingleError(null);
      resetTask();
    },
    [resetTask],
  );

  const reset = () => {
    setFile(null);
    setResult(null);
    setSingleError(null);
    resetTask();
  };

  const allIndices = useMemo(() => Array.from({ length: pageCount }, (_, index) => index), [pageCount]);
  const sortedSelection = useMemo(() => Array.from(selected).sort((a, b) => a - b), [selected]);
  const baseName = file ? sanitizeFileName(stripExtension(file.name), "dokument") : "dokument";
  const options = { dpi: Number(dpi), format, quality: quality / 100 };

  const firstThumbnail = thumbs.thumbnails.find(Boolean);
  const pixelSize = firstThumbnail
    ? `${Math.round((firstThumbnail.width * Number(dpi)) / 72)} × ${Math.round((firstThumbnail.height * Number(dpi)) / 72)} px`
    : "–";

  const toggle = (index: number) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    setResult(null);
  };

  const handleExport = async () => {
    if (!file || sortedSelection.length === 0) return;
    setResult(null);
    setSingleError(null);
    const output = await task.run(async (onProgress) => {
      const images = await renderPdfToImages(
        file,
        { ...options, pageIndices: sortedSelection },
        baseName,
        (fraction, message) => onProgress(fraction * (sortedSelection.length > 1 ? 0.9 : 1), message),
      );
      if (images.length === 1) {
        return {
          blob: images[0].blob,
          fileName: images[0].name,
          details: `${images[0].width} × ${images[0].height} px`,
        } satisfies ResultFile;
      }
      const zip = await createZip(
        images.map((image) => ({ name: image.name, data: image.blob })),
        (fraction, message) => onProgress(0.9 + fraction * 0.1, message),
      );
      return {
        blob: zip,
        fileName: `${baseName}-bilder.zip`,
        details: `${images.length} ${format === "png" ? "PNG" : "JPG"}-Bilder in ${dpi} DPI`,
      } satisfies ResultFile;
    });
    if (output) setResult(output);
  };

  const downloadSingle = async (index: number) => {
    if (!file) return;
    setSingleError(null);
    try {
      const [image] = await renderPdfToImages(file, { ...options, pageIndices: [index] }, baseName);
      if (image) downloadBlob(image.blob, image.name);
    } catch (error) {
      setSingleError(getErrorMessage(error));
    }
  };

  if (!file) {
    return (
      <Dropzone
        accept={PDF_ACCEPT}
        onFiles={loadFile}
        title="PDF in Bilder umwandeln"
        description="oder hierher ziehen · jede Seite wird als PNG oder JPG gespeichert"
        buttonLabel="PDF auswählen"
        icon={<Images className="size-7" aria-hidden="true" />}
      />
    );
  }

  return (
    <Workspace
      main={
        <div>
          <LoadedFileBar file={file} pageCount={pageCount} rendered={thumbs.rendered} loading={thumbs.loading} onReplace={reset} />
          {thumbs.error ? (
            <Alert tone="error" title="PDF konnte nicht geladen werden">
              {thumbs.error}
            </Alert>
          ) : (
            <>
              <MainToolbar>
                <span className="px-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {selected.size} von {pageCount} Seiten ausgewählt
                </span>
                <div className="ml-auto flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(new Set(allIndices))}>
                    Alle
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                    Keine
                  </Button>
                </div>
              </MainToolbar>
              {singleError && (
                <Alert tone="error" className="mb-3">
                  {singleError}
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {allIndices.map((index) => (
                  <PageCard
                    key={index}
                    label={`Seite ${index + 1}`}
                    thumbnail={thumbs.thumbnails[index]}
                    selectable
                    selected={selected.has(index)}
                    onClick={() => toggle(index)}
                    actions={
                      <IconButton label={`Nur Seite ${index + 1} herunterladen`} onClick={() => downloadSingle(index)}>
                        <Download className="size-4" aria-hidden="true" />
                      </IconButton>
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      }
      sidebar={
        result ? (
          <ResultPanel result={result} onReset={reset} resetLabel="Andere PDF umwandeln" />
        ) : (
          <PanelCard title="Bild-Export">
            <SegmentedControl label="Format" value={format} options={FORMAT_OPTIONS} onChange={setFormat} columns={2} />
            <SegmentedControl label="Auflösung (DPI)" value={dpi} options={DPI_OPTIONS} onChange={setDpi} columns={4} />
            {format === "jpeg" && (
              <label className="block space-y-2">
                <span className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-100">
                  JPG-Qualität <span className="tabular-nums text-indigo-600 dark:text-indigo-300">{quality}%</span>
                </span>
                <input
                  type="range"
                  min={40}
                  max={100}
                  step={5}
                  value={quality}
                  onChange={(event) => setQuality(Number(event.target.value))}
                  className="w-full"
                />
              </label>
            )}
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <StatLine label="Bilder" value={selected.size} />
              <StatLine label="Größe (Seite 1)" value={pixelSize} />
              <StatLine label="Download als" value={selected.size > 1 ? "ZIP-Archiv" : format === "png" ? "PNG" : "JPG"} />
            </div>
            <TaskFeedback task={task} />
            <Button
              size="lg"
              fullWidth
              disabled={selected.size === 0 || task.isWorking || pageCount === 0}
              loading={task.isWorking}
              icon={<Images className="size-5" aria-hidden="true" />}
              onClick={handleExport}
            >
              {task.isWorking ? "Bilder werden erzeugt …" : selected.size > 1 ? "Bilder als ZIP exportieren" : "Bild exportieren"}
            </Button>
          </PanelCard>
        )
      }
    />
  );
}

"use client";

import { useCallback, useMemo, useRef, useState, type MouseEvent } from "react";
import { Scissors } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PageCard } from "@/components/tools/PageCard";
import {
  FileNameInput,
  LoadedFileBar,
  MainToolbar,
  PanelCard,
  ResultPanel,
  TaskFeedback,
  Workspace,
  type ResultFile,
} from "@/components/tools/ToolLayout";
import { usePdfThumbnails } from "@/hooks/usePdfThumbnails";
import { useTaskRunner } from "@/hooks/useTaskRunner";
import { bytesToBlob, createZip, extractPages, formatPageRanges, parsePageRanges, splitPdf } from "@/lib/pdf-utils";
import { buildOutputFileName, clamp, sanitizeFileName, stripExtension } from "@/lib/utils";

const PDF_ACCEPT = ["application/pdf", ".pdf"] as const;

type SplitMode = "extract" | "ranges" | "every" | "chunks";

const MODE_OPTIONS = [
  { value: "extract", label: "Auswahl", hint: "eine PDF" },
  { value: "ranges", label: "Bereiche", hint: "je eine PDF" },
  { value: "every", label: "Einzeln", hint: "jede Seite" },
  { value: "chunks", label: "Alle N", hint: "Seiten" },
] as const;

export function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState("");
  const [mode, setMode] = useState<SplitMode>("extract");
  const [chunkSize, setChunkSize] = useState(2);
  const [outputName, setOutputName] = useState("");
  const [result, setResult] = useState<ResultFile | null>(null);
  const lastClicked = useRef<number | null>(null);
  const thumbs = usePdfThumbnails(file);
  const task = useTaskRunner();
  const { reset: resetTask } = task;
  const pageCount = thumbs.pageCount;

  const loadFile = useCallback(
    (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setFile(next);
      setSelected(new Set());
      setRangeInput("");
      setOutputName(stripExtension(next.name));
      setResult(null);
      lastClicked.current = null;
      resetTask();
    },
    [resetTask],
  );

  const reset = () => {
    setFile(null);
    setSelected(new Set());
    setRangeInput("");
    setResult(null);
    resetTask();
  };

  const applySelection = (next: Set<number>) => {
    setSelected(next);
    setRangeInput(formatPageRanges(Array.from(next, (index) => index + 1)));
    setResult(null);
  };

  const parsed = useMemo(() => parsePageRanges(rangeInput, pageCount), [rangeInput, pageCount]);

  const onRangeChange = (value: string) => {
    setRangeInput(value);
    setResult(null);
    const next = parsePageRanges(value, pageCount);
    if (!next.error) setSelected(new Set(next.pages.map((page) => page - 1)));
  };

  const togglePage = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    const next = new Set(selected);
    if (event.shiftKey && lastClicked.current !== null) {
      const [start, end] = [Math.min(lastClicked.current, index), Math.max(lastClicked.current, index)];
      const shouldSelect = !selected.has(index);
      for (let page = start; page <= end; page += 1) {
        if (shouldSelect) next.add(page);
        else next.delete(page);
      }
    } else if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    lastClicked.current = index;
    applySelection(next);
  };

  const allIndices = useMemo(() => Array.from({ length: pageCount }, (_, index) => index), [pageCount]);

  /** Liste der Ausgabedateien als Gruppen von 0-basierten Seitenindizes. */
  const plan = useMemo<number[][]>(() => {
    if (pageCount === 0) return [];
    const selectionInOrder =
      !parsed.error && parsed.pages.length > 0
        ? parsed.pages.map((page) => page - 1)
        : Array.from(selected).sort((a, b) => a - b);
    switch (mode) {
      case "extract":
        return selectionInOrder.length > 0 ? [selectionInOrder] : [];
      case "ranges":
        return parsed.error ? [] : parsed.groups.map((group) => group.map((page) => page - 1));
      case "every":
        return (selectionInOrder.length > 0 ? selectionInOrder : allIndices).map((index) => [index]);
      case "chunks": {
        const size = clamp(Math.floor(chunkSize) || 1, 1, pageCount);
        const groups: number[][] = [];
        for (let start = 0; start < pageCount; start += size) groups.push(allIndices.slice(start, start + size));
        return groups;
      }
    }
  }, [allIndices, chunkSize, mode, pageCount, parsed, selected]);

  const outputPages = plan.reduce((sum, group) => sum + group.length, 0);

  const summary =
    plan.length === 0
      ? "Noch keine Seiten ausgewählt"
      : plan.length === 1
        ? `→ 1 PDF mit ${outputPages} ${outputPages === 1 ? "Seite" : "Seiten"}`
        : `→ ${plan.length} PDFs (${outputPages} Seiten) als ZIP-Archiv`;

  const handleSplit = async () => {
    if (!file || plan.length === 0) return;
    setResult(null);
    const baseName = sanitizeFileName(stripExtension(outputName.trim()) || stripExtension(file.name), "dokument");
    const output = await task.run(async (onProgress) => {
      if (plan.length === 1) {
        const bytes = await extractPages(file, plan[0], onProgress);
        return {
          blob: bytesToBlob(bytes),
          fileName: buildOutputFileName(mode === "extract" ? `${baseName}-auszug` : baseName, "auszug", "pdf"),
          details: `${plan[0].length} ${plan[0].length === 1 ? "Seite" : "Seiten"} extrahiert`,
        } satisfies ResultFile;
      }
      const files = await splitPdf(file, plan, baseName, (fraction, message) => onProgress(fraction * 0.85, message));
      const zip = await createZip(
        files.map((entry) => ({ name: entry.name, data: entry.bytes })),
        (fraction, message) => onProgress(0.85 + fraction * 0.15, message),
      );
      return {
        blob: zip,
        fileName: buildOutputFileName(`${baseName}-geteilt`, "geteilt", "zip"),
        details: `${files.length} PDF-Dateien im ZIP-Archiv`,
      } satisfies ResultFile;
    });
    if (output) setResult(output);
  };

  if (!file) {
    return (
      <Dropzone
        accept={PDF_ACCEPT}
        onFiles={loadFile}
        title="PDF zum Teilen auswählen"
        description="oder hierher ziehen · du siehst danach alle Seiten als Vorschau"
        buttonLabel="PDF auswählen"
      />
    );
  }

  const selectWhere = (predicate: (index: number) => boolean) => applySelection(new Set(allIndices.filter(predicate)));

  return (
    <Workspace
      main={
        <div>
          <LoadedFileBar
            file={file}
            pageCount={pageCount}
            rendered={thumbs.rendered}
            loading={thumbs.loading}
            onReplace={reset}
          />
          {thumbs.error ? (
            <Alert tone="error" title="PDF konnte nicht geladen werden">
              {thumbs.error}
            </Alert>
          ) : (
            <>
              <MainToolbar>
                <span className="px-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {selected.size} von {pageCount} ausgewählt
                </span>
                <div className="ml-auto flex flex-wrap gap-1">
                  <Button variant="ghost" size="sm" onClick={() => selectWhere(() => true)}>
                    Alle
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => applySelection(new Set())}>
                    Keine
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => selectWhere((index) => index % 2 === 0)}>
                    Ungerade
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => selectWhere((index) => index % 2 === 1)}>
                    Gerade
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => selectWhere((index) => !selected.has(index))}>
                    Umkehren
                  </Button>
                </div>
              </MainToolbar>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                Klicke auf Seiten, um sie auszuwählen. Mit gedrückter <kbd className="rounded border border-slate-300 px-1 text-xs dark:border-slate-600">Umschalt</kbd>-Taste
                wählst du ganze Bereiche.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {allIndices.map((index) => (
                  <PageCard
                    key={index}
                    label={`Seite ${index + 1}`}
                    thumbnail={thumbs.thumbnails[index]}
                    selectable
                    selected={selected.has(index)}
                    dimmed={mode === "chunks"}
                    onClick={(event) => togglePage(index, event)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      }
      sidebar={
        result ? (
          <ResultPanel result={result} onReset={reset} resetLabel="Andere PDF teilen" />
        ) : (
          <PanelCard title="Teilen & Extrahieren">
            <SegmentedControl label="Modus" value={mode} options={MODE_OPTIONS} onChange={setMode} columns={4} />

            {mode !== "chunks" ? (
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Seitenbereich</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={rangeInput}
                  onChange={(event) => onRangeChange(event.target.value)}
                  placeholder="z. B. 1-3, 5, 8-"
                  aria-invalid={Boolean(parsed.error)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 aria-[invalid=true]:border-rose-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  {mode === "ranges"
                    ? "Jeder durch Komma getrennte Bereich wird eine eigene PDF."
                    : mode === "every"
                      ? "Leer lassen, um jede Seite des Dokuments einzeln zu speichern."
                      : "„8-“ bedeutet: ab Seite 8 bis zum Ende."}
                </span>
              </label>
            ) : (
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Seiten pro Datei</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, pageCount)}
                  value={chunkSize}
                  onChange={(event) => {
                    setChunkSize(Number(event.target.value));
                    setResult(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
            )}

            {parsed.error && mode !== "chunks" && <Alert tone="error">{parsed.error}</Alert>}

            <FileNameInput value={outputName} onChange={setOutputName} extension={plan.length > 1 ? "zip" : "pdf"} label="Basis-Dateiname" />

            <p className="rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200">
              {summary}
            </p>

            <TaskFeedback task={task} />

            <Button
              size="lg"
              fullWidth
              disabled={plan.length === 0 || task.isWorking || thumbs.pageCount === 0}
              loading={task.isWorking}
              icon={<Scissors className="size-5" aria-hidden="true" />}
              onClick={handleSplit}
            >
              {task.isWorking ? "Wird verarbeitet …" : plan.length > 1 ? "Teilen & ZIP erstellen" : "Seiten extrahieren"}
            </Button>
          </PanelCard>
        )
      }
    />
  );
}

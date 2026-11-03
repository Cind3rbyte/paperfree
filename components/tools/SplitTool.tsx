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
import { useI18n } from "@/lib/i18n/I18nProvider";
import { bytesToBlob, createZip, extractPages, formatPageRanges, parsePageRanges, splitPdf } from "@/lib/pdf-utils";
import { buildOutputFileName, clamp, sanitizeFileName, stripExtension } from "@/lib/utils";

const PDF_ACCEPT = ["application/pdf", ".pdf"] as const;

type SplitMode = "extract" | "ranges" | "every" | "chunks";

const MODES: readonly SplitMode[] = ["extract", "ranges", "every", "chunks"];

export function SplitTool() {
  const { t } = useI18n();
  const modeOptions = MODES.map((value) => ({ value, ...t.split.modes[value] }));
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

  /** Output files as groups of 0-based page indices. */
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
      ? t.split.summaryNone
      : plan.length === 1
        ? t.split.summaryOne(outputPages)
        : t.split.summaryMany(plan.length, outputPages);

  const handleSplit = async () => {
    if (!file || plan.length === 0) return;
    setResult(null);
    const baseName = sanitizeFileName(stripExtension(outputName.trim()) || stripExtension(file.name), "document");
    const output = await task.run(async (onProgress) => {
      if (plan.length === 1) {
        const bytes = await extractPages(file, plan[0], onProgress);
        return {
          blob: bytesToBlob(bytes),
          fileName: buildOutputFileName(
            mode === "extract" ? `${baseName}-${t.split.extractSuffix}` : baseName,
            t.split.extractSuffix,
            "pdf",
          ),
          details: t.split.detailsExtracted(plan[0].length),
        } satisfies ResultFile;
      }
      const files = await splitPdf(file, plan, baseName, (fraction, message) => onProgress(fraction * 0.85, message));
      const zip = await createZip(
        files.map((entry) => ({ name: entry.name, data: entry.bytes })),
        (fraction, message) => onProgress(0.85 + fraction * 0.15, message),
      );
      return {
        blob: zip,
        fileName: buildOutputFileName(`${baseName}-${t.split.splitSuffix}`, t.split.splitSuffix, "zip"),
        details: t.split.detailsZip(files.length),
      } satisfies ResultFile;
    });
    if (output) setResult(output);
  };

  if (!file) {
    return (
      <Dropzone
        accept={PDF_ACCEPT}
        onFiles={loadFile}
        title={t.split.dropTitle}
        description={t.split.dropDescription}
        buttonLabel={t.split.dropButton}
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
            <Alert tone="error" title={t.workspace.loadErrorTitle}>
              {thumbs.error}
            </Alert>
          ) : (
            <>
              <MainToolbar>
                <span className="px-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {t.split.selectedCount(selected.size, pageCount)}
                </span>
                <div className="ml-auto flex flex-wrap gap-1">
                  <Button variant="ghost" size="sm" onClick={() => selectWhere(() => true)}>
                    {t.split.all}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => applySelection(new Set())}>
                    {t.split.none}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => selectWhere((index) => index % 2 === 0)}>
                    {t.split.odd}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => selectWhere((index) => index % 2 === 1)}>
                    {t.split.even}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => selectWhere((index) => !selected.has(index))}>
                    {t.split.invert}
                  </Button>
                </div>
              </MainToolbar>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                {t.split.clickHintBefore}{" "}
                <kbd className="rounded border border-slate-300 px-1 text-xs dark:border-slate-600">{t.split.shiftKey}</kbd>
                {t.split.clickHintAfter.startsWith("-") ? "" : " "}
                {t.split.clickHintAfter}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {allIndices.map((index) => (
                  <PageCard
                    key={index}
                    label={t.workspace.pageLabel(index + 1)}
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
          <ResultPanel result={result} onReset={reset} resetLabel={t.split.resetLabel} />
        ) : (
          <PanelCard title={t.split.panelTitle}>
            <SegmentedControl label={t.split.modeLabel} value={mode} options={modeOptions} onChange={setMode} columns={4} />

            {mode !== "chunks" ? (
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.split.rangeLabel}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={rangeInput}
                  onChange={(event) => onRangeChange(event.target.value)}
                  placeholder={t.split.rangePlaceholder}
                  aria-invalid={Boolean(parsed.error)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 aria-[invalid=true]:border-rose-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  {mode === "ranges"
                    ? t.split.hintRanges
                    : mode === "every"
                      ? t.split.hintEvery
                      : t.split.hintExtract}
                </span>
              </label>
            ) : (
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.split.chunkLabel}</span>
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

            <FileNameInput value={outputName} onChange={setOutputName} extension={plan.length > 1 ? "zip" : "pdf"} label={t.split.baseName} />

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
              {task.isWorking ? t.split.working : plan.length > 1 ? t.split.buttonZip : t.split.buttonExtract}
            </Button>
          </PanelCard>
        )
      }
    />
  );
}

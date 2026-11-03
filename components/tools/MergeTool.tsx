"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowDownAZ, ArrowUp, ArrowUpDown, Combine, FileText, GripVertical, Plus, Trash2, X } from "lucide-react";
import { Dropzone, type DropzoneProgress } from "@/components/Dropzone";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  FileNameInput,
  IconButton,
  MainToolbar,
  PanelCard,
  ResultPanel,
  StatLine,
  TaskFeedback,
  Workspace,
  type ResultFile,
} from "@/components/tools/ToolLayout";
import { useDragReorder } from "@/hooks/useDragReorder";
import { useTaskRunner } from "@/hooks/useTaskRunner";
import { bytesToBlob, getPdfPreview, mergePdfs, type PageThumbnail } from "@/lib/pdf-utils";
import { buildOutputFileName, cn, createId, formatBytes, getErrorMessage, moveItem, naturalCollator } from "@/lib/utils";

const PDF_ACCEPT = ["application/pdf", ".pdf"] as const;

interface MergeItem {
  id: string;
  file: File;
  pageCount: number | null;
  thumbnail: PageThumbnail | null;
  error: string | null;
}

export function MergeTool() {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [outputName, setOutputName] = useState("zusammengefuegt");
  const [result, setResult] = useState<ResultFile | null>(null);
  const [loading, setLoading] = useState<DropzoneProgress | null>(null);
  const task = useTaskRunner();
  const { reset: resetTask } = task;
  const thumbnailUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = thumbnailUrls.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<MergeItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      const newItems: MergeItem[] = files.map((file) => ({
        id: createId(),
        file,
        pageCount: null,
        thumbnail: null,
        error: null,
      }));
      setItems((current) => [...current, ...newItems]);
      setResult(null);
      resetTask();

      for (const [index, item] of newItems.entries()) {
        setLoading({ value: index / newItems.length, label: `Lese „${item.file.name}“ (${index + 1}/${newItems.length}) …` });
        try {
          const preview = await getPdfPreview(item.file, 96);
          if (preview.thumbnail) thumbnailUrls.current.add(preview.thumbnail.url);
          updateItem(item.id, { pageCount: preview.pageCount, thumbnail: preview.thumbnail });
        } catch (error) {
          updateItem(item.id, { error: getErrorMessage(error) });
        }
      }
      setLoading(null);
    },
    [resetTask, updateItem],
  );

  const moveEntry = useCallback((from: number, to: number) => {
    setItems((current) => moveItem(current, from, to));
    setResult(null);
  }, []);

  const { dragIndex, overIndex, getItemProps } = useDragReorder(moveEntry);

  const removeItem = (id: string) => {
    setItems((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed?.thumbnail) {
        URL.revokeObjectURL(removed.thumbnail.url);
        thumbnailUrls.current.delete(removed.thumbnail.url);
      }
      return current.filter((item) => item.id !== id);
    });
    setResult(null);
  };

  const clearAll = () => {
    for (const url of thumbnailUrls.current) URL.revokeObjectURL(url);
    thumbnailUrls.current.clear();
    setItems([]);
    setResult(null);
    task.reset();
  };

  const validItems = useMemo(() => items.filter((item) => !item.error), [items]);
  const brokenCount = items.length - validItems.length;
  const totalPages = validItems.reduce((sum, item) => sum + (item.pageCount ?? 0), 0);
  const totalSize = validItems.reduce((sum, item) => sum + item.file.size, 0);
  const canMerge = validItems.length >= 2 && !loading && !task.isWorking;

  const handleMerge = async () => {
    setResult(null);
    const bytes = await task.run((onProgress) =>
      mergePdfs(
        validItems.map((item) => item.file),
        onProgress,
      ),
    );
    if (bytes) {
      setResult({
        blob: bytesToBlob(bytes),
        fileName: buildOutputFileName(outputName, "zusammengefuegt", "pdf"),
        details: `${validItems.length} Dateien · ${totalPages} Seiten`,
      });
    }
  };

  if (items.length === 0) {
    return (
      <Dropzone
        accept={PDF_ACCEPT}
        multiple
        onFiles={addFiles}
        title="PDF-Dateien auswählen"
        description="oder hierher ziehen · mehrere PDFs gleichzeitig möglich"
        buttonLabel="PDFs auswählen"
        progress={loading}
      />
    );
  }

  return (
    <Workspace
      main={
        <div>
          <MainToolbar>
            <span className="px-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {items.length} {items.length === 1 ? "Datei" : "Dateien"}
            </span>
            <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-700" aria-hidden="true" />
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowDownAZ className="size-4" aria-hidden="true" />}
              onClick={() => {
                setItems((current) => current.slice().sort((a, b) => naturalCollator.compare(a.file.name, b.file.name)));
                setResult(null);
              }}
            >
              Nach Name sortieren
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowUpDown className="size-4" aria-hidden="true" />}
              onClick={() => {
                setItems((current) => current.slice().reverse());
                setResult(null);
              }}
            >
              Umkehren
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              icon={<Trash2 className="size-4" aria-hidden="true" />}
              onClick={clearAll}
            >
              Alle entfernen
            </Button>
          </MainToolbar>

          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Ziehe die Dateien am Griff <GripVertical className="inline size-4 align-text-bottom" aria-hidden="true" /> in die
            gewünschte Reihenfolge oder nutze die Pfeile.
          </p>

          <ol className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                {...getItemProps(index)}
                className={cn(
                  "group flex cursor-grab items-center gap-3 rounded-2xl border bg-white p-3 transition active:cursor-grabbing dark:bg-slate-900",
                  item.error
                    ? "border-rose-300 dark:border-rose-500/40"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
                  dragIndex === index && "opacity-40",
                  overIndex === index && dragIndex !== index && "border-indigo-500 ring-4 ring-indigo-500/20",
                )}
              >
                <GripVertical className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="w-6 shrink-0 text-center text-sm font-bold tabular-nums text-slate-400">{index + 1}</span>
                <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element -- lokale Blob-URL
                    <img src={item.thumbnail.url} alt="" className="size-full object-contain" draggable={false} />
                  ) : (
                    <FileText className="size-6 text-slate-400" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className={cn("text-xs", item.error ? "text-rose-600 dark:text-rose-300" : "text-slate-500 dark:text-slate-400")}>
                    {item.error
                      ? item.error
                      : `${formatBytes(item.file.size)} · ${
                          item.pageCount === null ? "wird gelesen …" : `${item.pageCount} ${item.pageCount === 1 ? "Seite" : "Seiten"}`
                        }`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton label="Nach oben verschieben" onClick={() => moveEntry(index, index - 1)} disabled={index === 0}>
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Nach unten verschieben"
                    onClick={() => moveEntry(index, index + 1)}
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton label={`„${item.file.name}“ entfernen`} tone="danger" onClick={() => removeItem(item.id)}>
                    <X className="size-4" aria-hidden="true" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ol>

          <Dropzone
            className="mt-4"
            accept={PDF_ACCEPT}
            multiple
            compact
            onFiles={addFiles}
            title="Weitere PDFs hinzufügen"
            description="Klicken oder Dateien hierher ziehen"
            icon={<Plus className="size-5" aria-hidden="true" />}
            progress={loading}
          />
        </div>
      }
      sidebar={
        result ? (
          <ResultPanel result={result} onReset={clearAll} resetLabel="Neue Dateien zusammenfügen" />
        ) : (
          <PanelCard title="Zusammenfügen">
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <StatLine label="Dateien" value={validItems.length} />
              <StatLine label="Seiten gesamt" value={totalPages} />
              <StatLine label="Gesamtgröße" value={formatBytes(totalSize)} />
            </div>
            <FileNameInput value={outputName} onChange={setOutputName} extension="pdf" />
            {brokenCount > 0 && (
              <Alert tone="warning">
                {brokenCount === 1 ? "Eine Datei konnte" : `${brokenCount} Dateien konnten`} nicht gelesen werden und{" "}
                {brokenCount === 1 ? "wird" : "werden"} übersprungen.
              </Alert>
            )}
            {validItems.length < 2 && <Alert tone="info">Füge mindestens zwei PDF-Dateien hinzu.</Alert>}
            <TaskFeedback task={task} />
            <Button
              size="lg"
              fullWidth
              disabled={!canMerge}
              loading={task.isWorking}
              icon={<Combine className="size-5" aria-hidden="true" />}
              onClick={handleMerge}
            >
              {task.isWorking ? "Wird zusammengefügt …" : "PDFs zusammenfügen"}
            </Button>
          </PanelCard>
        )
      }
    />
  );
}

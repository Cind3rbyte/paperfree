"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownAZ, ArrowLeft, ArrowRight, FileDown, ImagePlus, Plus, RotateCcw, RotateCw, Trash2, X } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  bytesToBlob,
  imagesToPdf,
  SUPPORTED_IMAGE_TYPES,
  type ImageMargin,
  type ImageOrientation,
  type ImagePageSize,
} from "@/lib/pdf-utils";
import { buildOutputFileName, cn, createId, formatBytes, moveItem, naturalCollator, stripExtension } from "@/lib/utils";

interface ImageItem {
  id: string;
  file: File;
  url: string;
  rotation: number;
}

const PAGE_SIZES: readonly ImagePageSize[] = ["a4", "letter", "fit"];
const ORIENTATIONS: readonly ImageOrientation[] = ["auto", "portrait", "landscape"];
const MARGINS: readonly ImageMargin[] = ["none", "small", "large"];

export function ImagesToPdfTool() {
  const { locale, t } = useI18n();
  const pageSizeOptions = PAGE_SIZES.map((value) => ({ value, label: t.imagesToPdf.pageSizes[value] }));
  const orientationOptions = ORIENTATIONS.map((value) => ({ value, label: t.imagesToPdf.orientations[value] }));
  const marginOptions = MARGINS.map((value) => ({ value, label: t.imagesToPdf.margins[value] }));
  const defaultName = t.imagesToPdf.defaultName;
  const [items, setItems] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<ImagePageSize>("a4");
  const [orientation, setOrientation] = useState<ImageOrientation>("auto");
  const [margin, setMargin] = useState<ImageMargin>("small");
  const [outputName, setOutputName] = useState(defaultName);
  const [result, setResult] = useState<ResultFile | null>(null);
  const task = useTaskRunner();
  const { reset: resetTask } = task;
  const urls = useRef(new Set<string>());

  useEffect(() => {
    const created = urls.current;
    return () => {
      for (const url of created) URL.revokeObjectURL(url);
      created.clear();
    };
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      const added = files.map((file) => {
        const url = URL.createObjectURL(file);
        urls.current.add(url);
        return { id: createId(), file, url, rotation: 0 };
      });
      setItems((current) => [...current, ...added]);
      setOutputName((current) => (current === defaultName && added[0] ? stripExtension(added[0].file.name) : current));
      setResult(null);
      resetTask();
    },
    [defaultName, resetTask],
  );

  const change = useCallback((updater: (current: ImageItem[]) => ImageItem[]) => {
    setItems(updater);
    setResult(null);
  }, []);

  const moveEntry = useCallback((from: number, to: number) => change((current) => moveItem(current, from, to)), [change]);
  const { dragIndex, overIndex, getItemProps } = useDragReorder(moveEntry);

  const removeItem = (id: string) =>
    change((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
        urls.current.delete(removed.url);
      }
      return current.filter((item) => item.id !== id);
    });

  const rotateItem = (id: string, delta: number) =>
    change((current) => current.map((item) => (item.id === id ? { ...item, rotation: item.rotation + delta } : item)));

  const clearAll = () => {
    for (const url of urls.current) URL.revokeObjectURL(url);
    urls.current.clear();
    setItems([]);
    setOutputName(defaultName);
    setResult(null);
    resetTask();
  };

  const totalSize = items.reduce((sum, item) => sum + item.file.size, 0);

  const handleConvert = async () => {
    setResult(null);
    const bytes = await task.run((onProgress) =>
      imagesToPdf(
        items.map((item) => ({ file: item.file, rotation: item.rotation })),
        { pageSize, orientation, margin },
        onProgress,
      ),
    );
    if (bytes) {
      setResult({
        blob: bytesToBlob(bytes),
        fileName: buildOutputFileName(outputName, defaultName, "pdf"),
        details: t.imagesToPdf.details(items.length),
      });
    }
  };

  if (items.length === 0) {
    return (
      <Dropzone
        accept={SUPPORTED_IMAGE_TYPES}
        multiple
        onFiles={addFiles}
        title={t.imagesToPdf.dropTitle}
        description={t.imagesToPdf.dropDescription}
        buttonLabel={t.imagesToPdf.dropButton}
        icon={<ImagePlus className="size-7" aria-hidden="true" />}
      />
    );
  }

  return (
    <Workspace
      main={
        <div>
          <MainToolbar>
            <span className="px-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t.common.images(items.length)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowDownAZ className="size-4" aria-hidden="true" />}
              onClick={() => change((current) => current.slice().sort((a, b) => naturalCollator.compare(a.file.name, b.file.name)))}
            >
              {t.workspace.sortByName}
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto" icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={clearAll}>
              {t.workspace.removeAll}
            </Button>
          </MainToolbar>

          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {items.map((item, index) => (
              <li
                key={item.id}
                {...getItemProps(index)}
                className={cn(
                  "group relative flex cursor-grab flex-col gap-2 rounded-2xl border bg-white p-2 transition active:cursor-grabbing dark:bg-slate-900",
                  "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
                  dragIndex === index && "opacity-40",
                  overIndex === index && dragIndex !== index && "border-indigo-500 ring-4 ring-indigo-500/20",
                )}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[conic-gradient(at_center,#f1f5f9_25%,#e2e8f0_0_50%,#f1f5f9_0_75%,#e2e8f0_0)] bg-[length:16px_16px] dark:bg-[conic-gradient(at_center,#1e293b_25%,#0f172a_0_50%,#1e293b_0_75%,#0f172a_0)]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- lokale Blob-URL */}
                  <img
                    src={item.url}
                    alt={item.file.name}
                    draggable={false}
                    className="absolute inset-0 size-full object-contain p-2 transition-transform duration-300"
                    style={{
                      transform: `rotate(${item.rotation}deg) scale(${Math.abs(Math.round(item.rotation / 90)) % 2 === 1 ? 0.8 : 1})`,
                    }}
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-xs font-bold text-white">{index + 1}</span>
                </div>
                <div className="absolute right-3 top-3 flex flex-col gap-1 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                  <IconButton label={t.workspace.rotateLeft} onClick={() => rotateItem(item.id, -90)}>
                    <RotateCcw className="size-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton label={t.workspace.rotateRight} onClick={() => rotateItem(item.id, 90)}>
                    <RotateCw className="size-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton label={t.workspace.remove(item.file.name)} tone="danger" onClick={() => removeItem(item.id)}>
                    <X className="size-4" aria-hidden="true" />
                  </IconButton>
                </div>
                <div className="flex items-center justify-between gap-1 px-1">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{formatBytes(item.file.size, locale)}</p>
                  </div>
                  <span className="flex shrink-0 gap-1">
                    <IconButton label={t.workspace.moveEarlier} className="size-6" disabled={index === 0} onClick={() => moveEntry(index, index - 1)}>
                      <ArrowLeft className="size-3.5" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label={t.workspace.moveLater}
                      className="size-6"
                      disabled={index === items.length - 1}
                      onClick={() => moveEntry(index, index + 1)}
                    >
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </IconButton>
                  </span>
                </div>
              </li>
            ))}
            <li>
              <Dropzone
                className="h-full"
                accept={SUPPORTED_IMAGE_TYPES}
                multiple
                compact
                onFiles={addFiles}
                title={t.imagesToPdf.moreTitle}
                description={t.imagesToPdf.moreDescription}
                icon={<Plus className="size-5" aria-hidden="true" />}
              />
            </li>
          </ol>
        </div>
      }
      sidebar={
        result ? (
          <ResultPanel result={result} onReset={clearAll} resetLabel={t.imagesToPdf.resetLabel} />
        ) : (
          <PanelCard title={t.imagesToPdf.panelTitle}>
            <SegmentedControl label={t.imagesToPdf.pageSizeLabel} value={pageSize} options={pageSizeOptions} onChange={setPageSize} />
            <SegmentedControl
              label={t.imagesToPdf.orientationLabel}
              value={orientation}
              options={orientationOptions}
              onChange={setOrientation}
              disabled={pageSize === "fit"}
            />
            <SegmentedControl label={t.imagesToPdf.marginLabel} value={margin} options={marginOptions} onChange={setMargin} />
            <FileNameInput value={outputName} onChange={setOutputName} extension="pdf" />
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <StatLine label={t.imagesToPdf.statPages} value={items.length} />
              <StatLine label={t.imagesToPdf.statSize} value={formatBytes(totalSize, locale)} />
            </div>
            <TaskFeedback task={task} />
            <Button
              size="lg"
              fullWidth
              disabled={items.length === 0 || task.isWorking}
              loading={task.isWorking}
              icon={<FileDown className="size-5" aria-hidden="true" />}
              onClick={handleConvert}
            >
              {task.isWorking ? t.imagesToPdf.working : t.imagesToPdf.button}
            </Button>
          </PanelCard>
        )
      }
    />
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Minimize2, ScanLine, Sparkles } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  LoadedFileBar,
  PanelCard,
  ResultPanel,
  StatLine,
  TaskFeedback,
  Workspace,
  type ResultFile,
} from "@/components/tools/ToolLayout";
import { useTaskRunner } from "@/hooks/useTaskRunner";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  bytesToBlob,
  compressPdf,
  getCompressionSettings,
  getPdfPreview,
  type CompressionMode,
  type CompressResult,
  type PdfPreview,
} from "@/lib/pdf-utils";
import { cn, formatBytes, getErrorMessage, sanitizeFileName, stripExtension } from "@/lib/utils";

const PDF_ACCEPT = ["application/pdf", ".pdf"] as const;

const MODE_ICONS: Record<CompressionMode, typeof Sparkles> = {
  smart: Sparkles,
  raster: ScanLine,
};

export function CompressTool() {
  const { locale, t } = useI18n();
  const modes = (Object.keys(MODE_ICONS) as CompressionMode[]).map((value) => ({
    value,
    icon: MODE_ICONS[value],
    ...t.compress.modes[value],
  }));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PdfPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [mode, setMode] = useState<CompressionMode>("smart");
  const [quality, setQuality] = useState(60);
  const [grayscale, setGrayscale] = useState(false);
  const [result, setResult] = useState<ResultFile | null>(null);
  const [stats, setStats] = useState<CompressResult | null>(null);
  const task = useTaskRunner();
  const { reset: resetTask } = task;
  const fallbackError = t.common.unknownError;

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    let thumbnailUrl: string | null = null;
    setPreview(null);
    setPreviewError(null);
    getPdfPreview(file, 280)
      .then((value) => {
        thumbnailUrl = value.thumbnail?.url ?? null;
        if (cancelled) {
          if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
          return;
        }
        setPreview(value);
      })
      .catch((error: unknown) => {
        if (!cancelled) setPreviewError(getErrorMessage(error, fallbackError));
      });
    return () => {
      cancelled = true;
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    };
  }, [fallbackError, file]);

  const loadFile = useCallback(
    (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setFile(next);
      setResult(null);
      setStats(null);
      resetTask();
    },
    [resetTask],
  );

  const reset = () => {
    setFile(null);
    setResult(null);
    setStats(null);
    resetTask();
  };

  const settings = useMemo(() => getCompressionSettings(quality), [quality]);

  const handleCompress = async () => {
    if (!file) return;
    setResult(null);
    setStats(null);
    const output = await task.run((onProgress) => compressPdf(file, { mode, quality, grayscale: mode === "raster" && grayscale }, onProgress));
    if (output) {
      setStats(output);
      const saved = 1 - output.compressedSize / output.originalSize;
      setResult({
        blob: bytesToBlob(output.bytes),
        fileName: `${sanitizeFileName(stripExtension(file.name), "document")}-${t.compress.compressedSuffix}.pdf`,
        details: saved > 0 ? t.compress.saved(Math.round(saved * 100)) : t.compress.notSmaller,
      });
    }
  };

  if (!file) {
    return (
      <Dropzone
        accept={PDF_ACCEPT}
        onFiles={loadFile}
        title={t.compress.dropTitle}
        description={t.compress.dropDescription}
        buttonLabel={t.compress.dropButton}
        icon={<Minimize2 className="size-7" aria-hidden="true" />}
      />
    );
  }

  const saved = stats ? 1 - stats.compressedSize / stats.originalSize : 0;

  return (
    <Workspace
      main={
        <div className="space-y-4">
          <LoadedFileBar file={file} pageCount={preview?.pageCount ?? 0} rendered={0} loading={false} onReplace={reset} />
          {previewError && (
            <Alert tone="error" title={t.workspace.loadErrorTitle}>
              {previewError}
            </Alert>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {modes.map((entry) => {
              const Icon = entry.icon;
              const active = mode === entry.value;
              return (
                <button
                  key={entry.value}
                  type="button"
                  onClick={() => {
                    setMode(entry.value);
                    setResult(null);
                    setStats(null);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "flex gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-indigo-500",
                    active
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-900 dark:text-white">{entry.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600 dark:text-slate-400">{entry.text}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <Card className="grid gap-6 p-5 md:grid-cols-[200px_1fr]">
            <div className="flex items-center justify-center rounded-xl bg-slate-100 p-3 dark:bg-slate-800/70">
              {preview?.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element -- lokale Blob-URL
                <img
                  src={preview.thumbnail.url}
                  alt={t.compress.previewAlt}
                  className={cn("max-h-64 w-auto rounded shadow-md transition", mode === "raster" && grayscale && "grayscale")}
                />
              ) : (
                <div className="h-56 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.compress.presetLabel}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {t.compress.presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setQuality(preset.value);
                        setResult(null);
                        setStats(null);
                      }}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-indigo-500",
                        quality === preset.value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
                      )}
                    >
                      {preset.label}
                      <span className="block text-[11px] font-normal opacity-70">{preset.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {t.compress.qualityLabel}
                  <span className="tabular-nums text-indigo-600 dark:text-indigo-300">{quality}%</span>
                </span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={quality}
                  onChange={(event) => {
                    setQuality(Number(event.target.value));
                    setResult(null);
                    setStats(null);
                  }}
                  className="w-full"
                  aria-describedby="quality-hint"
                />
                <span id="quality-hint" className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{t.compress.smallest}</span>
                  <span>{t.compress.best}</span>
                </span>
              </label>

              <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                {mode === "smart"
                  ? t.compress.settingsSmart(settings.maxImageSide.toLocaleString(locale), Math.round(settings.jpegQuality * 100))
                  : t.compress.settingsRaster(settings.rasterDpi, Math.round(settings.jpegQuality * 100))}
              </p>

              {mode === "raster" && (
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={grayscale}
                    onChange={(event) => {
                      setGrayscale(event.target.checked);
                      setResult(null);
                      setStats(null);
                    }}
                    className="size-4 rounded accent-indigo-600"
                  />
                  {t.compress.grayscale}
                </label>
              )}
            </div>
          </Card>

          {mode === "raster" && (
            <Alert tone="warning">{t.compress.rasterWarning}</Alert>
          )}
        </div>
      }
      sidebar={
        result && stats ? (
          <ResultPanel result={result} onReset={reset} resetLabel={t.compress.resetLabel}>
            <div className="space-y-3 rounded-xl bg-white/70 p-3 dark:bg-slate-950/40">
              <div>
                <div className="mb-1 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span>{t.compress.before}</span>
                  <span className="tabular-nums">{formatBytes(stats.originalSize, locale)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span>{t.compress.after}</span>
                  <span className="tabular-nums">{formatBytes(stats.compressedSize, locale)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={cn("h-full rounded-full", saved > 0 ? "bg-emerald-500" : "bg-amber-500")}
                    style={{ width: `${Math.min(100, Math.max(2, (stats.compressedSize / stats.originalSize) * 100))}%` }}
                  />
                </div>
              </div>
              {stats.candidateImages > 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {stats.optimizedImages} von {stats.candidateImages} Fotos optimiert.
                </p>
              )}
              {saved <= 0 && (
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {t.compress.notSmallerTip}
                </p>
              )}
            </div>
          </ResultPanel>
        ) : (
          <PanelCard title={t.compress.panelTitle}>
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <StatLine label={t.compress.statOriginal} value={formatBytes(file.size, locale)} />
              <StatLine label={t.compress.statPages} value={preview?.pageCount ?? "–"} />
              <StatLine label={t.compress.statMode} value={mode === "smart" ? t.compress.modeSmart : t.compress.modeRaster} />
              <StatLine label={t.compress.statQuality} value={`${quality}%`} />
            </div>
            <TaskFeedback task={task} />
            <Button
              size="lg"
              fullWidth
              disabled={task.isWorking || Boolean(previewError)}
              loading={task.isWorking}
              icon={<Minimize2 className="size-5" aria-hidden="true" />}
              onClick={handleCompress}
            >
              {task.isWorking ? t.compress.working : t.compress.button}
            </Button>
          </PanelCard>
        )
      }
    />
  );
}

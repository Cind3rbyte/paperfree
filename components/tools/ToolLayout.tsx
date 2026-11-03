"use client";

import type { ReactNode } from "react";
import { CircleCheck, Download, RefreshCcw } from "lucide-react";
import { KofiButton } from "@/components/KofiButton";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { TaskState } from "@/hooks/useTaskRunner";
import { cn, downloadBlob, formatBytes } from "@/lib/utils";

export interface ResultFile {
  blob: Blob;
  fileName: string;
  details?: string;
}

/** Zweispaltiges Layout: Arbeitsfläche links, Optionen & Aktion rechts (auf Mobilgeräten untereinander). */
export function Workspace({ main, sidebar }: { main: ReactNode; sidebar: ReactNode }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0">{main}</section>
      <aside className="space-y-4 lg:sticky lg:top-24">{sidebar}</aside>
    </div>
  );
}

export function PanelCard({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("p-5", className)}>
      {title && <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-white">{title}</h2>}
      <div className="space-y-5">{children}</div>
    </Card>
  );
}

export function MainToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/70">
      {children}
    </div>
  );
}

export function TaskFeedback({ task }: { task: Pick<TaskState, "status" | "progress" | "message" | "error"> }) {
  if (task.status === "working") {
    return <ProgressBar value={task.progress} label={task.message} />;
  }
  if (task.status === "error" && task.error) {
    return (
      <Alert tone="error" title="Das hat leider nicht geklappt">
        {task.error}
      </Alert>
    );
  }
  return null;
}

export function FileNameInput({
  value,
  onChange,
  extension,
  label = "Dateiname",
}: {
  value: string;
  onChange: (value: string) => void;
  extension: string;
  label?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
      <span className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none dark:text-white"
          spellCheck={false}
        />
        <span className="border-l border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          .{extension}
        </span>
      </span>
    </label>
  );
}

export function ResultPanel({
  result,
  onReset,
  resetLabel = "Neue Datei bearbeiten",
  children,
}: {
  result: ResultFile;
  onReset: () => void;
  resetLabel?: string;
  children?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-emerald-200 dark:border-emerald-500/30">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:from-emerald-500/10 dark:to-teal-500/5">
        <div className="flex items-start gap-3">
          <CircleCheck className="mt-0.5 size-6 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white">Fertig! Deine Datei ist bereit.</p>
            <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-300" title={result.fileName}>
              {result.fileName} · {formatBytes(result.blob.size)}
            </p>
            {result.details && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{result.details}</p>}
          </div>
        </div>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-5 grid gap-2">
          <Button
            variant="success"
            size="lg"
            fullWidth
            icon={<Download className="size-5" aria-hidden="true" />}
            onClick={() => downloadBlob(result.blob, result.fileName)}
          >
            Herunterladen
          </Button>
          <Button variant="secondary" fullWidth icon={<RefreshCcw className="size-4" aria-hidden="true" />} onClick={onReset}>
            {resetLabel}
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 border-t border-emerald-100 p-4 text-center dark:border-emerald-500/20">
        <p className="text-xs text-slate-600 dark:text-slate-400">Hat dir PaperFree geholfen? Ein Kaffee hält das Projekt kostenlos.</p>
        <KofiButton size="sm" />
      </div>
    </Card>
  );
}

export function IconButton({
  label,
  onClick,
  children,
  disabled,
  tone = "default",
  className,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  tone?: "default" | "danger" | "success";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg border bg-white/95 shadow-sm backdrop-blur transition focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-900/95",
        tone === "default" &&
          "border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
        tone === "danger" &&
          "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10",
        tone === "success" &&
          "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/10",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StatLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

export function LoadedFileBar({
  file,
  pageCount,
  rendered,
  loading,
  onReplace,
}: {
  file: File;
  pageCount: number;
  rendered: number;
  loading: boolean;
  onReplace: () => void;
}) {
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-xs font-extrabold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
          PDF
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatBytes(file.size)}
            {pageCount > 0 && ` · ${pageCount} ${pageCount === 1 ? "Seite" : "Seiten"}`}
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCcw className="size-3.5" aria-hidden="true" />} onClick={onReplace}>
          Andere Datei
        </Button>
      </div>
      {loading && pageCount > 0 && (
        <ProgressBar
          className="mt-3"
          value={rendered / pageCount}
          label={`Erzeuge Vorschau … ${rendered} von ${pageCount} Seiten`}
        />
      )}
    </div>
  );
}

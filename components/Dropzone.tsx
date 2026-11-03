"use client";

import { useCallback, useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Upload } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn, matchesAccept } from "@/lib/utils";

export interface DropzoneProgress {
  value: number;
  label: string;
}

interface DropzoneProps {
  accept: readonly string[];
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title: string;
  description?: string;
  buttonLabel?: string;
  icon?: ReactNode;
  compact?: boolean;
  disabled?: boolean;
  /** Shows a progress bar while files are being read. */
  progress?: DropzoneProgress | null;
  className?: string;
}

export function Dropzone({
  accept,
  multiple = false,
  onFiles,
  title,
  description,
  buttonLabel,
  icon,
  compact = false,
  disabled = false,
  progress = null,
  className,
}: DropzoneProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const descriptionId = useId();

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || disabled) return;
      const files = Array.from(list);
      const accepted = files.filter((file) => matchesAccept(file, accept));
      const declined = files.filter((file) => !matchesAccept(file, accept)).map((file) => file.name);
      const limited = multiple ? accepted : accepted.slice(0, 1);
      setRejected(declined);
      if (limited.length > 0) onFiles(limited);
    },
    [accept, disabled, multiple, onFiles],
  );

  const isFileDrag = (event: DragEvent) => Array.from(event.dataTransfer.types).includes("Files");

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event) || disabled) return;
    event.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event) || disabled) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const acceptLabel = Array.from(
    new Set(accept.filter((rule) => rule.startsWith(".")).map((rule) => rule.slice(1).toUpperCase())),
  ).join(", ");

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={descriptionId}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={cn(
          "group relative flex h-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed text-center transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500",
          compact ? "gap-2 px-4 py-6" : "gap-4 px-6 py-14 sm:py-20",
          isDragging
            ? "scale-[1.01] border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/10"
            : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/5",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_60%)] opacity-0 transition group-hover:opacity-100"
        />
        <span
          className={cn(
            "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 transition group-hover:-translate-y-1",
            compact ? "size-10" : "size-16",
          )}
        >
          {icon ?? <Upload className={compact ? "size-5" : "size-7"} aria-hidden="true" />}
        </span>
        <div className="relative space-y-1">
          <p className={cn("font-bold text-slate-900 dark:text-white", compact ? "text-sm" : "text-xl sm:text-2xl")}>
            {isDragging ? t.dropzone.dropToAdd : title}
          </p>
          <p id={descriptionId} className={cn("text-slate-600 dark:text-slate-400", compact ? "text-xs" : "text-sm")}>
            {description ?? `${t.dropzone.orDragHere}${acceptLabel ? ` · ${acceptLabel}` : ""}`}
          </p>
        </div>
        {!compact && (
          <span className="relative inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition group-hover:bg-indigo-500 dark:bg-indigo-500">
            <Upload className="size-4" aria-hidden="true" />
            {buttonLabel ?? (multiple ? t.dropzone.selectFiles : t.dropzone.selectFile)}
          </span>
        )}
        {!compact && (
          <p className="relative text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {t.dropzone.localNote}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          accept={accept.join(",")}
          multiple={multiple}
          disabled={disabled}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {progress && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <ProgressBar value={progress.value} label={progress.label} ariaLabel={t.common.progress} />
        </div>
      )}

      {rejected.length > 0 && (
        <p role="alert" className="mt-3 text-sm text-rose-600 dark:text-rose-300">
          {t.dropzone.rejected(rejected.join(", "))}
        </p>
      )}
    </div>
  );
}

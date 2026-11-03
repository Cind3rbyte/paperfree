"use client";

import type { MouseEvent, ReactNode } from "react";
import { Check } from "lucide-react";
import type { DragItemProps } from "@/hooks/useDragReorder";
import type { PageThumbnail } from "@/lib/pdf-utils";
import { cn } from "@/lib/utils";

interface PageCardProps {
  label: string;
  thumbnail?: PageThumbnail;
  /** Angezeigte Drehung (darf über 360 hinausgehen, damit Animationen immer in Drehrichtung laufen). */
  rotation?: number;
  selected?: boolean;
  selectable?: boolean;
  dimmed?: boolean;
  /** Kleines Kennzeichen oben links (z. B. die aktuelle Position). */
  badge?: ReactNode;
  overlay?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  dragProps?: DragItemProps;
  isDragging?: boolean;
  isDragOver?: boolean;
}

/** Vorschaukarte für eine PDF-Seite – wählbar, drehbar und per Drag-and-Drop verschiebbar. */
export function PageCard({
  label,
  thumbnail,
  rotation = 0,
  selected = false,
  selectable = false,
  dimmed = false,
  badge,
  overlay,
  actions,
  footer,
  onClick,
  dragProps,
  isDragging = false,
  isDragOver = false,
}: PageCardProps) {
  const quarterTurn = Math.abs(Math.round(rotation / 90)) % 2 === 1;
  const preview = (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800/80">
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element -- lokale Blob-URL, next/image ist hier nicht anwendbar
        <img
          src={thumbnail.url}
          alt={label}
          draggable={false}
          className={cn(
            "absolute inset-0 size-full object-contain p-2 drop-shadow-md transition-transform duration-300 ease-out",
            dimmed && "opacity-30 grayscale",
          )}
          style={{ transform: `rotate(${rotation}deg) scale(${quarterTurn ? 0.8 : 1})` }}
        />
      ) : (
        <div className="absolute inset-3 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700/70" aria-hidden="true" />
      )}
      {overlay}
      {badge !== undefined && !selectable && (
        <span className="absolute left-2 top-2 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-xs font-bold text-white">{badge}</span>
      )}
      {selectable && (
        <span
          className={cn(
            "absolute left-2 top-2 flex size-6 items-center justify-center rounded-full border-2 transition",
            selected
              ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500"
              : "border-slate-300 bg-white/90 text-transparent dark:border-slate-600 dark:bg-slate-900/90",
          )}
          aria-hidden="true"
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      )}
    </div>
  );

  return (
    <div
      {...dragProps}
      className={cn(
        "group relative flex flex-col gap-2 rounded-2xl border bg-white p-2 transition dark:bg-slate-900",
        selected
          ? "border-indigo-500 ring-2 ring-indigo-500/30 dark:border-indigo-400"
          : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
        dragProps && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40",
        isDragOver && !isDragging && "border-indigo-500 ring-4 ring-indigo-500/20",
      )}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-pressed={selectable ? selected : undefined}
          aria-label={selectable ? `${label} ${selected ? "abwählen" : "auswählen"}` : label}
          className="block w-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          {preview}
        </button>
      ) : (
        preview
      )}
      {actions && (
        <div className="absolute right-3 top-3 flex flex-col gap-1 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          {actions}
        </div>
      )}
      <div className="flex min-h-6 items-center justify-between gap-2 px-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="truncate">{label}</span>
        {footer}
      </div>
    </div>
  );
}

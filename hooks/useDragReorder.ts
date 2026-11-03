"use client";

import { useCallback, useState, type DragEvent } from "react";

const DRAG_MIME = "application/x-paperfree-index";

export interface DragItemProps {
  draggable: true;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnter: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

/** Native HTML5 drag and drop for reordering lists and grids. */
export function useDragReorder(onMove: (from: number, to: number) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const reset = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  const getItemProps = useCallback(
    (index: number): DragItemProps => ({
      draggable: true,
      onDragStart: (event) => {
        setDragIndex(index);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(DRAG_MIME, String(index));
        event.dataTransfer.setData("text/plain", String(index));
      },
      onDragEnter: (event) => {
        if (!event.dataTransfer.types.includes(DRAG_MIME)) return;
        event.preventDefault();
        setOverIndex(index);
      },
      onDragOver: (event) => {
        if (!event.dataTransfer.types.includes(DRAG_MIME)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      },
      onDrop: (event) => {
        if (!event.dataTransfer.types.includes(DRAG_MIME)) return;
        event.preventDefault();
        event.stopPropagation();
        const from = Number(event.dataTransfer.getData(DRAG_MIME));
        if (Number.isInteger(from) && from !== index) onMove(from, index);
        reset();
      },
      onDragEnd: reset,
    }),
    [onMove, reset],
  );

  return { dragIndex, overIndex, getItemProps };
}

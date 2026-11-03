"use client";

import { useEffect } from "react";

/**
 * Verhindert, dass der Browser eine versehentlich neben die Dropzone gezogene Datei öffnet
 * und damit die Seite (samt aktueller Arbeit) verlässt.
 */
export function FileDropGuard() {
  useEffect(() => {
    const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes("Files");
    const prevent = (event: DragEvent) => {
      if (hasFiles(event)) event.preventDefault();
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

/**
 * Prevents the browser from opening a file that was accidentally dropped next to the dropzone,
 * which would leave the page (and lose the current work).
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

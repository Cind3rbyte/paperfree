"use client";

import { useEffect, useState } from "react";
import { renderThumbnails, type PageThumbnail } from "@/lib/pdf-utils";
import { getErrorMessage } from "@/lib/utils";

export interface PdfThumbnailState {
  pageCount: number;
  thumbnails: (PageThumbnail | undefined)[];
  rendered: number;
  loading: boolean;
  error: string | null;
}

const EMPTY_STATE: PdfThumbnailState = {
  pageCount: 0,
  thumbnails: [],
  rendered: 0,
  loading: false,
  error: null,
};

/** Lädt eine PDF lokal und rendert Seite für Seite Vorschaubilder. */
export function usePdfThumbnails(file: File | null, maxSize = 240): PdfThumbnailState {
  const [state, setState] = useState<PdfThumbnailState>(EMPTY_STATE);

  useEffect(() => {
    if (!file) {
      setState(EMPTY_STATE);
      return;
    }

    const controller = new AbortController();
    const createdUrls: string[] = [];
    setState({ ...EMPTY_STATE, loading: true });

    renderThumbnails(file, {
      maxSize,
      signal: controller.signal,
      onDocument: (pageCount) => {
        setState((current) => ({
          ...current,
          pageCount,
          thumbnails: Array.from({ length: pageCount }, () => undefined),
        }));
      },
      onThumbnail: (index, thumbnail) => {
        createdUrls.push(thumbnail.url);
        setState((current) => {
          const thumbnails = current.thumbnails.slice();
          thumbnails[index] = thumbnail;
          return { ...current, thumbnails, rendered: current.rendered + 1 };
        });
      },
    })
      .then(() => {
        if (!controller.signal.aborted) setState((current) => ({ ...current, loading: false }));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState((current) => ({ ...current, loading: false, error: getErrorMessage(error) }));
        }
      });

    return () => {
      controller.abort();
      for (const url of createdUrls) URL.revokeObjectURL(url);
    };
  }, [file, maxSize]);

  return state;
}

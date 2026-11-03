"use client";

import { useCallback, useRef, useState } from "react";
import type { ProgressHandler } from "@/lib/pdf-utils";
import { getErrorMessage } from "@/lib/utils";

export type TaskStatus = "idle" | "working" | "done" | "error";

export interface TaskState {
  status: TaskStatus;
  progress: number;
  message: string;
  error: string | null;
}

const IDLE: TaskState = { status: "idle", progress: 0, message: "", error: null };

/** Kapselt Status, Fortschritt und Fehlerbehandlung einer PDF-Operation. */
export function useTaskRunner() {
  const [state, setState] = useState<TaskState>(IDLE);
  const runId = useRef(0);

  const run = useCallback(async <T>(task: (onProgress: ProgressHandler) => Promise<T>): Promise<T | undefined> => {
    runId.current += 1;
    const currentRun = runId.current;
    setState({ status: "working", progress: 0, message: "Starte …", error: null });

    const onProgress: ProgressHandler = (fraction, message) => {
      if (runId.current !== currentRun) return;
      setState((previous) => ({
        ...previous,
        progress: Math.min(1, Math.max(previous.progress, fraction)),
        message: message ?? previous.message,
      }));
    };

    try {
      const result = await task(onProgress);
      if (runId.current === currentRun) {
        setState({ status: "done", progress: 1, message: "Fertig!", error: null });
      }
      return result;
    } catch (error) {
      if (runId.current === currentRun) {
        console.error(error);
        setState({ status: "error", progress: 0, message: "", error: getErrorMessage(error) });
      }
      return undefined;
    }
  }, []);

  const reset = useCallback(() => {
    runId.current += 1;
    setState(IDLE);
  }, []);

  return { ...state, isWorking: state.status === "working", run, reset };
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, RotateCw, Save, Trash2, Undo2 } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageCard } from "@/components/tools/PageCard";
import {
  FileNameInput,
  IconButton,
  LoadedFileBar,
  MainToolbar,
  PanelCard,
  ResultPanel,
  StatLine,
  TaskFeedback,
  Workspace,
  type ResultFile,
} from "@/components/tools/ToolLayout";
import { useDragReorder } from "@/hooks/useDragReorder";
import { usePdfThumbnails } from "@/hooks/usePdfThumbnails";
import { useTaskRunner } from "@/hooks/useTaskRunner";
import { bytesToBlob, normalizeRotation, organizePdf } from "@/lib/pdf-utils";
import { buildOutputFileName, moveItem, stripExtension } from "@/lib/utils";

const PDF_ACCEPT = ["application/pdf", ".pdf"] as const;

interface OrganizePage {
  key: string;
  sourceIndex: number;
  /** Kumulierte Drehung – wird erst beim Export normalisiert. */
  rotation: number;
  deleted: boolean;
}

function createPages(count: number): OrganizePage[] {
  return Array.from({ length: count }, (_, index) => ({
    key: `page-${index}`,
    sourceIndex: index,
    rotation: 0,
    deleted: false,
  }));
}

export function OrganizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<OrganizePage[]>([]);
  const [outputName, setOutputName] = useState("");
  const [result, setResult] = useState<ResultFile | null>(null);
  const thumbs = usePdfThumbnails(file);
  const task = useTaskRunner();
  const { reset: resetTask } = task;

  useEffect(() => {
    setPages(createPages(thumbs.pageCount));
  }, [file, thumbs.pageCount]);

  const loadFile = useCallback(
    (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setFile(next);
      setOutputName(`${stripExtension(next.name)}-bearbeitet`);
      setResult(null);
      resetTask();
    },
    [resetTask],
  );

  const reset = () => {
    setFile(null);
    setPages([]);
    setResult(null);
    resetTask();
  };

  const updatePages = useCallback((updater: (current: OrganizePage[]) => OrganizePage[]) => {
    setPages(updater);
    setResult(null);
  }, []);

  const movePage = useCallback(
    (from: number, to: number) => updatePages((current) => moveItem(current, from, to)),
    [updatePages],
  );

  const { dragIndex, overIndex, getItemProps } = useDragReorder(movePage);

  const rotatePage = (key: string, delta: number) =>
    updatePages((current) => current.map((page) => (page.key === key ? { ...page, rotation: page.rotation + delta } : page)));

  const toggleDelete = (key: string) =>
    updatePages((current) => current.map((page) => (page.key === key ? { ...page, deleted: !page.deleted } : page)));

  const rotateAll = (delta: number) =>
    updatePages((current) => current.map((page) => (page.deleted ? page : { ...page, rotation: page.rotation + delta })));

  const stats = useMemo(() => {
    const remaining = pages.filter((page) => !page.deleted);
    return {
      remaining: remaining.length,
      deleted: pages.length - remaining.length,
      rotated: remaining.filter((page) => normalizeRotation(page.rotation) !== 0).length,
      reordered: remaining.some((page, index, list) => index > 0 && page.sourceIndex < list[index - 1].sourceIndex),
    };
  }, [pages]);

  const hasChanges = stats.deleted > 0 || stats.rotated > 0 || stats.reordered;

  const handleSave = async () => {
    if (!file) return;
    setResult(null);
    const instructions = pages
      .filter((page) => !page.deleted)
      .map((page) => ({ index: page.sourceIndex, rotation: normalizeRotation(page.rotation) }));
    const bytes = await task.run((onProgress) => organizePdf(file, instructions, onProgress));
    if (bytes) {
      setResult({
        blob: bytesToBlob(bytes),
        fileName: buildOutputFileName(outputName, "bearbeitet", "pdf"),
        details: `${instructions.length} ${instructions.length === 1 ? "Seite" : "Seiten"}`,
      });
    }
  };

  if (!file) {
    return (
      <Dropzone
        accept={PDF_ACCEPT}
        onFiles={loadFile}
        title="PDF zum Organisieren auswählen"
        description="oder hierher ziehen · Seiten danach drehen, löschen und neu anordnen"
        buttonLabel="PDF auswählen"
      />
    );
  }

  return (
    <Workspace
      main={
        <div>
          <LoadedFileBar
            file={file}
            pageCount={thumbs.pageCount}
            rendered={thumbs.rendered}
            loading={thumbs.loading}
            onReplace={reset}
          />
          {thumbs.error ? (
            <Alert tone="error" title="PDF konnte nicht geladen werden">
              {thumbs.error}
            </Alert>
          ) : (
            <>
              <MainToolbar>
                <Button variant="ghost" size="sm" icon={<RotateCcw className="size-4" aria-hidden="true" />} onClick={() => rotateAll(-90)}>
                  Alle links drehen
                </Button>
                <Button variant="ghost" size="sm" icon={<RotateCw className="size-4" aria-hidden="true" />} onClick={() => rotateAll(90)}>
                  Alle rechts drehen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  icon={<Undo2 className="size-4" aria-hidden="true" />}
                  disabled={!hasChanges}
                  onClick={() => updatePages(() => createPages(thumbs.pageCount))}
                >
                  Alles zurücksetzen
                </Button>
              </MainToolbar>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                Fahre über eine Seite, um sie zu drehen oder zu löschen. Ziehe Seiten, um die Reihenfolge zu ändern.
              </p>
              <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {pages.map((page, position) => (
                  <li key={page.key}>
                    <PageCard
                      label={`Seite ${page.sourceIndex + 1}`}
                      badge={position + 1}
                      thumbnail={thumbs.thumbnails[page.sourceIndex]}
                      rotation={page.rotation}
                      dimmed={page.deleted}
                      dragProps={getItemProps(position)}
                      isDragging={dragIndex === position}
                      isDragOver={overIndex === position}
                      overlay={
                        page.deleted ? (
                          <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg bg-rose-600/90 px-2 py-1 text-center text-xs font-bold text-white">
                            Wird entfernt
                          </span>
                        ) : null
                      }
                      actions={
                        page.deleted ? (
                          <IconButton label={`Seite ${page.sourceIndex + 1} wiederherstellen`} tone="success" onClick={() => toggleDelete(page.key)}>
                            <Undo2 className="size-4" aria-hidden="true" />
                          </IconButton>
                        ) : (
                          <>
                            <IconButton label={`Seite ${page.sourceIndex + 1} nach links drehen`} onClick={() => rotatePage(page.key, -90)}>
                              <RotateCcw className="size-4" aria-hidden="true" />
                            </IconButton>
                            <IconButton label={`Seite ${page.sourceIndex + 1} nach rechts drehen`} onClick={() => rotatePage(page.key, 90)}>
                              <RotateCw className="size-4" aria-hidden="true" />
                            </IconButton>
                            <IconButton label={`Seite ${page.sourceIndex + 1} löschen`} tone="danger" onClick={() => toggleDelete(page.key)}>
                              <Trash2 className="size-4" aria-hidden="true" />
                            </IconButton>
                          </>
                        )
                      }
                      footer={
                        <span className="flex gap-1">
                          <IconButton
                            label="Nach vorne verschieben"
                            className="size-6"
                            disabled={position === 0}
                            onClick={() => movePage(position, position - 1)}
                          >
                            <ArrowLeft className="size-3.5" aria-hidden="true" />
                          </IconButton>
                          <IconButton
                            label="Nach hinten verschieben"
                            className="size-6"
                            disabled={position === pages.length - 1}
                            onClick={() => movePage(position, position + 1)}
                          >
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                          </IconButton>
                        </span>
                      }
                    />
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      }
      sidebar={
        result ? (
          <ResultPanel result={result} onReset={reset} resetLabel="Andere PDF bearbeiten" />
        ) : (
          <PanelCard title="Änderungen">
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <StatLine label="Seiten im Ergebnis" value={`${stats.remaining} / ${pages.length}`} />
              <StatLine label="Gedreht" value={stats.rotated} />
              <StatLine label="Gelöscht" value={stats.deleted} />
              <StatLine label="Reihenfolge geändert" value={stats.reordered ? "Ja" : "Nein"} />
            </div>
            {stats.deleted > 0 && (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Undo2 className="size-4" aria-hidden="true" />}
                onClick={() => updatePages((current) => current.map((page) => ({ ...page, deleted: false })))}
              >
                Gelöschte Seiten wiederherstellen
              </Button>
            )}
            <FileNameInput value={outputName} onChange={setOutputName} extension="pdf" />
            {stats.remaining === 0 && pages.length > 0 && (
              <Alert tone="warning">Mindestens eine Seite muss erhalten bleiben.</Alert>
            )}
            <TaskFeedback task={task} />
            <Button
              size="lg"
              fullWidth
              disabled={stats.remaining === 0 || task.isWorking || thumbs.pageCount === 0}
              loading={task.isWorking}
              icon={<Save className="size-5" aria-hidden="true" />}
              onClick={handleSave}
            >
              {task.isWorking ? "Wird gespeichert …" : "Änderungen anwenden"}
            </Button>
          </PanelCard>
        )
      }
    />
  );
}

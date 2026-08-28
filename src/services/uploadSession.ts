import type { BatchProgress, UploadIssue } from "@/types/upload";
import { cancelBatch, getBatchIssues, getBatchProgress, isTerminalBatch, uploadBatch, validateZipFile, watchBatch } from "./uploadService";

export type UploadPhase = "idle" | "uploading" | "processing" | "complete" | "failed" | "cancelled";

export interface UploadFileInfo {
  name: string;
  size: number;
}

export interface UploadSessionState {
  phase: UploadPhase;
  file?: UploadFileInfo;
  transferPercent: number;
  batch?: BatchProgress;
  error?: string;
  issues: UploadIssue[];
}

interface StoredUpload {
  batchId: string;
  file: UploadFileInfo;
}

const STORAGE_KEY = "caresense.active-upload.v1";
const listeners = new Set<() => void>();
let state: UploadSessionState = { phase: "idle", transferPercent: 0, issues: [] };
let stopWatching: (() => void) | undefined;
let restored = false;
let finalizingBatchId: string | undefined;
let uploadController: AbortController | undefined;

function emit(next: UploadSessionState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function update(change: Partial<UploadSessionState>): void {
  emit({ ...state, ...change });
}

function remember(batchId: string, file: UploadFileInfo): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ batchId, file } satisfies StoredUpload));
}

function readRemembered(): StoredUpload | undefined {
  if (typeof window === "undefined") return undefined;
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as Partial<StoredUpload>;
    if (typeof parsed.batchId !== "string" || typeof parsed.file?.name !== "string" || typeof parsed.file.size !== "number") return undefined;
    return parsed as StoredUpload;
  } catch {
    return undefined;
  }
}

function clearRemembered(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}

function clearMissingBatch(cause: unknown): boolean {
  if (!(cause instanceof Error) || cause.message !== "Batch not found") return false;
  stopWatching?.();
  stopWatching = undefined;
  clearRemembered();
  emit({ phase: "idle", transferPercent: 0, issues: [] });
  return true;
}

async function finish(batch: BatchProgress): Promise<void> {
  if (finalizingBatchId === batch.batch_id) return;
  finalizingBatchId = batch.batch_id;
  update({
    batch,
    phase: batch.processing_state === "CANCELLED" ? "cancelled" : batch.processing_state === "FAILED" ? "failed" : "complete",
    error: batch.processing_state === "FAILED" ? batch.failure_reason ?? "The batch could not be processed." : undefined,
  });
  try {
    const issues = await getBatchIssues(batch.batch_id);
    update({ issues });
    if (batch.processing_state === "FAILED") {
      console.error(`[upload] batch ${batch.batch_id} failed: ${batch.failure_reason ?? "unknown reason"}`, {
        batch,
        issues,
      });
    }
  } catch (cause) {
    if (batch.processing_state === "FAILED") {
      update({ error: cause instanceof Error ? cause.message : "Could not retrieve batch errors." });
      console.error(`[upload] batch ${batch.batch_id} failed and issue details could not be loaded`, cause);
    }
  } finally {
    finalizingBatchId = undefined;
  }
}

function beginWatching(batchId: string): void {
  stopWatching?.();
  stopWatching = watchBatch(
    batchId,
    (batch) => {
      update({ batch, phase: isTerminalBatch(batch) ? state.phase : "processing", error: undefined });
      if (isTerminalBatch(batch)) void finish(batch);
    },
    (cause) => {
      if (!clearMissingBatch(cause)) update({ error: `Live status interrupted: ${cause.message}` });
    },
  );
}

export function subscribeUploadSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUploadSession(): UploadSessionState {
  return state;
}

export async function restoreUploadSession(): Promise<void> {
  if (restored) return;
  restored = true;
  const saved = readRemembered();
  if (!saved || state.phase !== "idle") return;
  update({ phase: "processing", file: saved.file, transferPercent: 100, error: undefined, issues: [] });
  try {
    const batch = await getBatchProgress(saved.batchId);
    update({ batch });
    if (isTerminalBatch(batch)) await finish(batch);
    else beginWatching(batch.batch_id);
  } catch (cause) {
    if (!clearMissingBatch(cause)) {
      update({ phase: "failed", error: cause instanceof Error ? cause.message : "Could not restore the upload status." });
    }
  }
}

export async function startUploadSession(file: File): Promise<void> {
  stopWatching?.();
  stopWatching = undefined;
  finalizingBatchId = undefined;
  clearRemembered();
  const fileInfo = { name: file.name, size: file.size };
  emit({ phase: "uploading", file: fileInfo, transferPercent: 0, issues: [] });
  try {
    await validateZipFile(file);
    uploadController = new AbortController();
    const batch = await uploadBatch(file, (transferPercent) => update({ transferPercent }), uploadController.signal);
    uploadController = undefined;
    remember(batch.batch_id, fileInfo);
    update({ batch, transferPercent: 100 });
    if (isTerminalBatch(batch)) await finish(batch);
    else {
      update({ phase: "processing" });
      beginWatching(batch.batch_id);
    }
  } catch (cause) {
    uploadController = undefined;
    if (state.phase === "cancelled") return;
    update({ phase: "failed", error: cause instanceof Error ? cause.message : "The upload failed." });
  }
}

export async function cancelUploadSession(): Promise<void> {
  if (state.phase === "uploading") {
    emit({ ...state, phase: "cancelled", error: undefined });
    uploadController?.abort();
    uploadController = undefined;
    clearRemembered();
    return;
  }
  if (state.phase !== "processing" || !state.batch) return;
  try {
    const batch = await cancelBatch(state.batch.batch_id);
    stopWatching?.();
    stopWatching = undefined;
    clearRemembered();
    update({ batch, phase: "cancelled", error: undefined });
  } catch (cause) {
    update({ error: cause instanceof Error ? cause.message : "Could not stop this batch." });
  }
}

export function resetUploadSession(): void {
  uploadController?.abort();
  uploadController = undefined;
  stopWatching?.();
  stopWatching = undefined;
  finalizingBatchId = undefined;
  clearRemembered();
  emit({ phase: "idle", transferPercent: 0, issues: [] });
}

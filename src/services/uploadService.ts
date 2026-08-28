import type { BatchProgress, UploadIssue } from "@/types/upload";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/u, "") ?? "";
export const MAX_UPLOAD_BYTES = Number(import.meta.env.VITE_MAX_UPLOAD_BYTES ?? 209_715_200);
const TERMINAL_STATES = new Set(["COMPLETED", "COMPLETED_WITH_FAILURES", "FAILED", "CANCELLED"]);

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

async function responseError(response: Response): Promise<Error> {
  const body = await response.json().catch(() => undefined) as { error?: string } | undefined;
  return new Error(body?.error ?? `Request failed (${response.status})`);
}

export function isTerminalBatch(batch: BatchProgress): boolean {
  return TERMINAL_STATES.has(batch.processing_state);
}

export async function validateZipFile(file: File): Promise<void> {
  if (!file.name.toLowerCase().endsWith(".zip")) throw new Error("Choose a ZIP archive containing the recordings and metadata.");
  if (file.size === 0) throw new Error("The selected ZIP file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`The ZIP is larger than the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB upload limit.`);
  }
  const signature = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const validSignature = signature[0] === 0x50 && signature[1] === 0x4b &&
    ((signature[2] === 0x03 && signature[3] === 0x04) ||
      (signature[2] === 0x05 && signature[3] === 0x06) ||
      (signature[2] === 0x07 && signature[3] === 0x08));
  if (!validSignature) throw new Error("This file has a .zip name but is not a valid ZIP archive.");
}

export function uploadBatch(file: File, onProgress: (percent: number) => void, signal?: AbortSignal): Promise<BatchProgress> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const form = new FormData();
    form.append("archive", file);
    request.open("POST", apiUrl("/api/v1/upload-batches"));
    request.responseType = "json";
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    });
    request.addEventListener("load", () => {
      const body = request.response as (BatchProgress & { error?: string }) | null;
      if (request.status >= 200 && request.status < 300 && body) {
        onProgress(100);
        resolve(body);
      } else reject(new Error(body?.error ?? `Upload failed (${request.status})`));
    });
    request.addEventListener("error", () => reject(new Error("Could not reach the CareSense API.")));
    request.addEventListener("abort", () => reject(new Error("Upload cancelled.")));
    if (signal?.aborted) request.abort();
    else signal?.addEventListener("abort", () => request.abort(), { once: true });
    request.send(form);
  });
}

export async function cancelBatch(batchId: string): Promise<BatchProgress> {
  const response = await fetch(apiUrl(`/api/v1/upload-batches/${batchId}/cancel`), { method: "POST" });
  if (!response.ok) throw await responseError(response);
  return response.json() as Promise<BatchProgress>;
}

export async function getBatchProgress(batchId: string): Promise<BatchProgress> {
  const response = await fetch(apiUrl(`/api/v1/upload-batches/${batchId}`));
  if (!response.ok) throw await responseError(response);
  return response.json() as Promise<BatchProgress>;
}

export function watchBatch(
  batchId: string,
  onUpdate: (batch: BatchProgress) => void,
  onError: (error: Error) => void,
): () => void {
  let stopped = false;
  let pollTimer: ReturnType<typeof setTimeout> | undefined;
  const events = new EventSource(apiUrl(`/api/v1/upload-batches/${batchId}/events`));

  const accept = (batch: BatchProgress) => {
    if (stopped) return;
    onUpdate(batch);
    if (isTerminalBatch(batch)) {
      stopped = true;
      events.close();
      if (pollTimer) clearTimeout(pollTimer);
    }
  };

  const poll = async () => {
    if (stopped) return;
    try {
      accept(await getBatchProgress(batchId));
      if (!stopped) pollTimer = setTimeout(() => void poll(), 1_500);
    } catch (cause) {
      onError(cause instanceof Error ? cause : new Error("Live status is unavailable."));
    }
  };

  events.addEventListener("batch.progress", (event) => {
    try {
      accept(JSON.parse((event as MessageEvent<string>).data) as BatchProgress);
    } catch {
      onError(new Error("The server returned an invalid progress update."));
    }
  });
  events.onerror = () => {
    if (stopped) return;
    events.close();
    void poll();
  };

  return () => {
    stopped = true;
    events.close();
    if (pollTimer) clearTimeout(pollTimer);
  };
}

export async function getBatchIssues(batchId: string): Promise<UploadIssue[]> {
  const [failedResponse, stagingResponse] = await Promise.all([
    fetch(apiUrl(`/api/v1/upload-batches/${batchId}/failed-calls`)),
    fetch(apiUrl(`/api/v1/upload-batches/${batchId}/staging-errors`)),
  ]);
  if (!failedResponse.ok) throw await responseError(failedResponse);
  if (!stagingResponse.ok) throw await responseError(stagingResponse);
  const failed = await failedResponse.json() as { failed_calls: Array<Record<string, unknown>> };
  const staging = await stagingResponse.json() as { errors: Array<Record<string, unknown>> };
  const failedIssues = failed.failed_calls.map((item) => ({
      id: String(item.id ?? ""), filename: String(item.filename ?? "Unknown file"),
      reason: String(item.failure_reason ?? "FAILED"), details: item.details,
    }));
  const filenames = new Set(failedIssues.map((item) => item.filename));
  const stagingIssues = staging.errors.map((item) => ({
      id: String(item.id ?? ""),
      filename: String(item.audio_filename ?? item.metadata_filename ?? item.base_filename ?? "Unknown file"),
      reason: String(item.pairing_status ?? "INVALID_FILE"), details: item.validation_errors,
    })).filter((item) => !filenames.has(item.filename));
  return [...failedIssues, ...stagingIssues];
}

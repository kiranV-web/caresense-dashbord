import type { Id, ToneKey } from "./common";

export type BatchStatus = "analysing" | "complete" | "failed";

export interface UploadBatch {
  id: Id;
  name: string;
  whenLabel: string;
  percent: number;
  status: BatchStatus;
  statusLabel: string;
  tone: ToneKey;
}

export type ProcessingStepState = "done" | "current" | "pending" | "failed";

export interface ProcessingStep {
  label: string;
  state: ProcessingStepState;
}

export interface ActiveUpload {
  fileName: string;
  percent: number;
  percentLabel?: string;
  detailLabel: string;
  steps: ProcessingStep[];
  batch?: BatchProgress;
}

export interface ProcessCounter {
  queued?: number;
  active?: number;
  completed?: number;
  uploaded?: number;
  processed?: number;
  failed: number;
  total: number;
}

export interface BatchProgress {
  batch_id: string;
  original_filename: string;
  processing_state: string;
  ingestion_state: string;
  total_entries: number;
  total_calls: number;
  uploaded_calls: number;
  invalid_pairs: number;
  failed_calls: number;
  ignored_files: number;
  failure_reason: string | null;
  failure_details: unknown;
  ingestion: ProcessCounter;
  transcription: ProcessCounter;
  analysis: ProcessCounter;
  textual_tone: ProcessCounter;
  recurrence: ProcessCounter;
  processing_percentage: number;
}

export interface UploadIssue {
  id?: string;
  filename: string;
  reason: string;
  details?: unknown;
}

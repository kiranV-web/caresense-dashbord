import { useEffect, useMemo, useSyncExternalStore } from "react";
import styled from "styled-components";
import { AlertCircle, CheckCircle2, RotateCcw, Square } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Dropzone } from "@/components/upload/Dropzone";
import { ProcessingSteps } from "@/components/upload/ProcessingSteps";
import { isTerminalBatch, MAX_UPLOAD_BYTES } from "@/services/uploadService";
import {
  getUploadSession,
  cancelUploadSession,
  resetUploadSession,
  restoreUploadSession,
  startUploadSession,
  subscribeUploadSession,
  type UploadFileInfo,
  type UploadPhase,
} from "@/services/uploadSession";
import type { ActiveUpload, BatchProgress, ProcessingStep } from "@/types/upload";

const Stack = styled.div`
  max-width: 880px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;
const CardTitle = styled.div`
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 22px;
`;
const Notice = styled.div<{ $tone: "error" | "success" | "warning" }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px 17px;
  border-radius: ${({ theme }) => theme.radii.panelLg};
  background: ${({ $tone, theme }) => $tone === "error" ? theme.colors.chip.redSoft : $tone === "warning" ? theme.colors.chip.amber.bg : theme.colors.chip.green.bg};
  color: ${({ $tone, theme }) => $tone === "error" ? theme.colors.chip.red.fg : $tone === "warning" ? theme.colors.chip.amber.fg : theme.colors.chip.green.fg};
  svg { flex: none; margin-top: 1px; }
  strong { display: block; font-size: 13.5px; }
  p { margin: 3px 0 0; font-size: 12.5px; font-weight: 600; line-height: 1.5; }
`;
const ResultHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 14px;
`;
const ResetButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border-radius: ${({ theme }) => theme.radii.pillLg};
  background: ${({ theme }) => theme.colors.surface.muted};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 700;
  border: 1px solid transparent;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
    border-color: ${({ theme }) => theme.colors.line.input};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0) scale(0.97);
  }
`;
const KillButton = styled(ResetButton)`
  background: ${({ theme }) => theme.colors.chip.redSoft};
  color: ${({ theme }) => theme.colors.chip.red.fg};

  &:hover {
    background: ${({ theme }) => theme.colors.chip.red.bg};
    border-color: ${({ theme }) => theme.colors.pastel.red};
  }
`;
const IssueList = styled.div`
  margin-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.line.hairline};
`;
const IssueRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 12px 2px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.line.hairline};
  strong { overflow: hidden; text-overflow: ellipsis; font-size: 12.5px; }
  span { color: ${({ theme }) => theme.colors.chip.red.fg}; font-size: 11.5px; font-weight: 800; }
`;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / 1024 / 1024)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function currentStage(batch: BatchProgress): number {
  if (batch.processing_state === "FAILED") {
    if (batch.ingestion_state === "FAILED") return 1;
    if (batch.transcription.failed > 0 && (batch.analysis.completed ?? 0) === 0) return 2;
    if (batch.analysis.failed > 0 && (batch.recurrence.completed ?? 0) === 0) return 3;
    if (batch.recurrence.failed > 0) return 4;
    return 1;
  }
  if (batch.processing_state === "UPLOADED" || batch.processing_state === "INGESTING") return 1;
  if (batch.processing_state === "TRANSCRIBING") return 2;
  if (batch.processing_state === "ANALYZING") return 3;
  if (batch.processing_state === "LINKING_RECURRING_CALLS") return 4;
  return 5;
}

function batchFailureMessage(batch: BatchProgress): string {
  if (batch.failure_details && typeof batch.failure_details === "object" &&
      "message" in batch.failure_details && typeof batch.failure_details.message === "string") {
    return batch.failure_details.message;
  }
  return batch.failure_reason ?? "The batch could not be processed.";
}

function processingDetail(batch: BatchProgress): string {
  if (batch.processing_state === "CANCELLED") return "Processing stopped by the user.";
  if (batch.processing_state === "UPLOADED") return "ZIP received · waiting for validation to begin";
  if (batch.processing_state === "INGESTING") return `${batch.ingestion.processed ?? 0} of ${batch.ingestion.total} recordings validated · ${batch.ingestion.uploaded ?? 0} accepted`;
  if (batch.processing_state === "TRANSCRIBING") return `${batch.transcription.completed ?? 0} of ${batch.transcription.total} recordings transcribed · ${batch.transcription.active ?? 0} active · ${batch.transcription.queued ?? 0} queued`;
  if (batch.processing_state === "ANALYZING") return `${batch.analysis.completed ?? 0} of ${batch.analysis.total} calls analysed · ${batch.analysis.active ?? 0} active · ${batch.analysis.queued ?? 0} queued`;
  if (batch.processing_state === "LINKING_RECURRING_CALLS") return `${batch.recurrence.completed ?? 0} of ${batch.recurrence.total} calls checked for recurrence · ${batch.recurrence.active ?? 0} active`;
  if (batch.processing_state === "FAILED") return batchFailureMessage(batch);
  const rejected = Math.max(batch.failed_calls, batch.invalid_pairs);
  return `${batch.uploaded_calls} calls accepted and processed${rejected > 0 ? ` · ${rejected} rejected` : ""}`;
}

function buildUploadView(file: UploadFileInfo, phase: UploadPhase, transferPercent: number, batch: BatchProgress | undefined): ActiveUpload {
  const labels = ["Upload", "Validate", "Transcribe", "Analyse", "Recurrence"];
  let steps: ProcessingStep[];
  if (!batch) {
    steps = labels.map((label, index) => ({
      label, state: index === 0 ? (phase === "failed" || phase === "cancelled" ? "failed" : "current") : "pending"
    }));
  } else if (batch.processing_state === "FAILED" || batch.processing_state === "CANCELLED") {
    const failedAt = Math.min(currentStage(batch), labels.length - 1);
    steps = labels.map((label, index) => ({ label, state: index < failedAt ? "done" : index === failedAt ? "failed" : "pending" }));
  } else if (isTerminalBatch(batch)) {
    steps = labels.map((label) => ({ label, state: "done" }));
  } else {
    const active = currentStage(batch);
    steps = labels.map((label, index) => ({ label, state: index < active ? "done" : index === active ? "current" : "pending" }));
  }
  return {
    fileName: file.name,
    percent: batch ? batch.processing_percentage : transferPercent,
    percentLabel: batch ? `${batch.processing_percentage}% processed` : `${transferPercent}% uploaded`,
    detailLabel: batch ? processingDetail(batch) : `${formatBytes(file.size)} ZIP · transferring to CareSense`,
    steps,
    batch,
  };
}

export function UploadPage() {
  const session = useSyncExternalStore(subscribeUploadSession, getUploadSession, getUploadSession);
  const { phase, file, transferPercent, batch, error, issues } = session;

  useEffect(() => { void restoreUploadSession(); }, []);
  const activeUpload = useMemo(() => file ? buildUploadView(file, phase, transferPercent, batch) : undefined, [batch, file, phase, transferPercent]);

  const busy = phase === "uploading" || phase === "processing";
  const hasWarnings = phase === "complete" && issues.length > 0;

  return (
    <Stack>
      <Card padding="wide">
        <Dropzone onFileSelected={(selected) => void startUploadSession(selected)} disabled={busy} maxSizeLabel={`${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB`} />
      </Card>

      {error && <Notice $tone="error" role="alert"><AlertCircle size={18} /><div><strong>Upload needs attention</strong><p>{error}</p></div></Notice>}

      {activeUpload && (
        <Card padding="wide">
          <ResultHead>
            {busy && <KillButton type="button" onClick={() => {
              if (window.confirm("Stop this upload and all remaining processing for the batch?")) void cancelUploadSession();
            }}><Square size={13} fill="currentColor" /> Stop processing</KillButton>}
            {!busy && <ResetButton type="button" onClick={resetUploadSession}><RotateCcw size={14} /> Upload another ZIP</ResetButton>}
          </ResultHead>
          <ProcessingSteps upload={activeUpload} />
        </Card>
      )}

      {phase === "complete" && (
        <Card padding="wide">
          <Notice $tone={hasWarnings ? "warning" : "success"}><CheckCircle2 size={18} /><div><strong>{hasWarnings ? "Batch completed with excluded files" : "Batch completed"}</strong><p>{hasWarnings ? `${issues.length} file issues were recorded. Valid calls continued processing.` : "All accepted recordings completed the processing queue."}</p></div></Notice>
          {issues.length > 0 && <IssueList>{issues.map((issue, index) => <IssueRow key={issue.id || `${issue.filename}-${index}`}><strong>{issue.filename}</strong><span>{issue.reason.replaceAll("_", " ")}</span></IssueRow>)}</IssueList>}
        </Card>
      )}

      {phase === "cancelled" && (
        <Notice $tone="warning"><Square size={16} fill="currentColor" /><div><strong>Processing stopped</strong><p>No remaining calls in this batch will be transcribed or analysed.</p></div></Notice>
      )}

      {phase === "failed" && issues.length > 0 && (
        <Card padding="wide"><CardTitle>Files with errors</CardTitle><IssueList>{issues.map((issue, index) => <IssueRow key={issue.id || `${issue.filename}-${index}`}><strong>{issue.filename}</strong><span>{issue.reason.replaceAll("_", " ")}</span></IssueRow>)}</IssueList></Card>
      )}
    </Stack>
  );
}

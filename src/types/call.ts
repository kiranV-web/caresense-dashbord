import type { Id, IsoDateString, ToneKey } from "./common";

export type CallStatus = "resolved" | "resolved_but_improve_quality" | "recurring" | "recurrence-resolved" | "unresolved" | "dropped" | "requires-review" | "analysis-failed";

export interface CustomerProblem {
  summary: string;
  category: string;
  requestedOutcome: string;
  evidence: string;
}

export type EtiquetteRuleStatus = "pass" | "fail" | "n/a";

export interface EtiquetteRuleResult {
  id: Id;
  label: string;
  status: EtiquetteRuleStatus;
  /** Human-readable note shown next to the rule, e.g. "Passed" / "Failed". */
  note?: string;
}

/** A coloured span over the sentiment waveform, expressed as a 0..1 fraction of call duration. */
export interface SentimentSpan {
  start: number;
  end: number;
  tone: ToneKey;
  tooltip: string;
}

export interface CallSummary {
  kind?: "call" | "recurring-group";
  groupId?: Id;
  callCount?: number;
  groupCalls?: Array<{
    sequenceNumber: number;
    id: Id;
    title: string;
    status: CallStatus;
  }>;
  id: Id;
  externalId: string;
  title: string;
  agentName: string;
  agentId: Id;
  customerName: string;
  customerRef: string;
  durationSeconds: number;
  status: CallStatus;
  /** Raw manager-attention flag, independent of `status` — a call can need
   * attention while its status pill shows something else (e.g. Dropped). */
  needsManagerAttention: boolean;
  /** Backend call_statuses includes RUDE — the analysis pipeline forces
   * empathy to fail on these, so this is a reliable signal independent of
   * per-segment tone. Always false for recurring-group items. */
  isRude: boolean;
  etiquette: EtiquetteRuleResult[];
  sentimentSpans: SentimentSpan[];
  /** Seeds the deterministic bar-height pattern behind the sentiment waveform. */
  waveSeed: number;
  avatarInitials: string;
  avatarTintIndex: number;
  audioUrl: string;
  startedAt: IsoDateString;
}

export interface RecurringGroupTimelineCall {
  sequenceNumber: number;
  id: Id;
  externalId: string;
  startedAt: IsoDateString;
  title: string;
  summary: string;
  verdict: string;
  agentName: string;
  durationSeconds: number;
  status: CallStatus;
}

export interface RecurringGroupDetail {
  id: Id;
  title: string;
  summary: string;
  verdict: string;
  recommendedAction: string;
  issueLabel: string;
  customerName: string;
  customerRef: string;
  lookbackDays: number;
  status: CallStatus;
  calls: RecurringGroupTimelineCall[];
}

export interface TranscriptLine {
  timestampLabel: string;
  speaker: "agent" | "customer";
  text: string;
  /** Only set when this line's tone is one of the app's recognised emotions
   * (see RECOGNIZED_TONE_MAP in services/mappers.ts) — either speaker. */
  emotion?: { label: string; tone: ToneKey };
}

export interface SentimentChipEvent {
  timestampLabel: string;
  label: string;
  tone: ToneKey;
}

export interface RecurringOccurrence {
  label: string;
  dateLabel: string;
  durationLabel: string;
  tone: ToneKey;
}

export interface RuleEvidence {
  ruleId: Id;
  heading: string;
  customerQuote: string;
  agentQuote: string;
  observation: string;
}

export interface CallDetail extends CallSummary {
  etiquetteApplicable: boolean;
  callNumber: string;
  transcript: TranscriptLine[];
  sentimentEvents: SentimentChipEvent[];
  aiSummary: string;
  verdict: string;
  qualityFeedback?: string;
  customerProblem?: CustomerProblem;
  ruleEvidence?: RuleEvidence;
  recurringIssue?: {
    countLabel: string;
    occurrences: RecurringOccurrence[];
  };
  /** Set when processing stopped before analysis could run (transcription,
   * analysis or recurrence-linking failure) — the raw "<CODE>: <detail>"
   * reason recorded by whichever stage failed. */
  failureReason?: string;
}

export interface CallsFilter {
  status?: CallStatus | "attention";
  agentId?: Id;
  device?: string;
  search?: string;
}

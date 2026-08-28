import type { ToneKey } from "@/types/common";
import type {
  CallDetail,
  CallStatus,
  CallSummary,
  RecurringGroupDetail,
  EtiquetteRuleResult,
  RecurringOccurrence,
  SentimentChipEvent,
  SentimentSpan,
  TranscriptLine,
} from "@/types/call";
import type {
  BackendCallDetail,
  BackendCallListItem,
  BackendCallStatus,
  BackendRecurringGroupDetail,
  BackendRecurringGroupListItem,
  BackendRecurringGroup,
  BackendRules,
  BackendSegment,
  BackendTextualTone,
} from "./backendTypes";
import { displayName, humanizeEnum, initialsFromName, seedFromId } from "@/utils/identity";
import { formatDurationShort } from "@/utils/formatters";

function num(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

// The sentiment-chip row (seek markers below the Call detail player) only
// ever shows these tones, for either speaker, so the skip-to list stays
// high-signal. Every other backend tone (NEUTRAL, CALM, PLEASANT, HAPPY,
// UNKNOWN) is intentionally left off it. The waveform bars, by contrast,
// use the full TRANSCRIPT_TONE_MAP below — see spansFromSegments.
const RECOGNIZED_TONE_MAP: Partial<Record<BackendTextualTone, { label: string; tone: ToneKey }>> = {
  SATISFIED: { label: "Satisfied", tone: "positive" },
  IRRITATED: { label: "Irritated", tone: "attention" },
  DISTRESSED: { label: "Irritated", tone: "attention" },
  ANGRY: { label: "Rude", tone: "critical" },
  RUDE: { label: "Rude", tone: "critical" },
};

// The transcript, by contrast, tags every line with whatever it actually
// is — full fidelity, one label per backend tone (not collapsed). UNKNOWN
// is the one exception: it means the model couldn't classify the line, not
// an emotion, so it's left untagged like a normal neutral line.
const TRANSCRIPT_TONE_MAP: Partial<Record<BackendTextualTone, { label: string; tone: ToneKey }>> = {
  NEUTRAL: { label: "Neutral", tone: "mild" },
  CALM: { label: "Calm", tone: "mild" },
  PLEASANT: { label: "Pleasant", tone: "positive" },
  HAPPY: { label: "Happy", tone: "positive" },
  SATISFIED: { label: "Satisfied", tone: "positive" },
  IRRITATED: { label: "Irritated", tone: "attention" },
  DISTRESSED: { label: "Distressed", tone: "attention" },
  ANGRY: { label: "Angry", tone: "critical" },
  RUDE: { label: "Rude", tone: "critical" },
};

type Speaker = "agent" | "customer";
type ToneMap = Partial<Record<BackendTextualTone, { label: string; tone: ToneKey }>>;

interface ToneRun {
  speaker: Speaker;
  label: string;
  tone: ToneKey;
  startSeconds: number;
  endSeconds: number;
}

/**
 * Walks every segment (both speakers) against the given tone map and groups
 * consecutive ones that share the same speaker AND the same tone into a
 * single "run". Two segments only merge when nothing breaks the run between
 * them — a non-qualifying segment resets it, and so does the speaker
 * changing, so an agent's rude turn is never conflated with a customer's.
 *
 * This intentionally does NOT dedupe against tones seen earlier in the
 * call — the same tone reappearing after a real gap is a new, distinct
 * moment and gets its own marker, so every place the mood actually changes
 * (including changing back to something seen before) is represented.
 */
function toneRuns(segments: BackendSegment[], toneMap: ToneMap): ToneRun[] {
  const runs: ToneRun[] = [];
  let previousKey: string | undefined;
  for (const segment of segments) {
    const speaker: Speaker = segment.speaker_role === "AGENT" ? "agent" : "customer";
    const entry = toneMap[segment.textual_tone];
    if (!entry) {
      previousKey = undefined;
      continue;
    }
    const start = num(segment.start_seconds);
    const end = num(segment.end_seconds);
    const key = `${speaker}:${entry.label}`;
    if (key === previousKey) {
      runs[runs.length - 1]!.endSeconds = end;
    } else {
      runs.push({ speaker, label: entry.label, tone: entry.tone, startSeconds: start, endSeconds: end });
    }
    previousKey = key;
  }
  return runs;
}

/**
 * The status pill is derived from
 * call_statuses, needs_manager_attention and resolution_status, in that
 * priority order. DROPPED is an explicit outcome and always remains Dropped;
 * otherwise a recurring-but-resolved call still reads as Recurring
 * (matching what call_statuses is actually flagging for review).
 */
export function callStatusFromBackend(
  resolutionStatus: string,
  callStatuses: BackendCallStatus[],
  needsManagerAttention: boolean,
): CallStatus {
  if (resolutionStatus === "DROPPED") return "dropped";
  if (callStatuses.includes("RECURRING")) return "recurring";
  if (resolutionStatus === "RESOLVED_BUT_IMPROVE_QUALITY") return "resolved_but_improve_quality";
  if (needsManagerAttention) return "requires-review";
  if (resolutionStatus === "RESOLVED") return "resolved";
  return "unresolved";
}

type BooleanRuleKey = Exclude<keyof BackendRules, "showed_empathy_applicable" | "showed_empathy_reason">;

const RULE_LABELS: { key: BooleanRuleKey; label: string }[] = [
  { key: "greeted_customer", label: "Greeting" },
  { key: "introduced_self", label: "Introduction" },
  { key: "showed_empathy", label: "Empathy" },
  { key: "offered_help", label: "Offered help" },
  { key: "provided_clear_guidance", label: "Clear guidance" },
  { key: "thanked_customer", label: "Thanked customer" },
  { key: "wished_customer_good_day", label: "Closing" },
];

export function etiquetteFromRules(rules: BackendRules | null): EtiquetteRuleResult[] {
  if (!rules) return [];
  return RULE_LABELS.map(({ key, label }) => ({
    id: key,
    label,
    status: key === "showed_empathy" && !rules.showed_empathy_applicable
      ? "n/a"
      : rules[key] ? "pass" : "fail",
    note: key === "showed_empathy" && !rules.showed_empathy_applicable
      ? rules.showed_empathy_reason || "Not applicable for this call"
      : rules[key] ? "Passed" : "Failed",
  }));
}

/**
 * Sentiment spans (waveform bar colour, both the small CallRow preview and
 * the big Call detail player) are derived from EVERY recognised tone, for
 * either speaker — the full TRANSCRIPT_TONE_MAP, same as the transcript
 * itself, so the whole call reads as continuously coloured rather than
 * mostly grey with occasional bursts.
 */
export function spansFromSegments(segments: BackendSegment[], durationSeconds: number): SentimentSpan[] {
  if (durationSeconds <= 0) return [];
  return toneRuns(segments, TRANSCRIPT_TONE_MAP).map((run) => ({
    start: Math.max(0, Math.min(1, run.startSeconds / durationSeconds)),
    end: Math.max(0, Math.min(1, run.endSeconds / durationSeconds)),
    tone: run.tone,
    tooltip: `${formatDurationShort(run.startSeconds)} — ${run.speaker} ${run.label.toLowerCase()}`,
  }));
}

/**
 * One chip per run, in order — every distinct moment either speaker's tone
 * enters one of the restricted preview tones (Satisfied/Irritated/
 * Rude), including a tone repeating later after a gap. Deliberately stays
 * on the narrower set (not the full transcript range) so the seek-marker
 * row stays high-signal. Chips carry no other speaker context on their
 * own, so the label is prefixed with who it refers to.
 */
export function sentimentEventsFromSegments(segments: BackendSegment[]): SentimentChipEvent[] {
  return toneRuns(segments, RECOGNIZED_TONE_MAP).map((run) => ({
    timestampLabel: formatDurationShort(run.startSeconds),
    label: `${run.speaker === "agent" ? "Agent" : "Customer"} ${run.label}`,
    tone: run.tone,
  }));
}

/**
 * One line per backend segment — unmerged, matching the raw transcript.
 * Every line (agent or customer) is tagged with its full emotion —
 * TRANSCRIPT_TONE_MAP, not the restricted preview set — so nothing is
 * hidden here even when the waveform/chip preview above stays quieter.
 * No speaker prefix is needed — the bubble's own AGENT/CUSTOMER label
 * already establishes who it is.
 */
export function transcriptFromSegments(segments: BackendSegment[]): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  for (const segment of segments) {
    const text = segment.text.trim();
    if (!text) continue;
    const speaker = segment.speaker_role === "AGENT" ? "agent" : "customer";
    const entry = TRANSCRIPT_TONE_MAP[segment.textual_tone];
    lines.push({
      timestampLabel: formatDurationShort(num(segment.start_seconds)),
      speaker,
      text,
      emotion: entry ? { label: entry.label, tone: entry.tone } : undefined,
    });
  }
  return lines;
}

export function verdictFromResolution(resolutionStatus: string, isRecurring: boolean): string {
  if (resolutionStatus === "RESOLVED") return isRecurring ? "Resolved after recurrence" : "Resolved during the call";
  if (resolutionStatus === "RESOLVED_BUT_IMPROVE_QUALITY") return "Resolved but Improve Quality";
  if (resolutionStatus === "DROPPED") return "Call dropped";
  if (resolutionStatus === "ESCALATED") return "Escalated for follow-up";
  if (resolutionStatus === "UNRESOLVED") return "Unresolved — follow-up required";
  return "Outcome unclear";
}

function statusFromRecurringOutcome(outcome: string): CallStatus {
  if (outcome === "RESOLVED") return "recurrence-resolved";
  if (outcome === "RESOLVED_BUT_IMPROVE_QUALITY") return "resolved_but_improve_quality";
  if (outcome === "DROPPED") return "dropped";
  if (outcome === "ESCALATED") return "requires-review";
  return "recurring";
}

export function recurringIssueFromGroups(
  groups: BackendRecurringGroup[],
  currentCallId: string,
): CallDetail["recurringIssue"] {
  const group = groups[0];
  if (!group || group.calls.length < 2) return undefined;
  return {
    countLabel: `${group.calls.length} calls / ${group.lookback_days} days`,
    occurrences: group.calls.map((call): RecurringOccurrence => ({
      label: `Call #${call.sequence_number}`,
      dateLabel: `${new Date(call.started_at).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}${call.call_id === currentCallId ? " · this call" : ""}`,
      durationLabel: "",
      tone: call.call_id === currentCallId ? "critical" : "caution",
    })),
  };
}

export function mapCallListItem(item: BackendCallListItem): CallSummary {
  const durationSeconds = num(item.duration_seconds);
  return {
    kind: "call",
    id: item.id,
    externalId: item.external_call_id,
    title: item.title ?? humanizeEnum(item.issue_category, "Call"),
    agentName: displayName(item.agent_name, "Agent"),
    agentId: item.agent_id,
    customerName: displayName(item.customer_name, "Customer"),
    customerRef: `#${item.customer_external_id}`,
    durationSeconds,
    status: item.analysis_status === "FAILED" ? "analysis-failed"
      : callStatusFromBackend(item.resolution_status, item.call_statuses, item.needs_manager_attention),
    needsManagerAttention: item.needs_manager_attention,
    isRude: item.call_statuses.includes("RUDE"),
    etiquette: [],
    sentimentSpans: [],
    waveSeed: seedFromId(item.id),
    avatarInitials: initialsFromName(item.customer_name, item.customer_external_id),
    avatarTintIndex: seedFromId(item.id) % 4,
    audioUrl: `/api/v1/calls/${item.id}/audio`,
    startedAt: item.started_at,
  };
}

export function mapRecurringGroupListItem(item: BackendRecurringGroupListItem): CallSummary {
  return {
    kind: "recurring-group",
    groupId: item.id,
    callCount: item.call_count,
    groupCalls: item.calls.map((call) => ({
      sequenceNumber: call.sequence_number,
      id: call.id,
      title: call.title ?? `Call ${call.sequence_number}`,
      status: call.resolution_status === "RESOLVED"
        ? "resolved"
        : call.resolution_status === "RESOLVED_BUT_IMPROVE_QUALITY" ? "resolved_but_improve_quality"
        : call.resolution_status === "DROPPED" ? "dropped" : "recurring",
    })),
    id: item.id,
    externalId: item.id,
    title: item.title,
    agentName: item.agent_name || `${item.agent_count} agents`,
    agentId: "",
    customerName: displayName(item.customer_name, "Customer"),
    customerRef: `#${item.customer_external_id}`,
    durationSeconds: num(item.duration_seconds),
    status: statusFromRecurringOutcome(item.outcome_status),
    needsManagerAttention: false,
    isRude: false,
    etiquette: [],
    sentimentSpans: [],
    waveSeed: seedFromId(item.id),
    avatarInitials: initialsFromName(item.customer_name, item.customer_external_id),
    avatarTintIndex: seedFromId(item.id) % 4,
    audioUrl: "",
    startedAt: item.latest_call_at,
  };
}

export function mapRecurringGroupDetail(group: BackendRecurringGroupDetail): RecurringGroupDetail {
  const lastCallIndex = group.calls.length - 1;
  return {
    id: group.id,
    title: group.group_title,
    summary: group.summary,
    verdict: group.verdict,
    recommendedAction: group.recommended_action,
    issueLabel: humanizeEnum(group.issue_category, "Recurring issue"),
    customerName: displayName(group.customer_name, "Customer"),
    customerRef: `#${group.customer_external_id}`,
    lookbackDays: group.lookback_days,
    status: statusFromRecurringOutcome(group.outcome_status),
    calls: group.calls.map((call, index) => ({
      sequenceNumber: call.sequence_number,
      id: call.id,
      externalId: call.external_call_id,
      startedAt: call.started_at,
      title: call.title ?? humanizeEnum(call.issue_category, "Call"),
      summary: call.issue_summary ?? call.short_description ?? "No summary available.",
      verdict: verdictFromResolution(call.resolution_status, true),
      agentName: displayName(call.agent_name, "Agent"),
      durationSeconds: num(call.duration_seconds),
      status: index === lastCallIndex && call.resolution_status === "RESOLVED"
        ? "recurrence-resolved"
        : callStatusFromBackend(call.resolution_status, call.call_statuses, call.needs_manager_attention),
    })),
  };
}

export function mapCallDetail(detail: BackendCallDetail): CallDetail {
  const summary = mapCallListItem(detail);
  const durationSeconds = summary.durationSeconds;
  const isRecurring = detail.call_statuses.includes("RECURRING");

  return {
    ...summary,
    etiquetteApplicable: detail.rules !== null,
    etiquette: etiquetteFromRules(detail.rules),
    sentimentSpans: spansFromSegments(detail.segments, durationSeconds),
    callNumber: detail.external_call_id,
    transcript: transcriptFromSegments(detail.segments),
    sentimentEvents: sentimentEventsFromSegments(detail.segments),
    aiSummary: detail.issue_summary ?? detail.short_description ?? "No summary available yet.",
    verdict: verdictFromResolution(detail.resolution_status, isRecurring),
    qualityFeedback: detail.quality_feedback ?? undefined,
    customerProblem: detail.customer_problem ? {
      summary: detail.customer_problem.summary,
      category: humanizeEnum(detail.customer_problem.category, "General enquiry"),
      requestedOutcome: detail.customer_problem.requested_outcome,
      evidence: detail.customer_problem.evidence,
    } : undefined,
    ruleEvidence: undefined,
    recurringIssue: recurringIssueFromGroups(detail.recurring_groups, detail.id),
    holdLabel: "—",
    silenceLabel: "—",
  };
}

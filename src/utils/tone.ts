import type { AppTheme } from "@/theme/theme";
import type { ToneKey } from "@/types/common";
import type { AgentState } from "@/types/agent";
import type { CallStatus, EtiquetteRuleStatus } from "@/types/call";

export function colorForAgentState(theme: AppTheme, state: AgentState): string {
  switch (state) {
    case "on-call":
      return theme.colors.accent.green;
    case "on-break":
      return theme.colors.chip.orange.fg;
    case "offline":
      return theme.colors.text.faintAlt;
    case "available":
      return theme.colors.text.muted;
  }
}

export function toneForCallStatus(status: CallStatus): ToneKey {
  switch (status) {
    case "resolved":
    case "recurrence-resolved":
      return "positive";
    case "resolved_but_improve_quality":
      return "caution";
    case "recurring":
      return "caution";
    case "requires-review":
      return "attention";
    case "dropped":
    case "unresolved":
    case "analysis-failed":
      return "critical";
  }
}

export function toneForAttentionScore(score: number): ToneKey {
  if (score >= 90) return "critical";
  if (score >= 75) return "attention";
  if (score >= 60) return "caution";
  if (score >= 45) return "neutral";
  return "mild";
}

export function toneForRuleStatus(status: EtiquetteRuleStatus): ToneKey {
  switch (status) {
    case "pass":
      return "positive";
    case "fail":
      return "critical";
    case "n/a":
      return "neutral";
  }
}

export function labelForCallStatus(status: CallStatus): string {
  switch (status) {
    case "resolved":
      return "Resolved";
    case "resolved_but_improve_quality":
      return "Resolved but Improve Quality";
    case "recurrence-resolved":
      return "Resolved after recurrence";
    case "recurring":
      return "Recurring";
    case "requires-review":
      return "Requires review";
    case "dropped":
      return "Dropped";
    case "unresolved":
      return "Unresolved";
    case "analysis-failed":
      return "Analysis failed";
  }
}

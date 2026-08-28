import type { Id } from "./common";
import type { CallSummary } from "./call";

export type AgentState = "on-call" | "available" | "on-break" | "offline";

export type HeatmapLevel = "none" | "low" | "good" | "difficult" | "rude";

export interface HeatmapCell {
  level: HeatmapLevel;
  tooltip: string;
  callId: Id;
}

export interface AgentEtiquettePercent {
  label: string;
  percent: number;
}

export interface Agent {
  id: Id;
  externalId: string;
  name: string;
  initials: string;
  avatarTintIndex: number;
  state: AgentState;
  stateLabel: string;
  callsCount: number;
  talkTimeLabel: string;
  qualityScorePercent?: number;
  miniActivity: HeatmapCell[];
}

export interface AgentKpi {
  label: string;
  value: string;
}

export interface AgentDetail extends Agent {
  role: string;
  tier: string;
  kpis: AgentKpi[];
  activity: HeatmapCell[];
  etiquette: AgentEtiquettePercent[];
  recentCalls: CallSummary[];
}

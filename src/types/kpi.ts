import type { CallSummary } from "./call";
import type { ManagerAttention } from "./call";
import type { ToneKey } from "./common";

export interface TotalCallsKpi {
  value: number;
  contextLabel: string;
}

export interface AvgDurationKpi {
  valueLabel: string;
  contextLabel: string;
  percentOfTarget: number;
  targetLabel: string;
}

export interface ResolvedBreakdownEntry {
  label: string;
  value: number;
  heightPercent: number;
  tone: ToneKey;
}

export interface ResolvedKpi {
  percent: number;
  deltaLabel: string;
  breakdown: ResolvedBreakdownEntry[];
}

export interface AttentionKpi {
  count: number;
  chips: string[];
  highest?: ManagerAttention;
}

export interface IssueRanking {
  name: string;
  count: number;
  percent: number;
  colorIndex: number;
}

export interface HomeSummary {
  totalCalls: TotalCallsKpi;
  avgDuration: AvgDurationKpi;
  resolved: ResolvedKpi;
  attention: AttentionKpi;
  issuesByEnquiry: IssueRanking[];
  callsList: CallSummary[];
}

export interface TeamKpi {
  label: string;
  value: string;
}

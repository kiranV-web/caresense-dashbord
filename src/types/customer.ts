import type { HeatmapCell, HeatmapLevel } from "./agent";
import type { CallSummary } from "./call";

export interface CustomerSummary {
  id: string;
  externalId: string;
  name: string;
  loggedNames: string[];
  initials: string;
  avatarTintIndex: number;
  callsCount: number;
  resolvedCount: number;
  attentionCount: number;
  totalDurationSeconds: number;
  latestCallAt?: string;
  latestOutcome: HeatmapLevel;
  activity: HeatmapCell[];
}

export interface CustomerDetail extends CustomerSummary {
  calls: CallSummary[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

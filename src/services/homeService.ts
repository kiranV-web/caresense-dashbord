import type { HomeSummary, IssueRanking } from "@/types/kpi";
import type { BackendCallListItem, BackendCallListResponse } from "./backendTypes";
import { getJson } from "./apiClient";
import { listCalls } from "./callsService";
import { formatDurationLong } from "@/utils/formatters";
import { humanizeEnum } from "@/utils/identity";

// No backend endpoint defines an "ideal call duration" yet (Settings' rule
// lives client-side only) — 3 minutes is the target call length used as the
// KPI progress bar's reference point.
const TARGET_DURATION_SECONDS = 180;

// How many of the most recently added calls to show (and detail-enrich for
// their waveform/etiquette) in the "Recent calls" preview list.
const HOME_CALLS_PREVIEW_COUNT = 5;

// There's no date-range concept in this system — everything reflects the
// full call history, ordered by when it was added (most recent first).
// Capped so an unexpectedly large dataset can't trigger unbounded fetching.
const ALL_CALLS_FETCH_CAP = 500;

function rankFromItems(items: BackendCallListItem[], key: "issue_category", fallback: string): IssueRanking[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const name = humanizeEnum(item[key] ?? undefined, fallback);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = sorted[0]?.[1] ?? 1;
  return sorted.map(([name, count], index) => ({ name, count, percent: Math.round((count / max) * 100), colorIndex: index }));
}

function avgDurationFields(avgSeconds: number | null) {
  const targetLabel = `${Math.round(TARGET_DURATION_SECONDS / 60)}m target`;
  const durationDeltaSeconds = avgSeconds === null ? 0 : TARGET_DURATION_SECONDS - avgSeconds;
  let contextLabel = "No completed calls yet";
  if (avgSeconds !== null) {
    const comparison = durationDeltaSeconds >= 0 ? "below" : "above";
    contextLabel = `${formatDurationLong(Math.abs(durationDeltaSeconds))} ${comparison} ${targetLabel}`;
  }
  return {
    valueLabel: avgSeconds === null ? "—" : formatDurationLong(avgSeconds),
    contextLabel,
    percentOfTarget: avgSeconds === null ? 0 : Math.min(100, Math.round((avgSeconds / TARGET_DURATION_SECONDS) * 100)),
    targetLabel,
  };
}

async function fetchAllCalls(): Promise<BackendCallListItem[]> {
  const pageSize = 100;
  const items: BackendCallListItem[] = [];
  let page = 1;
  for (;;) {
    const response = await getJson<BackendCallListResponse>(`/api/v1/calls?page=${page}&page_size=${pageSize}`);
    items.push(...response.items);
    const reachedCap = items.length >= ALL_CALLS_FETCH_CAP;
    const isLastPage = page >= response.pagination.total_pages || response.items.length === 0;
    if (reachedCap || isLastPage) break;
    page += 1;
  }
  return items;
}

export async function getTeamCoachingInsight(): Promise<string> {
  const response = await getJson<{ insight: string }>("/api/v1/dashboard/coaching-insight");
  return response.insight;
}

export async function getHomeSummary(): Promise<HomeSummary> {
  const items = await fetchAllCalls();

  const resolved = items.filter((item) =>
    item.resolution_status === "RESOLVED" || item.resolution_status === "RESOLVED_BUT_IMPROVE_QUALITY").length;
  const resolvedOnly = items.filter((item) => item.resolution_status === "RESOLVED").length;
  const improveQuality = items.filter((item) => item.resolution_status === "RESOLVED_BUT_IMPROVE_QUALITY").length;
  const attentionItems = items.filter((item) => item.needs_manager_attention);
  const recurring = attentionItems.filter((item) => item.call_statuses.includes("RECURRING")).length;
  const rude = attentionItems.filter((item) => item.call_statuses.includes("RUDE")).length;
  const unresolved = attentionItems.filter((item) => item.resolution_status === "UNRESOLVED").length;
  const attentionCount = attentionItems.length;

  const durations = items.map((item) => Number(item.duration_seconds)).filter((value) => Number.isFinite(value) && value > 0);
  const avgSeconds = durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : null;

  const maxBreakdown = Math.max(resolvedOnly, improveQuality, rude, 1);

  return {
    totalCalls: {
      value: items.length,
      contextLabel: "All recorded calls",
    },
    avgDuration: avgDurationFields(avgSeconds),
    resolved: {
      percent: items.length === 0 ? 0 : Math.round((resolved / items.length) * 100),
      deltaLabel: items.length === 0 ? "No calls recorded" : `${resolved} of ${items.length} calls`,
      breakdown: [
        { label: "Res", value: resolvedOnly, heightPercent: (resolvedOnly / maxBreakdown) * 100, tone: "positive" },
        { label: "Improve", value: improveQuality, heightPercent: (improveQuality / maxBreakdown) * 100, tone: "caution" },
        { label: "Rude", value: rude, heightPercent: (rude / maxBreakdown) * 100, tone: "critical" },
      ],
    },
    attention: {
      count: attentionCount,
      chips: [`${recurring} recurring`, `${rude} rude`, `${unresolved} unresolved`],
    },
    issuesByEnquiry: rankFromItems(items, "issue_category", "General enquiry"),
    callsList: await listCalls(undefined, { pageSize: HOME_CALLS_PREVIEW_COUNT }),
  };
}

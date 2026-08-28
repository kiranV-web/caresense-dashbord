import type { CallDetail, CallsFilter, CallSummary, RecurringGroupDetail } from "@/types/call";
import type { CallsFilterValue } from "./callsFilterStore";
import type { BackendCallDetail, BackendCallListItem, BackendCallListResponse, BackendGroupedCallListResponse,
  BackendRecurringGroupDetail } from "./backendTypes";
import { getJson } from "./apiClient";
import { mapCallDetail, mapCallListItem, mapRecurringGroupDetail, mapRecurringGroupListItem } from "./mappers";

function matchesFilter(call: CallSummary, filter: CallsFilter): boolean {
  if (filter.status === "attention" && call.status !== "requires-review") return false;
  if (filter.status && filter.status !== "attention" && call.status !== filter.status) return false;
  if (filter.agentId && call.agentId !== filter.agentId) return false;
  if (filter.search) {
    const query = filter.search.toLowerCase();
    const haystack = [call.title, call.agentName, call.customerName, call.externalId].join(" ").toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

/**
 * The list endpoint doesn't include transcript segments or etiquette rules
 * (only /calls/:id does), so a row's waveform colour and etiquette dots need
 * a follow-up detail fetch per call. Every item is kept even if its detail
 * fetch fails — it just falls back to an unenriched row instead of
 * disappearing from the list.
 */
export async function enrichCallSummaries(items: BackendCallListItem[]): Promise<CallSummary[]> {
  return Promise.all(
    items.map(async (item) => {
      try {
        const detail = await getJson<BackendCallDetail>(`/api/v1/calls/${encodeURIComponent(item.id)}`);
        return mapCallDetail(detail);
      } catch {
        return mapCallListItem(item);
      }
    }),
  );
}

export async function listCalls(filter?: CallsFilter, options: {
  pageSize?: number; page?: number; startedFrom?: string; startedTo?: string;
} = {}): Promise<CallSummary[]> {
  const params = new URLSearchParams({ page_size: String(options.pageSize ?? 50) });
  if (options.page) params.set("page", String(options.page));
  if (options.startedFrom) params.set("started_from", options.startedFrom);
  if (options.startedTo) params.set("started_to", options.startedTo);
  const response = await getJson<BackendGroupedCallListResponse>(`/api/v1/calls-grouped?${params}`);
  const calls = await Promise.all(response.items.map(async (item) => {
    if (item.item_type === "RECURRING_GROUP") return mapRecurringGroupListItem(item);
    try {
      const detail = await getJson<BackendCallDetail>(`/api/v1/calls/${encodeURIComponent(item.id)}`);
      return mapCallDetail(detail);
    } catch {
      return mapCallListItem(item);
    }
  }));
  return filter ? calls.filter((call) => matchesFilter(call, filter)) : calls;
}

const STATUS_FILTER_PARAM: Record<CallsFilterValue, string | undefined> = {
  "All": undefined,
  "Resolved": "resolved",
  "Improve quality": "improve_quality",
  "Recurring": "recurring",
  "Requires review": "attention",
  "Unresolved": "unresolved",
  "Analysis failed": "analysis_failed",
  "Dropped": "dropped",
  "Rude": "rude",
};

export interface CallsPageResult {
  items: CallSummary[];
  pagination: { page: number; page_size: number; total: number; total_pages: number };
}

/** Backend-paginated + backend-filtered listing for the Calls page — status
 * filtering and page slicing both happen in SQL, not by fetching everything
 * and slicing client-side. */
export async function listCallsPage(filter: CallsFilterValue, page: number, pageSize: number): Promise<CallsPageResult> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  const statusFilter = STATUS_FILTER_PARAM[filter];
  if (statusFilter) params.set("status_filter", statusFilter);
  const response = await getJson<BackendGroupedCallListResponse>(`/api/v1/calls-grouped?${params}`);
  const items = await Promise.all(response.items.map(async (item) => {
    if (item.item_type === "RECURRING_GROUP") return mapRecurringGroupListItem(item);
    try {
      const detail = await getJson<BackendCallDetail>(`/api/v1/calls/${encodeURIComponent(item.id)}`);
      return mapCallDetail(detail);
    } catch {
      return mapCallListItem(item);
    }
  }));
  return { items, pagination: response.pagination };
}

/** Agent-scoped call list for the Conversation quality card's "Recent calls" — uses the plain (non-grouped)
 * endpoint since recurring-group collapsing isn't meaningful for a single agent's coaching view. */
export async function listCallsForAgent(agentId: string, limit: number): Promise<CallSummary[]> {
  const params = new URLSearchParams({ agent_id: agentId, page_size: String(limit) });
  const response = await getJson<BackendCallListResponse>(`/api/v1/calls?${params}`);
  return enrichCallSummaries(response.items);
}

export async function getCallDetail(id: string): Promise<CallDetail | undefined> {
  try {
    const detail = await getJson<BackendCallDetail>(`/api/v1/calls/${encodeURIComponent(id)}`);
    return mapCallDetail(detail);
  } catch {
    return undefined;
  }
}

export async function getRecurringGroupDetail(id: string): Promise<RecurringGroupDetail | undefined> {
  try {
    const detail = await getJson<BackendRecurringGroupDetail>(`/api/v1/recurring-groups/${encodeURIComponent(id)}`);
    return mapRecurringGroupDetail(detail);
  } catch {
    return undefined;
  }
}

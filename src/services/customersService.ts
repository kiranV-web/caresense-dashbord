import { getJson } from "./apiClient";
import { enrichCallSummaries } from "./callsService";
import { mapActivityCall } from "./agentsService";
import type { BackendCustomerDetailResponse, BackendCustomerListResponse, BackendCustomerSummary } from "./backendTypes";
import type { CustomerDetail, CustomerSummary } from "@/types/customer";
import { seedFromId } from "@/utils/identity";

function mapCustomer(customer: BackendCustomerSummary): CustomerSummary {
  const activity = customer.activity.map(mapActivityCall);
  return {
    id: customer.id,
    externalId: customer.external_id,
    name: `Caller ${customer.external_id}`,
    loggedNames: customer.logged_names,
    initials: customer.external_id.slice(0, 2).toUpperCase(),
    avatarTintIndex: seedFromId(customer.id) % 4,
    callsCount: Number(customer.call_count),
    resolvedCount: Number(customer.resolved_count),
    attentionCount: Number(customer.attention_count),
    totalDurationSeconds: Number(customer.total_duration_seconds),
    latestCallAt: customer.latest_call_at ?? undefined,
    latestOutcome: activity.at(-1)?.level ?? "none",
    activity,
  };
}

export async function listCustomers(page: number, pageSize: number, search: string): Promise<{
  items: CustomerSummary[]; pagination: { page: number; pageSize: number; total: number; totalPages: number };
}> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (search.trim()) params.set("search", search.trim());
  const response = await getJson<BackendCustomerListResponse>(`/api/v1/customers?${params}`);
  return {
    items: response.items.map(mapCustomer),
    pagination: {
      page: response.pagination.page,
      pageSize: response.pagination.page_size,
      total: response.pagination.total,
      totalPages: response.pagination.total_pages,
    },
  };
}

export async function getCustomer(customerId: string, page: number, pageSize: number): Promise<CustomerDetail> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  const response = await getJson<BackendCustomerDetailResponse>(
    `/api/v1/customers/${encodeURIComponent(customerId)}?${params}`,
  );
  const summary = mapCustomer({ ...response.customer, activity: [] });
  return {
    ...summary,
    calls: await enrichCallSummaries(response.items),
    pagination: {
      page: response.pagination.page,
      pageSize: response.pagination.page_size,
      total: response.pagination.total,
      totalPages: response.pagination.total_pages,
    },
  };
}

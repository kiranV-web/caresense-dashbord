// Shapes returned by careSense-server (see its README "API" section and
// src/db/{dashboard,call}.repository.ts). Numeric Postgres columns
// (duration_seconds, start_seconds, end_seconds) are serialized as strings
// by node-pg, so they're typed as `string | number` and coerced on read.

export type BackendResolutionStatus = "RESOLVED" | "RESOLVED_BUT_IMPROVE_QUALITY" | "UNRESOLVED" | "DROPPED" | "ESCALATED" | "UNKNOWN";
export type BackendCallStatus =
  | "CALM_PLEASANT" | "RESOLVED" | "UNSOLVED" | "RECURRING" | "RUDE" | "ESCALATED" | "DROPPED" | "NOT_A_CALL";
export type BackendUrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type BackendTextualTone =
  | "NEUTRAL" | "CALM" | "PLEASANT" | "IRRITATED"
  | "ANGRY" | "RUDE" | "HAPPY" | "SATISFIED" | "DISTRESSED" | "UNKNOWN";

export interface BackendManagerAttention {
  score: number;
  raw_score: number;
  urgency_label: string;
  primary_reason: string;
  additional_reasons: string[];
  factors: Array<{ label: string; value: number; kind: "BASE" | "ADDITION" }>;
  calculated_at: string;
  waiting_hours: number;
  rank?: number;
  total_attention_calls?: number;
  previous_call_id?: string | null;
  next_call_id?: string | null;
}

export interface BackendCallListItem {
  id: string;
  external_call_id: string;
  started_at: string;
  device_model: string;
  banking_product?: string;
  duration_seconds: string | number | null;
  title: string | null;
  short_description: string | null;
  issue_category: string | null;
  resolution_status: BackendResolutionStatus;
  quality_feedback?: string | null;
  customer_problem?: BackendCustomerProblem | null;
  call_statuses: BackendCallStatus[];
  needs_manager_attention: boolean;
  urgency_level: BackendUrgencyLevel;
  manager_attention?: BackendManagerAttention | null;
  processing_state: string;
  transcription_status?: string;
  analysis_status?: string;
  recurrence_status?: string;
  customer_external_id: string;
  customer_name: string | null;
  agent_id: string;
  agent_external_id: string;
  agent_name: string | null;
}

export interface BackendCustomerProblem {
  summary: string;
  category: string;
  requested_outcome: string;
  evidence: string;
}

export interface BackendCallListResponse {
  items: BackendCallListItem[];
  pagination: { page: number; page_size: number; total: number; total_pages: number };
}

export interface BackendAttentionSummary {
  total: number;
  highest: BackendManagerAttention | null;
  categories: { rude: number; unresolved: number; etiquette_issues: number; recurring: number; other: number };
}

export interface BackendCustomerSummary {
  id: string;
  external_id: string;
  logged_names: string[];
  call_count: number;
  resolved_count: number;
  improve_quality_count: number;
  attention_count: number;
  dropped_count: number;
  total_duration_seconds: string | number;
  latest_call_at: string | null;
  activity: BackendTeamActivityCall[];
}

export interface BackendCustomerListResponse {
  items: BackendCustomerSummary[];
  pagination: { page: number; page_size: number; total: number; total_pages: number };
}

export interface BackendCustomerDetailResponse {
  customer: Omit<BackendCustomerSummary, "activity">;
  items: BackendCallListItem[];
  pagination: { page: number; page_size: number; total: number; total_pages: number };
}

export interface BackendRecurringGroupListItem {
  item_type: "RECURRING_GROUP";
  id: string;
  title: string;
  short_description: string;
  verdict: string;
  recommended_action: string;
  outcome_status: BackendResolutionStatus;
  issue_category: string;
  issue_cause: string;
  first_call_at: string;
  latest_call_at: string;
  lookback_days: number;
  call_count: number;
  duration_seconds: string | number;
  customer_id: string;
  customer_external_id: string;
  customer_name: string | null;
  agent_count: number;
  agent_name: string;
  calls: Array<{
    sequence_number: number;
    id: string;
    title: string | null;
    started_at: string;
    resolution_status: BackendResolutionStatus;
  }>;
}

export interface BackendGroupedCallListResponse {
  items: ((BackendCallListItem & { item_type: "CALL" }) | BackendRecurringGroupListItem)[];
  pagination: { page: number; page_size: number; total: number; total_pages: number };
}

export interface BackendRecurringGroupDetail {
  id: string;
  group_title: string;
  summary: string;
  verdict: string;
  recommended_action: string;
  outcome_status: BackendResolutionStatus;
  issue_category: string;
  issue_cause: string;
  first_call_at: string;
  latest_call_at: string;
  lookback_days: number;
  customer_external_id: string;
  customer_name: string | null;
  calls: Array<{
    sequence_number: number;
    id: string;
    external_call_id: string;
    started_at: string;
    title: string | null;
    short_description: string | null;
    issue_summary: string | null;
    issue_category: string | null;
    issue_cause: string | null;
    resolution_status: BackendResolutionStatus;
    call_statuses: BackendCallStatus[];
    needs_manager_attention: boolean;
    duration_seconds: string | number | null;
    agent_id: string;
    agent_external_id: string;
    agent_name: string | null;
  }>;
}

export interface BackendRules {
  greeted_customer: boolean;
  introduced_self: boolean;
  showed_empathy: boolean | null;
  showed_empathy_applicable: boolean;
  showed_empathy_reason: string;
  offered_help: boolean;
  provided_clear_guidance: boolean;
  thanked_customer: boolean;
  wished_customer_good_day: boolean;
}

export interface BackendSegment {
  segment_id: string;
  segment_index: number;
  speaker_role: "AGENT" | "CUSTOMER";
  speaker_name: string | null;
  start_seconds: string | number;
  end_seconds: string | number;
  text: string;
  textual_tone: BackendTextualTone;
}

export interface BackendRecurringGroupCall {
  sequence_number: number;
  call_id: string;
  external_call_id: string;
  started_at: string;
  resolution_status: BackendResolutionStatus;
}

export interface BackendRecurringGroup {
  group_id: string;
  issue_category: string | null;
  issue_cause: string | null;
  first_call_at: string;
  latest_call_at: string;
  lookback_days: number;
  calls: BackendRecurringGroupCall[];
}

export interface BackendCallDetail extends BackendCallListItem {
  issue_cause: string | null;
  issue_summary: string | null;
  duration_seconds: string | number | null;
  rules: BackendRules | null;
  segments: BackendSegment[];
  recurring_groups: BackendRecurringGroup[];
  transcription_failure_reason?: string | null;
  analysis_failure_reason?: string | null;
  recurrence_failure_reason?: string | null;
}

export interface BackendDashboardHome {
  period: { date: string; timezone: string; week_start: string | null; week_end: string | null };
  calls_today: { count: number; yesterday_count: number; delta_percent: number | null };
  average_duration: { seconds: number | null };
  rates: {
    denominator: number;
    resolved: { count: number; percent: number };
    recurring: { count: number; percent: number };
    rude: { count: number; percent: number };
  };
  attention: { total: number; recurring: number; rude: number; unresolved: number };
  weekly_calls: { total: number; peak_day: string | null; days: { date: string; day: string; count: number }[] };
  banking_products?: { banking_product: string; call_count: number; percent_of_highest: number }[];
  issues: { issue_category: string; call_count: number; percent_of_highest: number }[];
  flagged_calls: unknown[];
}

export interface BackendTeamActivityCall {
  id: string;
  agent_id: string;
  external_call_id: string;
  started_at: string;
  // Null when the call never reached analysis (e.g. a transcription failure) —
  // status_label is the backend's own safe, always-present fallback for this.
  resolution_status: BackendResolutionStatus | null;
  status_label: string;
  call_statuses: BackendCallStatus[];
  needs_manager_attention: boolean | null;
}

export interface BackendTeamAgent {
  id: string;
  external_id: string;
  name: string | null;
  speaker_ids_seen?: string[];
  call_count: number;
  resolved_count: number;
  unresolved_count: number;
  dropped_count: number;
  escalated_count: number;
  attention_count: number;
  average_duration_seconds: number | null;
  total_duration_seconds: number;
  quality_score_percent: number | null;
  resolution_rate_percent: number;
}

export interface BackendDashboardTeam {
  period: { date: string; dateFrom: string; dateTo: string; timezone: string };
  totals: { agents: number; calls: number; resolved: number };
  activity: BackendTeamActivityCall[];
  quality_agents: Array<{ id: string; logged_names: string[]; call_count: number }>;
  agents: BackendTeamAgent[];
}

export interface BackendAgentQualityRule {
  rule: string;
  label: string;
  agent_pass_percent: number | null;
  team_pass_percent: number;
  fail_count: number;
  total_calls: number;
}

export interface BackendAgentConversationQuality {
  agent: { id: string; external_id: string; logged_names: string[]; call_count: number };
  overall_adherence_percent: number;
  rules: BackendAgentQualityRule[];
}

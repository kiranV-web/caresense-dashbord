import type { Agent, AgentDetail, HeatmapCell, HeatmapLevel } from "@/types/agent";
import type { AgentConversationQuality } from "@/types/agentQuality";
import type { BackendAgentConversationQuality, BackendDashboardTeam, BackendTeamActivityCall } from "./backendTypes";
import { getJson } from "./apiClient";
import { displayName, initialsFromName, seedFromId } from "@/utils/identity";
import { formatDurationLong } from "@/utils/formatters";

function activityLevel(call: BackendTeamActivityCall): HeatmapLevel {
  if (call.needs_manager_attention || call.call_statuses.includes("RECURRING") || call.call_statuses.includes("RUDE")) return "rude";
  if (call.resolution_status === "UNRESOLVED" || call.resolution_status === "ESCALATED") return "difficult";
  if (call.resolution_status === "RESOLVED") return "good";
  if (call.resolution_status === "RESOLVED_BUT_IMPROVE_QUALITY") return "difficult";
  if (call.resolution_status === "DROPPED") return "low";
  return "none";
}

export function mapActivityCall(call: BackendTeamActivityCall): HeatmapCell {
  const level = activityLevel(call);
  const outcome = level === "rude" ? "needs review" : call.resolution_status.toLowerCase();
  return {
    level,
    tooltip: `${call.external_call_id} · ${new Date(call.started_at).toLocaleString()} · ${outcome}`,
    callId: call.id,
  };
}

export interface TeamOverview {
  agents: Agent[];
  activity: HeatmapCell[];
  totals: BackendDashboardTeam["totals"];
  averageDurationSeconds: number | null;
  needsReview: number;
}

// There's no date-range concept in this system — the team endpoint requires
// some date bounds internally, so this passes a fixed range wide enough to
// cover the entire call history, purely as a technical implementation
// detail (never exposed to the user).
const FULL_HISTORY_QUERY = "?date_from=2000-01-01&date_to=2100-01-01";

export async function getTeamOverview(): Promise<TeamOverview> {
  const team = await getJson<BackendDashboardTeam>(`/api/v1/dashboard/team${FULL_HISTORY_QUERY}`);
  const activityByAgent = new Map<string, BackendTeamActivityCall[]>();
  for (const call of team.activity) {
    const calls = activityByAgent.get(call.agent_id) ?? [];
    calls.push(call);
    activityByAgent.set(call.agent_id, calls);
  }
  const durationTotal = team.agents.reduce((sum, agent) => sum + agent.total_duration_seconds, 0);
  const durationCalls = team.agents.reduce((sum, agent) => sum + (agent.average_duration_seconds === null ? 0 : agent.call_count), 0);
  return {
    totals: team.totals,
    averageDurationSeconds: durationCalls === 0 ? null : Math.round(durationTotal / durationCalls),
    needsReview: team.agents.reduce((sum, agent) => sum + agent.attention_count, 0),
    activity: team.activity.map(mapActivityCall),
    agents: team.agents.map((agent) => {
      const name = displayName(agent.name, agent.external_id);
      return {
        id: agent.id,
        externalId: agent.external_id,
        name,
        initials: initialsFromName(agent.name, agent.external_id),
        avatarTintIndex: seedFromId(agent.id) % 4,
        state: "offline",
        stateLabel: "",
        callsCount: agent.call_count,
        talkTimeLabel: formatDurationLong(agent.total_duration_seconds),
        qualityScorePercent: agent.quality_score_percent ?? undefined,
        miniActivity: (activityByAgent.get(agent.id) ?? []).slice(-28).map(mapActivityCall),
      };
    }),
  };
}

export async function getAgentConversationQuality(agentId: string): Promise<AgentConversationQuality> {
  const data = await getJson<BackendAgentConversationQuality>(
    `/api/v1/dashboard/agent-quality?agent_id=${encodeURIComponent(agentId)}`
  );
  return {
    agentId: data.agent.id,
    agentName: displayName(data.agent.name, data.agent.external_id),
    overallAdherencePercent: data.overall_adherence_percent,
    rules: data.rules
      .filter((rule) => rule.agent_pass_percent !== null && rule.total_calls > 0)
      .map((rule) => ({
        rule: rule.rule,
        label: rule.label,
        agentPercent: rule.agent_pass_percent,
        teamPercent: rule.team_pass_percent,
        failCount: rule.fail_count,
        totalCalls: rule.total_calls,
      })),
  };
}

export function getAgent(id: string): Promise<AgentDetail | undefined> {
  return getTeamOverview().then((team) => {
    const agent = team.agents.find((item) => item.id === id);
    if (!agent) return undefined;
    return {
      ...agent,
      role: "",
      tier: "",
      kpis: [
        { label: "Calls today", value: String(agent.callsCount) },
        { label: "Talk time", value: agent.talkTimeLabel },
        ...(agent.qualityScorePercent === undefined
          ? []
          : [{ label: "Quality score", value: `${agent.qualityScorePercent}%` }]),
      ],
      activity: agent.miniActivity,
      etiquette: [],
      recentCalls: [],
    };
  });
}

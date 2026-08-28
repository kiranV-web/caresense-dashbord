import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/primitives/Card";
import { ActivityHeatmap, ActivityHeatmapLegend } from "@/components/heatmap/ActivityHeatmap";
import { AgentCard } from "@/components/agent/AgentCard";
import { useAsync } from "@/hooks/useAsync";
import { getTeamOverview } from "@/services/agentsService";
import type { Agent } from "@/types/agent";
import { formatDurationLong } from "@/utils/formatters";

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const KpiValue = styled.div`
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.035em;
`;

const KpiLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 5px;
`;

const CardHeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;

const CardTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.025em;
`;

const AgentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

export function TeamPage() {
  const navigate = useNavigate();
  const { data: team, loading, error } = useAsync(() => getTeamOverview(), []);
  const agents = team?.agents ?? [];
  const teamKpis = [
    { label: "Agents", value: String(team?.totals.agents ?? 0) },
    { label: "Calls", value: String(team?.totals.calls ?? 0) },
    { label: "Avg per agent", value: team?.totals.agents ? (team.totals.calls / team.totals.agents).toFixed(1) : "0" },
    { label: "Avg duration", value: team?.averageDurationSeconds === null || team?.averageDurationSeconds === undefined ? "—" : formatDurationLong(team.averageDurationSeconds) },
    { label: "Needs review", value: String(team?.needsReview ?? 0) },
  ];

  function openAgent(agent: Agent) {
    navigate(`/team/${agent.id}`);
  }

  function openCall(callId: string) {
    navigate(`/calls/${callId}`);
  }

  return (
    <Stack>
      <KpiGrid>
        {teamKpis.map((kpi) => (
          <Card key={kpi.label} padding="kpi">
            <KpiValue>{kpi.value}</KpiValue>
            <KpiLabel>{kpi.label}</KpiLabel>
          </Card>
        ))}
      </KpiGrid>

      <Card padding="content">
        <CardHeadRow>
          <CardTitle>Call activity — all agents</CardTitle>
          <ActivityHeatmapLegend />
        </CardHeadRow>
        <ActivityHeatmap cells={team?.activity ?? []} cellSize={14} onCellClick={(cell) => openCall(cell.callId)} />
        {!loading && !error && team?.activity.length === 0 && <KpiLabel>No calls available.</KpiLabel>}
        {error && <KpiLabel>Unable to load team data: {error.message}</KpiLabel>}
      </Card>

      <AgentGrid>
        {!loading && agents.map((agent) => <AgentCard key={agent.id} agent={agent} onOpen={openAgent} onOpenCall={openCall} />)}
      </AgentGrid>
    </Stack>
  );
}

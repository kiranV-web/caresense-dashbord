import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/primitives/Card";
import { Avatar } from "@/components/primitives/Avatar";
import { ActivityHeatmap } from "@/components/heatmap/ActivityHeatmap";
import { EtiquettePercentBars } from "@/components/etiquette/EtiquettePercentBars";
import { CallList } from "@/components/call/CallList";
import { useAsync } from "@/hooks/useAsync";
import { getAgent } from "@/services/agentsService";

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const HeaderCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const BackLink = styled.button`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.muted};
  border-radius: ${({ theme }) => theme.radii.pillLg};
  transition: color 0.18s ease, transform 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateX(-2px);
  }
`;

const NameBlock = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.025em;
`;

const Meta = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ExportButton = styled.button`
  padding: 11px 20px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.text.onAccent};
  font-size: 13px;
  font-weight: 700;
  transition: background 0.18s ease, transform 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.deep};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0) scale(0.97);
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const KpiValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.035em;
`;

const KpiLabel = styled.div`
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 5px;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const CardTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 18px;
`;

const Hint = styled.div`
  margin-top: 16px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.faint};
`;

export function AgentDetailPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { data: agent, loading } = useAsync(() => getAgent(agentId!), [agentId]);

  if (loading || !agent) return <Stack>Loading…</Stack>;

  return (
    <Stack>
      <HeaderCard>
        <BackLink type="button" onClick={() => navigate("/team")}>
          ← Team
        </BackLink>
        <Avatar initials={agent.initials} tintIndex={agent.avatarTintIndex} shape="circle" size={56} fontSize={17} />
        <NameBlock>
          <Name>{agent.name}</Name>
          {[agent.role, agent.tier, agent.stateLabel].filter(Boolean).length > 0 && (
            <Meta>{[agent.role, agent.tier, agent.stateLabel].filter(Boolean).join(" · ")}</Meta>
          )}
        </NameBlock>
        <ExportButton type="button">Export report</ExportButton>
      </HeaderCard>

      <KpiGrid>
        {agent.kpis.map((kpi) => (
          <Card key={kpi.label} padding="kpi">
            <KpiValue>{kpi.value}</KpiValue>
            <KpiLabel>{kpi.label}</KpiLabel>
          </Card>
        ))}
      </KpiGrid>

      <TwoCol>
        <Card padding="content">
          <CardTitle>Call activity</CardTitle>
          <ActivityHeatmap cells={agent.activity} cellSize={13} onCellClick={(cell) => navigate(`/calls/${cell.callId}`)} />
          <Hint>Click a square to open that call</Hint>
        </Card>
        <Card padding="content">
          <CardTitle>Etiquette performance</CardTitle>
          <EtiquettePercentBars entries={agent.etiquette} />
        </Card>
      </TwoCol>

      <Card padding="content">
        <CardTitle>Recent calls</CardTitle>
        <CallList calls={agent.recentCalls} onOpen={(call) => navigate(`/calls/${call.id}`)} />
      </Card>
    </Stack>
  );
}

import styled, { useTheme } from "styled-components";
import { Card } from "@/components/primitives/Card";
import { Avatar } from "@/components/primitives/Avatar";
import { ProgressBar } from "@/components/primitives/ProgressBar";
import { MiniActivityStrip } from "@/components/heatmap/MiniActivityStrip";
import type { Agent, HeatmapCell } from "@/types/agent";
import { colorForAgentState } from "@/utils/tone";

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NameBlock = styled.div`
  min-width: 0;
`;

const Name = styled.div`
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const StateLabel = styled.div<{ $color: string }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const AgentId = styled.div`
  font-size: 11.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.faintAlt};
`;

const StatsRow = styled.div`
  display: flex;
  gap: 14px;
  margin: 16px 0 14px;
  font-size: 13px;
  font-weight: 700;

  span:first-child {
    white-space: nowrap;
  }

  span:last-child {
    color: ${({ theme }) => theme.colors.text.muted};
    white-space: nowrap;
  }
`;

const QualityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  > div {
    flex: 1;
  }
`;

const QualityValue = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.accent.green};
`;

export interface AgentCardProps {
  agent: Agent;
  onOpen: (agent: Agent) => void;
  onOpenCall?: (callId: HeatmapCell["callId"]) => void;
}

export function AgentCard({ agent, onOpen, onOpenCall }: Readonly<AgentCardProps>) {
  const theme = useTheme();
  return (
    <Card interactive as="button" onClick={() => onOpen(agent)} style={{ width: "100%", textAlign: "left" }}>
      <Head>
        <Avatar initials={agent.initials} tintIndex={agent.avatarTintIndex} shape="circle" size={44} fontSize={14} />
        <NameBlock>
          <Name>{agent.name}</Name>
          <AgentId>ID: {agent.externalId}</AgentId>
          {agent.stateLabel && <StateLabel $color={colorForAgentState(theme, agent.state)}>{agent.stateLabel}</StateLabel>}
        </NameBlock>
      </Head>

      <StatsRow>
        <span>{agent.callsCount} calls</span>
        <span>{agent.talkTimeLabel}</span>
      </StatsRow>

      {agent.qualityScorePercent !== undefined && (
        <QualityRow>
          <ProgressBar percent={agent.qualityScorePercent} color={theme.colors.pastel.green[0]} height={7} />
          <QualityValue>{agent.qualityScorePercent}%</QualityValue>
        </QualityRow>
      )}

      <MiniActivityStrip cells={agent.miniActivity} onCellClick={onOpenCall ? (cell) => onOpenCall(cell.callId) : undefined} />
    </Card>
  );
}

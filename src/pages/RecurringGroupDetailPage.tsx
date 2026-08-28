import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/primitives/Card";
import { StatusPill } from "@/components/status/StatusPill";
import { useAsync } from "@/hooks/useAsync";
import { getRecurringGroupDetail } from "@/services/callsService";
import { formatDurationShort } from "@/utils/formatters";

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const Back = styled.button`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 12px;
  border-radius: ${({ theme }) => theme.radii.pillLg};
  transition: color 0.18s ease, transform 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateX(-2px);
  }
`;

const Header = styled(Card)`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
`;

const Eyebrow = styled.div`
  color: ${({ theme }) => theme.colors.tone.caution.chipFg};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 4px 0 6px;
  font-size: 24px;
  letter-spacing: -0.035em;
`;

const Meta = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 13px;
  font-weight: 600;
`;

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const Label = styled.div`
  color: ${({ theme }) => theme.colors.text.faintAlt};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const Body = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.65;
`;

const Timeline = styled.div`
  margin-top: 12px;
`;

const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 16px;
  min-height: 150px;
`;

const Rail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Dot = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.text.onAccent};
  font-size: 12px;
  font-weight: 900;
`;

const Line = styled.div`
  width: 2px;
  flex: 1;
  background: ${({ theme }) => theme.colors.line.input};
`;

const CallCard = styled(Card)`
  cursor: pointer;
  margin-bottom: 18px;
  transition: transform 0.15s ease;

  &:hover { transform: translateY(-1px); }
`;

const CallHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const CallTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
`;

const CallMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 12px;
  font-weight: 650;
  margin-top: 4px;
`;

const Summary = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 13.5px;
  line-height: 1.55;
  margin-top: 12px;
`;

const Verdict = styled.div`
  background: ${({ theme }) => theme.colors.surface.muted};
  border-radius: ${({ theme }) => theme.radii.panel};
  padding: 10px 12px;
  font-size: 12.5px;
  font-weight: 750;
  margin-top: 12px;
`;

export function RecurringGroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { data: group, loading } = useAsync(() => getRecurringGroupDetail(groupId!), [groupId]);

  if (loading || !group) return <Stack>Loading…</Stack>;

  return (
    <Stack>
      <div>
        <Back type="button" onClick={() => navigate("/calls")}>← Calls</Back>
        <Header>
          <div>
            <Eyebrow>AI-confirmed recurring issue</Eyebrow>
            <Title>{group.title}</Title>
            <Meta>{group.customerName} {group.customerRef} · {group.calls.length} calls in {group.lookbackDays} days · {group.issueLabel}</Meta>
          </div>
          <StatusPill status={group.status} />
        </Header>
      </div>

      <ReviewGrid>
        <Card padding="content" accent>
          <Label>Combined summary</Label>
          <Body>{group.summary}</Body>
          <Label style={{ marginTop: 18 }}>Verdict</Label>
          <Body>{group.verdict}</Body>
        </Card>
        <Card padding="content">
          <Label>Recommended agent action</Label>
          <Body>{group.recommendedAction}</Body>
        </Card>
      </ReviewGrid>

      <Card padding="content">
        <Label>Call timeline</Label>
        <Timeline>
          {group.calls.map((call, index) => (
            <TimelineItem key={call.id}>
              <Rail>
                <Dot>{call.sequenceNumber}</Dot>
                {index < group.calls.length - 1 && <Line />}
              </Rail>
              <CallCard padding="content" onClick={() => navigate(`/calls/${call.id}`)}>
                <CallHead>
                  <div>
                    <CallTitle>Call {call.sequenceNumber} — {call.title}</CallTitle>
                    <CallMeta>{new Date(call.startedAt).toLocaleString()} · {call.agentName} · {formatDurationShort(call.durationSeconds)}</CallMeta>
                  </div>
                  <StatusPill status={call.status} />
                </CallHead>
                <Summary>{call.summary}</Summary>
                <Verdict>Verdict: {call.verdict}</Verdict>
              </CallCard>
            </TimelineItem>
          ))}
        </Timeline>
      </Card>
    </Stack>
  );
}

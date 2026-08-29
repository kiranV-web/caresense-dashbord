import styled, { useTheme } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/primitives/Card";
import { StatusPill } from "@/components/status/StatusPill";
import { Avatar } from "@/components/primitives/Avatar";
import { Pill } from "@/components/primitives/Pill";
import { useAsync } from "@/hooks/useAsync";
import { getRecurringGroupDetail } from "@/services/callsService";
import { formatDurationShort } from "@/utils/formatters";
import { initialsFromName } from "@/utils/identity";

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
  margin: 4px 0 10px;
  font-size: 24px;
  letter-spacing: -0.035em;
`;

const CustomerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CustomerName = styled.div`
  font-size: 14.5px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CustomerRef = styled.div`
  font-size: 11.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const MetaPills = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
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

// The card behind this has an accent gradient background, so its own text
// needs to be white — Label/Body are shared with the plain "Recommended
// agent action" card next to it, so the override is scoped here rather
// than changed on the shared components.
const SummaryCard = styled(Card)`
  ${Label}, ${Body} {
    color: ${({ theme }) => theme.colors.text.onAccent};
  }
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
  height: 100%;
`;

const Dot = styled.div`
  flex: none;
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

// flex:1 on both segments (even the hidden one) keeps the dot vertically
// centred in the tile regardless of position — visibility:hidden preserves
// the segment's space without drawing it, so the first item's top half and
// the last item's bottom half stay blank instead of a stray dotted stub.
const RailSegment = styled.div<{ $visible: boolean }>`
  flex: 1;
  width: 0;
  min-height: 8px;
  border-left: 2px dotted ${({ theme }) => theme.colors.line.input};
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
`;

const CallCard = styled(Card)<{ $isRecurring: boolean }>`
  cursor: pointer;
  margin-bottom: 18px;
  transition: transform 0.15s ease, background 0.15s ease;
  ${({ $isRecurring, theme }) => $isRecurring && `background: ${theme.colors.tone.critical.chipBg};`}

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
  const theme = useTheme();
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
            <CustomerRow>
              <Avatar initials={initialsFromName(group.customerName, group.customerRef)} size={34} fontSize={12} />
              <div>
                <CustomerName>{group.customerName}</CustomerName>
                <CustomerRef>{group.customerRef}</CustomerRef>
              </div>
            </CustomerRow>
            <MetaPills>
              <Pill $bg={theme.colors.chip.neutral.bg} $fg={theme.colors.chip.neutral.fg}>
                {group.calls.length} calls in {group.lookbackDays} days
              </Pill>
              <Pill $bg={theme.colors.chip.neutral.bg} $fg={theme.colors.chip.neutral.fg}>{group.issueLabel}</Pill>
            </MetaPills>
          </div>
          <StatusPill status={group.status} />
        </Header>
      </div>

      <ReviewGrid>
        <SummaryCard padding="content" accent>
          <Label>Combined summary</Label>
          <Body>{group.summary}</Body>
          <Label style={{ marginTop: 18 }}>Verdict</Label>
          <Body>{group.verdict}</Body>
        </SummaryCard>
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
                <RailSegment $visible={index > 0} />
                <Dot>{call.sequenceNumber}</Dot>
                <RailSegment $visible={index < group.calls.length - 1} />
              </Rail>
              <CallCard padding="content" $isRecurring={call.status === "recurring"} onClick={() => navigate(`/calls/${call.id}`)}>
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

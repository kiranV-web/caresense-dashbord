import { useMemo, useState } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/primitives/Card";
import { KpiCard } from "@/components/kpi/KpiCard";
import { KpiProgressTrack } from "@/components/kpi/visuals/KpiProgressTrack";
import { MiniBarChart } from "@/components/kpi/visuals/MiniBarChart";
import { GradientCtaVisual } from "@/components/kpi/visuals/GradientCtaVisual";
import { ConversationQualityRadar } from "@/components/chart/ConversationQualityRadar";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { CallList } from "@/components/call/CallList";
import { IconButton } from "@/components/primitives/IconButton";
import { useAsync } from "@/hooks/useAsync";
import { getHomeSummary, getTeamCoachingInsight } from "@/services/homeService";
import { getAgentConversationQuality, getTeamOverview } from "@/services/agentsService";
import { listCallsForAgent } from "@/services/callsService";
import { setCallsFilter } from "@/services/callsFilterStore";
import type { CallSummary } from "@/types/call";
import { Maximize2, X } from "lucide-react";

type HomeFilter = "All" | "Resolved" | "Recurring" | "Dropped" | "Rude";

const AGENT_RULE_CALLS_LIMIT = 30;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.62fr 1fr;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const CardHeadRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const CardTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.025em;
`;

const CardSubtitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 3px;
`;

const RadarHeadRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex: none;
`;

const AdherenceValue = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AgentSelect = styled.select`
  padding: 7px 12px;
  border-radius: ${({ theme }) => theme.radii.pillLg};
  background: ${({ theme }) => theme.colors.surface.muted};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12.5px;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.interaction.focusOutline};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }
`;

const RadarLoading = styled.div`
  padding: 60px 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const IssuesHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;

const IssueRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const IssueRowHead = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 7px;

  span:last-child {
    color: ${({ theme }) => theme.colors.text.muted};
    font-variant-numeric: tabular-nums;
  }
`;

const IssueTrack = styled.div`
  height: 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.surface.muted};
`;

const IssueFill = styled.div<{ $percent: number; $color: string }>`
  height: 8px;
  border-radius: 4px;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $color }) => $color};
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

const IssuesEmpty = styled.div`
  padding: 32px 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const IssuesCard = styled(Card)`
  align-self: start;
`;

const RightColumn = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  align-content: start;
  gap: ${({ theme }) => theme.spacing.stackGap};
  min-height: 0;
`;

const coachPulse = keyframes`
  0%, 100% {
    opacity: 0.52;
    transform: scale(0.82);
  }
  50% {
    opacity: 1;
    transform: scale(1.16);
  }
`;

const CoachingCard = styled(Card)`
  position: relative;
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  overflow: hidden;
  min-height: 180px;
  padding: 18px 20px;
  background: ${({ theme }) =>
    `linear-gradient(138deg, ${theme.colors.tone.mild.chipBg} 0%, ${theme.colors.pastel.green[4]} 56%, ${theme.colors.pastel.green[3]} 100%)`};
  border: 1px solid ${({ theme }) => theme.colors.pastel.green[2]};
  box-shadow: ${({ theme }) => theme.shadows.cardHover};

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 24px;
    bottom: 24px;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background: ${({ theme }) => theme.colors.accent.green};
    pointer-events: none;
  }
`;

const CoachingVideoRing = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  padding: 5px;
  background: ${({ theme }) => theme.colors.surface.sunken};
  border: 1px solid ${({ theme }) => theme.colors.pastel.green[2]};
  box-shadow: 0 8px 22px ${({ theme }) => theme.colors.accent.gradientShadow};
  z-index: 1;

  &::after {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1px solid ${({ theme }) => theme.colors.pastel.green[3]};
    pointer-events: none;
  }
`;

const CoachingVideo = styled.video`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  filter: hue-rotate(310deg) saturate(0.52);
  pointer-events: none;
`;

const CoachingCopy = styled.div`
  position: relative;
  min-width: 0;
  z-index: 1;
`;

const CoachingEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: ${({ theme }) => theme.colors.tone.mild.chipFg};
  background: ${({ theme }) => theme.colors.tone.mild.chipBg};
  border-radius: ${({ theme }) => theme.radii.pillLg};
  padding: 4px 9px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent.gold};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.tone.caution.chipBg},
      0 0 12px ${({ theme }) => theme.colors.accent.gold};
    animation: ${coachPulse} 2.6s ease-in-out infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
`;

const CoachingTitle = styled.div`
  margin-top: 7px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const CoachingText = styled.div`
  margin-top: 4px;
  font-size: 12.25px;
  font-weight: 600;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CallsHeadRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Spacer = styled.div`
  flex: 1;
`;

const CallsListWrap = styled.div`
  margin-top: 8px;
`;

const RuleFilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pillLg};
  background: ${({ theme }) => theme.colors.tone.caution.chipBg};
  color: ${({ theme }) => theme.colors.tone.caution.chipFg};
  font-size: 12.5px;
  font-weight: 700;
  border: 1px solid transparent;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.tone.caution.solid};
    border-color: ${({ theme }) => theme.colors.pastel.amber};
  }

  &:active {
    transform: scale(0.97);
  }
`;

const homeFilterItems: { value: HomeFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Resolved", label: "Resolved" },
  { value: "Recurring", label: "Recurring" },
  { value: "Dropped", label: "Dropped" },
  { value: "Rude", label: "Rude" },
];

function matchesFilter(call: CallSummary, filter: HomeFilter): boolean {
  if (filter === "All") return true;
  if (filter === "Resolved") return call.status === "resolved" || call.status === "recurrence-resolved";
  if (filter === "Recurring") return call.status === "recurring";
  if (filter === "Dropped") return call.status === "dropped";
  return call.isRude;
}

export function HomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: summary, loading } = useAsync(() => getHomeSummary(), []);
  const { data: team } = useAsync(() => getTeamOverview(), []);
  const { data: coachingInsight, loading: coachingLoading } = useAsync(() => getTeamCoachingInsight(), []);
  const [filter, setFilter] = useState<HomeFilter>("All");
  const [selectedAgentOverride, setSelectedAgentOverride] = useState<string | undefined>();
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  const defaultAgentId = useMemo(() => {
    if (!team || team.agents.length === 0) return undefined;
    return team.agents.reduce((busiest, agent) =>
      agent.callsCount > busiest.callsCount ? agent : busiest).id;
  }, [team]);
  const selectedAgentId = selectedAgentOverride && team?.agents.some((agent) => agent.id === selectedAgentOverride)
    ? selectedAgentOverride
    : defaultAgentId;

  const { data: quality, loading: qualityLoading } = useAsync(
    () => (selectedAgentId ? getAgentConversationQuality(selectedAgentId) : Promise.resolve(undefined)),
    [selectedAgentId],
  );

  const { data: ruleFilteredCalls } = useAsync(
    () => (selectedAgentId && selectedRule ? listCallsForAgent(selectedAgentId, AGENT_RULE_CALLS_LIMIT) : Promise.resolve(undefined)),
    [selectedAgentId, selectedRule],
  );

  const issues = summary?.issuesByEnquiry;
  const selectedRuleLabel = quality?.rules.find((rule) => rule.rule === selectedRule)?.label;

  function openAttentionCalls() {
    setCallsFilter("Requires review");
    navigate("/calls");
  }

  function selectRule(rule: string) {
    setSelectedRule((prev) => (prev === rule ? null : rule));
  }

  const filteredCalls = useMemo(() => {
    if (selectedRule && ruleFilteredCalls) {
      return ruleFilteredCalls.filter((call) =>
        call.etiquette.some((entry) => entry.id === selectedRule && entry.status === "fail"));
    }
    if (!summary) return [];
    return summary.callsList.filter((call) => matchesFilter(call, filter));
  }, [summary, filter, selectedRule, ruleFilteredCalls]);

  if (loading || !summary) {
    return <Stack>Loading…</Stack>;
  }

  return (
    <Stack>
      <KpiGrid>
        <KpiCard
          value={summary.totalCalls.value}
          label="Total calls"
          contextLabel={summary.totalCalls.contextLabel}
        />
        <KpiCard value={summary.avgDuration.valueLabel} label="Average duration" contextLabel={summary.avgDuration.contextLabel}>
          <KpiProgressTrack percentOfTarget={summary.avgDuration.percentOfTarget} targetLabel={summary.avgDuration.targetLabel} />
        </KpiCard>
        <KpiCard
          value={`${summary.resolved.percent}%`}
          label="Resolved"
          contextLabel={summary.resolved.deltaLabel}
          visual={<MiniBarChart entries={summary.resolved.breakdown} />}
        />
        <KpiCard value={summary.attention.count} label="Requires attention" accent onClick={openAttentionCalls}>
          <GradientCtaVisual chips={summary.attention.chips} />
        </KpiCard>
      </KpiGrid>

      <ChartsGrid>
        <Card padding="content">
          <CardHeadRow>
            <div>
              <CardTitle>Conversation quality</CardTitle>
              <CardSubtitle>How consistently the agent follows call standards</CardSubtitle>
            </div>
            <RadarHeadRight>
              {quality && <AdherenceValue>{quality.overallAdherencePercent}% overall adherence</AdherenceValue>}
              {team && team.agents.length > 0 && (
                <AgentSelect
                  value={selectedAgentId ?? ""}
                  onChange={(event) => {
                    setSelectedAgentOverride(event.target.value);
                    setSelectedRule(null);
                  }}
                  aria-label="Select agent"
                >
                  {team.agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </AgentSelect>
              )}
            </RadarHeadRight>
          </CardHeadRow>
          {quality && !qualityLoading ? (
            <ConversationQualityRadar rules={quality.rules} selectedRule={selectedRule} onSelectRule={selectRule} />
          ) : (
            <RadarLoading>Loading agent data…</RadarLoading>
          )}
        </Card>

        <RightColumn>
          <IssuesCard padding="content">
            <IssuesHead>
              <CardTitle>Reported issues</CardTitle>
            </IssuesHead>
            {issues && issues.length > 0 ? (
              <IssueRows>
                {issues.map((issue) => (
                  <div key={issue.name}>
                    <IssueRowHead>
                      <span>{issue.name}</span>
                      <span>{issue.count}</span>
                    </IssueRowHead>
                    <IssueTrack>
                      <IssueFill $percent={issue.percent} $color={theme.colors.pastel.green[issue.colorIndex]} />
                    </IssueTrack>
                  </div>
                ))}
              </IssueRows>
            ) : (
              <IssuesEmpty>No issues reported.</IssuesEmpty>
            )}
          </IssuesCard>
          <CoachingCard padding="content">
            <CoachingVideoRing aria-hidden="true">
              <CoachingVideo
                src="/api/v1/assets/coaching-insight-video"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                tabIndex={-1}
              />
            </CoachingVideoRing>
            <CoachingCopy>
              <CoachingEyebrow>AI team coach</CoachingEyebrow>
              <CoachingTitle>Coaching focus</CoachingTitle>
              <CoachingText>
                {coachingLoading ? "Reviewing team performance…" : (coachingInsight ?? "Coaching insight unavailable right now.")}
              </CoachingText>
            </CoachingCopy>
          </CoachingCard>
        </RightColumn>
      </ChartsGrid>

      <Card padding="content">
        <CallsHeadRow>
          <CardTitle>Recent calls</CardTitle>
          <Spacer />
          {selectedRule ? (
            <RuleFilterChip type="button" onClick={() => setSelectedRule(null)}>
              {quality?.agentName} failed “{selectedRuleLabel}”
              <X size={13} strokeWidth={2.5} />
            </RuleFilterChip>
          ) : (
            <SegmentedControl items={homeFilterItems} value={filter} onChange={setFilter} variant="chips" aria-label="Filter calls" />
          )}
          <IconButton aria-label="Open full list" title="Open full list" onClick={() => navigate("/calls")}>
            <Maximize2 size={14} strokeWidth={2} />
          </IconButton>
        </CallsHeadRow>
        <CallsListWrap>
          <CallList
            calls={filteredCalls}
            emptyMessage={selectedRule ? "No calls failed this rule for this agent." : undefined}
            onOpen={(call) => navigate(call.kind === "recurring-group" ? `/recurring-groups/${call.id}` : `/calls/${call.id}`)}
            showActions
          />
        </CallsListWrap>
      </Card>
    </Stack>
  );
}

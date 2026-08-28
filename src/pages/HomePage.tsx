import { useEffect, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";
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
import { Maximize2, Sparkles, X } from "lucide-react";

type HomeFilter = "All" | "Attention" | "Recurring" | "Unresolved" | "Dropped";

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
  border: none;
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
`;

const IssuesEmpty = styled.div`
  padding: 32px 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const IssuesFooter = styled.div`
  padding-top: 16px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const IssuesCard = styled(Card)`
  display: grid;
  grid-template-rows: 7fr 3fr;
  gap: 18px;
`;

const IssuesTop = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const CoachingTile = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.panel};
  background: ${({ theme }) => theme.colors.tone.mild.chipBg};
`;

const CoachingHead = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.tone.mild.chipFg};
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  flex: none;
`;

const CoachingText = styled.div`
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
  overflow-y: auto;
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
`;

const homeFilterItems: { value: HomeFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Attention", label: "Attention" },
  { value: "Recurring", label: "Recurring" },
  { value: "Unresolved", label: "Unresolved" },
  { value: "Dropped", label: "Dropped" },
];

function matchesFilter(call: CallSummary, filter: HomeFilter): boolean {
  if (filter === "All") return true;
  if (filter === "Attention") return call.needsManagerAttention;
  if (filter === "Recurring") return call.status === "recurring";
  if (filter === "Dropped") return call.status === "dropped";
  return call.status === "unresolved";
}

export function HomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: summary, loading } = useAsync(() => getHomeSummary(), []);
  const { data: team } = useAsync(() => getTeamOverview(), []);
  const { data: coachingInsight, loading: coachingLoading } = useAsync(() => getTeamCoachingInsight(), []);
  const [filter, setFilter] = useState<HomeFilter>("All");
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAgentId || !team || team.agents.length === 0) return;
    const busiest = [...team.agents].sort((a, b) => b.callsCount - a.callsCount)[0]!;
    setSelectedAgentId(busiest.id);
  }, [team, selectedAgentId]);

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
                    setSelectedAgentId(event.target.value);
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

        <IssuesCard padding="content">
          <IssuesTop>
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
            <IssuesFooter>Tap a row to filter these calls</IssuesFooter>
          </IssuesTop>
          <CoachingTile>
            <CoachingHead>
              <Sparkles size={13} strokeWidth={2.5} />
              Coaching insight
            </CoachingHead>
            <CoachingText>
              {coachingLoading ? "Analyzing recent calls…" : (coachingInsight ?? "Coaching insight unavailable right now.")}
            </CoachingText>
          </CoachingTile>
        </IssuesCard>
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

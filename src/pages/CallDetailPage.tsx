import styled, { useTheme } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/primitives/Card";
import { Avatar } from "@/components/primitives/Avatar";
import { StatusPill } from "@/components/status/StatusPill";
import { AudioPlayerWaveform } from "@/components/waveform/AudioPlayerWaveform";
import { EtiquetteRuleList } from "@/components/etiquette/EtiquetteRuleList";
import { useAsync } from "@/hooks/useAsync";
import { getCallDetail } from "@/services/callsService";
import { formatDurationShort } from "@/utils/formatters";
import type { RecurringOccurrence, TranscriptLine as TranscriptLineData } from "@/types/call";
import { SHOW_TRANSCRIPT_TONE } from "@/config";
import { toneForAttentionScore } from "@/utils/tone";

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

const TitleBlock = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.025em;
`;

const Meta = styled.div`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const HeaderStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: ${({ theme }) => theme.spacing.stackGap};
  align-items: start;
`;

const ColStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
`;

const CardTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.025em;
`;

const TranscriptHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const TranscriptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const TranscriptEmpty = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 13px;
  font-weight: 600;
  padding: 8px 0;
`;

const TranscriptRow = styled.div`
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 14px;
  align-items: start;
`;

const TranscriptTime = styled.span`
  font-size: 11.5px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.faintAlt};
  padding-top: 12px;
`;

const Bubble = styled.div<{ $bg: string; $justify: string }>`
  background: ${({ $bg }) => $bg};
  border-radius: ${({ theme }) => theme.radii.panel};
  padding: 12px 16px;
  max-width: 88%;
  justify-self: ${({ $justify }) => $justify};
`;

const SpeakerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
`;

const SpeakerLabel = styled.span<{ $color: string }>`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
`;

const EmotionTag = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
`;

const EmotionDot = styled.span<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex: none;
`;

const BubbleText = styled.div`
  font-size: 13.5px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.transcript.bodyText};
  font-weight: 500;
`;

const SummaryHeading = styled.div`
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const ProblemGrid = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 12px;
`;

const ProblemItem = styled.div`
  background: ${({ theme }) => theme.colors.overlay.onGradientSoft};
  border-radius: ${({ theme }) => theme.radii.panel};
  padding: 11px 13px;
`;

const ProblemLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.overlay.onGradientLabel};
`;

const ProblemValue = styled.div`
  margin-top: 3px;
  font-size: 13px;
  line-height: 1.45;
  font-weight: 650;
`;

const FailureCard = styled(Card)`
  background: ${({ theme }) => theme.colors.chip.redSoft};
`;

const FailureHeading = styled.div`
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.chip.red.fg};
`;

const FailureBody = styled.div`
  font-size: 13.5px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 10px;
  font-weight: 500;
`;

const SummaryBody = styled.div`
  font-size: 13.5px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.overlay.onGradientStrong};
  margin-top: 10px;
  font-weight: 500;
`;

const VerdictBlock = styled.div`
  margin-top: 16px;
  background: ${({ theme }) => theme.colors.overlay.onGradientSoft};
  border-radius: ${({ theme }) => theme.radii.panelLg};
  padding: 13px 16px;
`;

const VerdictLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.overlay.onGradientLabel};
`;

const VerdictValue = styled.div`
  font-size: 15px;
  font-weight: 800;
  margin-top: 3px;
`;

const EtiquetteCardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const EtiquetteCardTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.025em;
`;

const ScoreRingWrap = styled.div`
  position: relative;
  display: inline-flex;

  &:hover > div:last-child {
    opacity: 1;
    visibility: visible;
  }
`;

const ScoreRing = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 3px solid ${({ $color }) => $color};
  color: ${({ $color }) => $color};
  font-size: 16px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  cursor: default;
`;

const ScoreTooltipPanel = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 200;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease;
  pointer-events: none;
  min-width: 240px;
  padding: 11px 15px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.qualityStack.fail.tooltipBg};
  box-shadow: ${({ theme }) => theme.colors.qualityStack.tooltipShadow};
`;

const ScoreTooltipLabel = styled.div`
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.qualityStack.tooltipLabelFg};
  margin-bottom: 6px;
`;

const ScoreTooltipRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 16px;
  justify-content: space-between;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.qualityStack.tooltipVerdictFg};

  & + & {
    margin-top: 3px;
  }
`;

const ScoreTooltipValue = styled.span`
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.qualityStack.tooltipLabelFg};
`;

const ScoreTooltipTotal = styled(ScoreTooltipRow)`
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
`;

const RecurringHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RecurringTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.025em;
`;

const RecurringBadge = styled.span`
  padding: 4px 11px;
  border-radius: 13px;
  background: ${({ theme }) => theme.colors.tone.caution.chipBg};
  color: ${({ theme }) => theme.colors.tone.caution.chipFg};
  font-size: 11.5px;
  font-weight: 800;
`;

const RecurringList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const RecurringRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 700;
`;

const RecurringDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex: none;
`;

const RecurringLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  width: 54px;
  flex: none;
`;

const RecurringDay = styled.span`
  flex: 1;
`;

const RecurringDuration = styled.span`
  color: ${({ theme }) => theme.colors.text.faintAlt};
`;

export function CallDetailPage() {
  const { callId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: call, loading } = useAsync(() => getCallDetail(callId!), [callId]);

  if (loading || !call) return <Stack>Loading…</Stack>;

  return (
    <Stack>
      <HeaderCard>
        <BackLink type="button" onClick={() => navigate("/calls")}>
          ← Calls
        </BackLink>
        <Avatar initials={call.avatarInitials} tintIndex={call.avatarTintIndex} shape="rounded-square" size={46} fontSize={14} />
        <TitleBlock>
          <Title>{call.title}</Title>
          <Meta>
            Customer {call.customerRef} · Agent {call.agentName} · {formatDurationShort(call.durationSeconds)} · Call {call.callNumber}
          </Meta>
        </TitleBlock>
        <HeaderStatus>
          <StatusPill status={call.status} />
        </HeaderStatus>
      </HeaderCard>

      <Columns>
        <ColStack>
          <Card padding="content">
            <AudioPlayerWaveform key={call.id} call={call} />
          </Card>

          <Card padding="content">
            <TranscriptHead>
              <CardTitle>Transcript</CardTitle>
            </TranscriptHead>
            <TranscriptList>
              {call.transcript.length === 0 ? (
                <TranscriptEmpty>
                  {call.failureReason ? "Transcription did not complete for this call." : "No transcript is available for this call."}
                </TranscriptEmpty>
              ) : (
                call.transcript.map((line) => (
                  <TranscriptLine key={line.timestampLabel + line.text} line={line} />
                ))
              )}
            </TranscriptList>
          </Card>
        </ColStack>

        <ColStack>
          {call.failureReason ? (
            <FailureCard padding="content">
              <FailureHeading>Processing failed</FailureHeading>
              <FailureBody>{call.failureReason}</FailureBody>
            </FailureCard>
          ) : (
            <Card padding="content" accent>
              <SummaryHeading>AI summary</SummaryHeading>
              <SummaryBody>{call.aiSummary}</SummaryBody>
              <VerdictBlock>
                <VerdictLabel>Verdict</VerdictLabel>
                <VerdictValue>{call.verdict}</VerdictValue>
              </VerdictBlock>
              {call.qualityFeedback && (
                <VerdictBlock>
                  <VerdictLabel>Quality feedback</VerdictLabel>
                  <VerdictValue>{call.qualityFeedback}</VerdictValue>
                </VerdictBlock>
              )}
            </Card>
          )}

          {call.etiquetteApplicable && (
            <Card padding="content">
              <EtiquetteCardHead>
                <EtiquetteCardTitle>Call etiquette</EtiquetteCardTitle>
                {call.managerAttention && call.managerAttention.score > 50 && (
                  <ScoreRingWrap>
                    <ScoreRing $color={theme.colors.tone[toneForAttentionScore(call.managerAttention.score)].chipFg}>
                      {call.managerAttention.score}
                    </ScoreRing>
                    <ScoreTooltipPanel>
                      <ScoreTooltipLabel>How this score was calculated</ScoreTooltipLabel>
                      {call.managerAttention.factors.map((factor) => (
                        <ScoreTooltipRow key={`${factor.label}-${factor.value}`}>
                          <span>{factor.label}</span>
                          <ScoreTooltipValue>{factor.kind === "ADDITION" ? "+" : ""}{factor.value}</ScoreTooltipValue>
                        </ScoreTooltipRow>
                      ))}
                      {call.managerAttention.rawScore > call.managerAttention.score && (
                        <ScoreTooltipRow>
                          <span>Raw total</span>
                          <ScoreTooltipValue>{call.managerAttention.rawScore}</ScoreTooltipValue>
                        </ScoreTooltipRow>
                      )}
                      <ScoreTooltipTotal>
                        <span>
                          Manager attention score
                          {call.managerAttention.rawScore > call.managerAttention.score && " (rounds to 99)"}
                        </span>
                        <ScoreTooltipValue>{call.managerAttention.score}</ScoreTooltipValue>
                      </ScoreTooltipTotal>
                    </ScoreTooltipPanel>
                  </ScoreRingWrap>
                )}
              </EtiquetteCardHead>
              <EtiquetteRuleList rules={call.etiquette} evidence={call.ruleEvidence} />
            </Card>
          )}

          {call.customerProblem && (
            <Card padding="content" accent>
              <SummaryHeading>Customer’s Problem</SummaryHeading>
              <ProblemGrid>
                <ProblemItem><ProblemLabel>Problem</ProblemLabel><ProblemValue>{call.customerProblem.summary}</ProblemValue></ProblemItem>
                <ProblemItem><ProblemLabel>Category</ProblemLabel><ProblemValue>{call.customerProblem.category}</ProblemValue></ProblemItem>
                <ProblemItem><ProblemLabel>Requested outcome</ProblemLabel><ProblemValue>{call.customerProblem.requestedOutcome}</ProblemValue></ProblemItem>
                <ProblemItem><ProblemLabel>Transcript evidence</ProblemLabel><ProblemValue>{call.customerProblem.evidence}</ProblemValue></ProblemItem>
              </ProblemGrid>
            </Card>
          )}

          {call.recurringIssue && (
            <Card padding="content">
              <RecurringHead>
                <RecurringTitle>Recurring issue</RecurringTitle>
                <RecurringBadge>{call.recurringIssue.countLabel}</RecurringBadge>
              </RecurringHead>
              <RecurringList>
                {call.recurringIssue.occurrences.map((occurrence) => (
                  <RecurringRowItem key={occurrence.label} occurrence={occurrence} />
                ))}
              </RecurringList>
            </Card>
          )}
        </ColStack>
      </Columns>
    </Stack>
  );
}

function RecurringRowItem({ occurrence }: Readonly<{ occurrence: RecurringOccurrence }>) {
  const theme = useTheme();
  return (
    <RecurringRow>
      <RecurringDot $color={theme.colors.tone[occurrence.tone].solid} />
      <RecurringLabel>{occurrence.label}</RecurringLabel>
      <RecurringDay>{occurrence.dateLabel}</RecurringDay>
      <RecurringDuration>{occurrence.durationLabel}</RecurringDuration>
    </RecurringRow>
  );
}

function TranscriptLine({ line }: Readonly<{ line: TranscriptLineData }>) {
  const theme = useTheme();
  const isAgent = line.speaker === "agent";
  const emotion = SHOW_TRANSCRIPT_TONE ? line.emotion : undefined;
  const emotionColor = emotion ? theme.colors.tone[emotion.tone].chipFg : undefined;
  return (
    <TranscriptRow>
      <TranscriptTime>{line.timestampLabel}</TranscriptTime>
      <Bubble
        $bg={
          emotion?.tone === "critical"
            ? theme.colors.chip.redSoft
            : isAgent
              ? theme.colors.transcript.agentBubbleBg
              : theme.colors.transcript.customerBubbleBg
        }
        $justify={isAgent ? "start" : "end"}
      >
        <SpeakerRow>
          <SpeakerLabel $color={isAgent ? theme.colors.text.muted : theme.colors.accent.green}>{line.speaker}</SpeakerLabel>
          {emotion && emotionColor && (
            <EmotionTag $color={emotionColor}>
              <EmotionDot $color={emotionColor} />
              {emotion.label}
            </EmotionTag>
          )}
        </SpeakerRow>
        <BubbleText>{line.text}</BubbleText>
      </Bubble>
    </TranscriptRow>
  );
}

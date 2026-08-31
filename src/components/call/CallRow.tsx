import styled from "styled-components";
import { ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/primitives/Avatar";
import { StatusPill } from "@/components/status/StatusPill";
import { SentimentWaveform } from "@/components/waveform/SentimentWaveform";
import { EtiquetteDotsCompact } from "@/components/etiquette/EtiquetteDotsCompact";
import type { CallSummary } from "@/types/call";
import { formatDurationShort } from "@/utils/formatters";
import { labelForCallStatus, toneForCallStatus } from "@/utils/tone";
import { AttentionScoreStatusPill } from "@/components/attention/AttentionScoreStatusPill";

export type CallRowDensity = "comfortable" | "compact";

export interface CallRowProps {
  call: CallSummary;
  onOpen: (call: CallSummary) => void;
  density?: CallRowDensity;
  showActions?: boolean;
  /** Set by the page, not derived per-row, so every row in a list shares
   * one grid template and lines up with a matching table header. */
  wideScore?: boolean;
}

const Row = styled.div<{ $density: CallRowDensity; $showActions: boolean; $wideScore: boolean }>`
  display: grid;
  grid-template-columns: ${({ $showActions, $wideScore }) => {
    if ($wideScore) return "1.5fr 2.6fr 52px 168px 198px";
    return $showActions ? "1.5fr 2.6fr 52px 168px 138px 60px" : "1.5fr 2.6fr 52px 168px 138px";
  }};
  gap: 18px;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: ${({ $density }) => ($density === "compact" ? "9px" : "14px")} 12px;
  border-radius: ${({ theme }) => theme.radii.panel};
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.surface.hover};
    }
  }

  &:active {
    transform: scale(0.998);
  }

  &:focus-visible {
    outline: none;
    background: ${({ theme }) => theme.colors.surface.hover};
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.colors.interaction.focusOutline};
  }
`;

const CustomerCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const CustomerText = styled.div`
  min-width: 0;

  strong {
    display: block;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  small {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.muted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const RankBadge = styled.div`
  width: 38px;
  height: 38px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.panel};
  background: ${({ theme }) => theme.colors.chip.redSoft};
  color: ${({ theme }) => theme.colors.chip.red.fg};
  font-size: 12px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
`;

const Duration = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-variant-numeric: tabular-nums;
`;

const GroupSequence = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
`;

const GroupStepWrap = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
`;

const GroupStep = styled.div<{ $tone: ReturnType<typeof toneForCallStatus> }>`
  min-width: 0;
  flex: 1;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.panel};
  background: ${({ theme, $tone }) => theme.colors.tone[$tone].chipBg};
  color: ${({ theme, $tone }) => theme.colors.tone[$tone].chipFg};
`;

const GroupStepLabel = styled.div`
  font-size: 10.5px;
  font-weight: 900;
  line-height: 1.35;
  overflow-wrap: break-word;
`;

const GroupStepTitle = styled.div`
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 10.5px;
  font-weight: 650;
  line-height: 1.35;
  overflow-wrap: break-word;
`;

const GroupConnector = styled.div`
  width: 14px;
  height: 2px;
  flex: none;
  background: ${({ theme }) => theme.colors.line.input};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.icon.faint};
`;

export function CallRow({ call, onOpen, density = "comfortable", showActions = false, wideScore = false }: Readonly<CallRowProps>) {
  const showArrow = showActions && !wideScore;
  return (
    <Row
      role="button"
      tabIndex={0}
      $density={density}
      $showActions={showArrow}
      $wideScore={wideScore}
      onClick={() => onOpen(call)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(call);
        }
      }}
    >
      <CustomerCell>
        {call.managerAttention?.rank
          ? <RankBadge>#{call.managerAttention.rank}</RankBadge>
          : <Avatar initials={call.avatarInitials} tintIndex={call.avatarTintIndex} />}
        <CustomerText>
          <strong>{call.title}</strong>
          <small>
            {call.managerAttention
              ? `Agent: ${call.agentName} · Waiting ${call.managerAttention.waitingHours}h`
              : <>{call.kind === "recurring-group" && call.callCount ? `${call.callCount} calls · ` : ""}
                {call.agentName} · {call.customerName} {call.customerRef}</>}
          </small>
        </CustomerText>
      </CustomerCell>

      {call.kind === "recurring-group" && call.groupCalls ? (
        <GroupSequence aria-label={`${call.groupCalls.length} related calls`}>
          {call.groupCalls.map((groupCall, index) => (
            <GroupStepWrap key={groupCall.id}>
              <GroupStep $tone={toneForCallStatus(groupCall.status)} title={groupCall.title}>
                <GroupStepLabel>Call {groupCall.sequenceNumber} · {labelForCallStatus(groupCall.status)}</GroupStepLabel>
                <GroupStepTitle>{groupCall.title}</GroupStepTitle>
              </GroupStep>
              {index < call.groupCalls!.length - 1 && <GroupConnector />}
            </GroupStepWrap>
          ))}
        </GroupSequence>
      ) : (
        <SentimentWaveform seed={call.waveSeed} spans={call.sentimentSpans} size="sm" />
      )}

      <Duration>{formatDurationShort(call.durationSeconds)}</Duration>

      <EtiquetteDotsCompact rules={call.etiquette} hideTrailingCount={Boolean(call.managerAttention)} />

      <div style={call.managerAttention ? { minWidth: 0 } : { justifySelf: "start" }}>
        {call.managerAttention
          ? <AttentionScoreStatusPill score={call.managerAttention.score} status={call.status} />
          : <StatusPill status={call.status} />}
      </div>

      {showArrow && (
        <Actions aria-label="Open detail page">
          <ArrowUpRight size={18} aria-hidden />
        </Actions>
      )}
    </Row>
  );
}

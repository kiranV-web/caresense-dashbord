import styled from "styled-components";
import { Download, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/primitives/Avatar";
import { StatusPill } from "@/components/status/StatusPill";
import { SentimentWaveform } from "@/components/waveform/SentimentWaveform";
import { EtiquetteDotsCompact } from "@/components/etiquette/EtiquetteDotsCompact";
import type { CallSummary } from "@/types/call";
import { formatDurationShort } from "@/utils/formatters";
import { labelForCallStatus, toneForCallStatus } from "@/utils/tone";

export type CallRowDensity = "comfortable" | "compact";

export interface CallRowProps {
  call: CallSummary;
  onOpen: (call: CallSummary) => void;
  density?: CallRowDensity;
  showActions?: boolean;
}

const Row = styled.div<{ $density: CallRowDensity; $showActions: boolean }>`
  display: grid;
  grid-template-columns: ${({ $showActions }) => ($showActions ? "1.5fr 2.6fr 52px 168px 138px 60px" : "1.5fr 2.6fr 52px 168px 138px")};
  gap: 18px;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: ${({ $density }) => ($density === "compact" ? "9px" : "14px")} 12px;
  border-radius: ${({ theme }) => theme.radii.panel};
  cursor: pointer;
  transition: background 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
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

const Duration = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
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
  white-space: nowrap;
`;

const GroupStepTitle = styled.div`
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 10.5px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;

  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

export function CallRow({ call, onOpen, density = "comfortable", showActions = false }: Readonly<CallRowProps>) {
  return (
    <Row
      role="button"
      tabIndex={0}
      $density={density}
      $showActions={showActions}
      onClick={() => onOpen(call)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(call);
        }
      }}
    >
      <CustomerCell>
        <Avatar initials={call.avatarInitials} tintIndex={call.avatarTintIndex} />
        <CustomerText>
          <strong>{call.title}</strong>
          <small>
            {call.kind === "recurring-group" && call.callCount ? `${call.callCount} calls · ` : ""}
            {call.agentName} · {call.customerName} {call.customerRef}
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

      <EtiquetteDotsCompact rules={call.etiquette} />

      <div style={{ justifySelf: "start" }}>
        <StatusPill status={call.status} />
      </div>

      {showActions && call.kind !== "recurring-group" && (
        <Actions>
          <IconButton
            as="a"
            href={call.audioUrl}
            download={`call-${call.externalId}.mp3`}
            aria-label="Download recording"
            onClick={(event) => event.stopPropagation()}
          >
            <Download size={16} />
          </IconButton>
          <ChevronRight size={18} aria-hidden />
        </Actions>
      )}
      {showActions && call.kind === "recurring-group" && (
        <Actions><ChevronRight size={18} aria-hidden /></Actions>
      )}
    </Row>
  );
}

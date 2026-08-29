import styled from "styled-components";
import { CallRow, type CallRowDensity } from "./CallRow";
import { QualityTooltip } from "@/components/etiquette/QualityTooltip";
import type { CallSummary } from "@/types/call";

export interface CallListProps {
  calls: CallSummary[];
  onOpen: (call: CallSummary) => void;
  density?: CallRowDensity;
  showActions?: boolean;
  /** Use the wider attention-score column (and drop the trailing action
   * column) — pass only from a page whose header is laid out to match. */
  wideScore?: boolean;
  emptyMessage?: string;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Empty = styled.div`
  padding: 32px 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
`;

export function CallList({ calls, onOpen, density, showActions, wideScore, emptyMessage = "No calls match this view." }: Readonly<CallListProps>) {
  if (calls.length === 0) {
    return <Empty>{emptyMessage}</Empty>;
  }

  return (
    <List>
      {calls.map((call) => (
        <CallRow key={call.id} call={call} onOpen={onOpen} density={density} showActions={showActions} wideScore={wideScore} />
      ))}
      <QualityTooltip />
    </List>
  );
}

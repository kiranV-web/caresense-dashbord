import styled from "styled-components";
import { CallList, type CallListProps } from "./CallList";

const TableHead = styled.div<{ $wideScore: boolean }>`
  display: grid;
  grid-template-columns: ${({ $wideScore }) => ($wideScore ? "1.5fr 2.6fr 52px 168px 198px" : "1.5fr 2.6fr 52px 168px 138px 60px")};
  gap: 18px;
  padding: 10px 12px;
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.text.faintAlt};
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export interface CallTableProps extends CallListProps {
  primaryColumnLabel?: string;
  statusColumnLabel?: string;
}

/** The Calls page's table look (column header + rows) — reused everywhere a call
 * list appears (Home, Agent detail, Customer detail) so every listing in the app
 * shares one presentation instead of each page inventing its own. */
export function CallTable({
  calls, onOpen, density, showActions = true, wideScore = false, emptyMessage,
  primaryColumnLabel, statusColumnLabel,
}: Readonly<CallTableProps>) {
  return (
    <div>
      <TableHead $wideScore={wideScore}>
        <span>{primaryColumnLabel ?? (wideScore ? "Rank / call" : "Customer / summary")}</span>
        <span>Sentiment waveform</span>
        <span>Time</span>
        <span>Etiquette</span>
        <span>{statusColumnLabel ?? (wideScore ? "Attention score & status" : "Status")}</span>
        {!wideScore && <span />}
      </TableHead>
      <CallList
        calls={calls} onOpen={onOpen} density={density} showActions={showActions}
        wideScore={wideScore} emptyMessage={emptyMessage}
      />
    </div>
  );
}

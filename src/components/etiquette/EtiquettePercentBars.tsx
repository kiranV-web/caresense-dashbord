import styled, { useTheme } from "styled-components";
import { ProgressBar } from "@/components/primitives/ProgressBar";
import type { AgentEtiquettePercent } from "@/types/agent";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const RowHead = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 7px;

  span:last-child {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export function EtiquettePercentBars({ entries }: Readonly<{ entries: AgentEtiquettePercent[] }>) {
  const theme = useTheme();
  return (
    <List>
      {entries.map((entry) => (
        <div key={entry.label}>
          <RowHead>
            <span>{entry.label}</span>
            <span>{entry.percent}%</span>
          </RowHead>
          <ProgressBar
            percent={entry.percent}
            color={entry.percent < 90 ? theme.colors.tone.caution.solid : theme.colors.pastel.green[0]}
          />
        </div>
      ))}
    </List>
  );
}

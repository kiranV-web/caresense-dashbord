import styled, { useTheme } from "styled-components";
import type { ResolvedBreakdownEntry } from "@/types/kpi";

const Row = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 9px;
  height: 66px;
`;

const BarColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const ValueLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Bar = styled.div<{ $height: number; $color: string }>`
  width: 15px;
  height: ${({ $height }) => $height}px;
  border-radius: 5px;
  background: ${({ $color }) => $color};
`;

const BarLabel = styled.span`
  font-size: 9.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.faint};
`;

export function MiniBarChart({ entries }: Readonly<{ entries: ResolvedBreakdownEntry[] }>) {
  const theme = useTheme();
  return (
    <Row>
      {entries.map((entry) => (
        <BarColumn key={entry.label}>
          <ValueLabel>{entry.value}</ValueLabel>
          <Bar $height={(entry.heightPercent / 100) * 38} $color={theme.colors.tone[entry.tone].solid} />
          <BarLabel>{entry.label}</BarLabel>
        </BarColumn>
      ))}
    </Row>
  );
}

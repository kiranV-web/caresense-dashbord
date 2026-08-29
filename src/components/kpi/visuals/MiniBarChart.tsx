import styled, { keyframes, useTheme } from "styled-components";
import type { ResolvedBreakdownEntry } from "@/types/kpi";

const Row = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 9px;
  height: 66px;
  margin-top: 15px;
  margin-right: 10px;
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

const growIn = keyframes`
  from {
    opacity: 0;
    transform: scaleY(0.4);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
`;

const Bar = styled.div<{ $height: number; $color: string; $delayMs: number }>`
  width: 15px;
  height: ${({ $height }) => $height}px;
  border-radius: 5px;
  background: ${({ $color }) => $color};
  transform-origin: bottom;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${growIn} 320ms cubic-bezier(0.22, 0.61, 0.36, 1) ${({ $delayMs }) => $delayMs}ms both;
  }
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
      {entries.map((entry, index) => (
        <BarColumn key={entry.label}>
          <ValueLabel>{entry.value}</ValueLabel>
          <Bar
            $height={(entry.heightPercent / 100) * 38}
            $color={theme.colors.tone[entry.tone].solid}
            $delayMs={index * 60}
          />
          <BarLabel>{entry.label}</BarLabel>
        </BarColumn>
      ))}
    </Row>
  );
}

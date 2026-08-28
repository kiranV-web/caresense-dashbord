import styled, { useTheme } from "styled-components";
import type { HeatmapCell, HeatmapLevel } from "@/types/agent";

export interface ActivityHeatmapProps {
  cells: HeatmapCell[];
  cellSize?: number;
  onCellClick?: (cell: HeatmapCell, index: number) => void;
}

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 700;
`;

const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Swatch = styled.i<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
  display: block;
`;

const Grid = styled.div<{ $cellSize: number }>`
  display: grid;
  grid-template-rows: repeat(7, ${({ $cellSize }) => $cellSize}px);
  grid-auto-flow: column;
  grid-auto-columns: ${({ $cellSize }) => $cellSize}px;
  gap: 5px;
`;

const Cell = styled.div<{ $color: string; $clickable: boolean }>`
  border-radius: 4px;
  background: ${({ $color }) => $color};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: transform 0.16s ease, box-shadow 0.16s ease;

  ${({ $clickable }) => $clickable && `
    @media (hover: hover) {
      &:hover {
        transform: scale(1.18);
      }
    }
  `}

  &:focus-visible {
    outline: none;
    transform: scale(1.18);
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }
`;

const legendOrder: { level: HeatmapLevel; label: string }[] = [
  { level: "good", label: "Resolved" },
  { level: "difficult", label: "Unresolved / escalated" },
  { level: "rude", label: "Needs review / recurring / rude" },
  { level: "low", label: "Dropped" },
];

export function ActivityHeatmapLegend() {
  const theme = useTheme();
  return (
    <Legend>
      {legendOrder.map(({ level, label }) => (
        <LegendItem key={level}>
          <Swatch $color={theme.colors.heatmap[level]} />
          {label}
        </LegendItem>
      ))}
    </Legend>
  );
}

export function ActivityHeatmap({ cells, cellSize = 14, onCellClick }: Readonly<ActivityHeatmapProps>) {
  const theme = useTheme();
  return (
    <Grid $cellSize={cellSize}>
      {cells.map((cell, i) => (
        <Cell
          key={`${cell.tooltip}-${i}`}
          title={cell.tooltip}
          $color={theme.colors.heatmap[cell.level]}
          $clickable={Boolean(onCellClick)}
          role={onCellClick ? "button" : undefined}
          tabIndex={onCellClick ? 0 : undefined}
          aria-label={onCellClick ? cell.tooltip : undefined}
          onClick={onCellClick ? () => onCellClick(cell, i) : undefined}
          onKeyDown={onCellClick ? (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onCellClick(cell, i);
            }
          } : undefined}
        />
      ))}
    </Grid>
  );
}

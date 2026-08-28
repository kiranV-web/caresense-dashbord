import styled, { useTheme } from "styled-components";
import type { HeatmapCell } from "@/types/agent";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 4px;
  margin-top: 16px;
`;

const Cell = styled.div<{ $color: string; $clickable: boolean }>`
  height: 9px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
`;

export interface MiniActivityStripProps {
  cells: HeatmapCell[];
  onCellClick?: (cell: HeatmapCell) => void;
}

/** The 14-column, 2-row mini activity strip on Team's agent cards. */
export function MiniActivityStrip({ cells, onCellClick }: Readonly<MiniActivityStripProps>) {
  const theme = useTheme();
  return (
    <Grid>
      {cells.map((cell, i) => (
        <Cell
          key={`${cell.tooltip}-${i}`}
          title={cell.tooltip}
          $color={theme.colors.heatmap[cell.level]}
          $clickable={Boolean(onCellClick)}
          onClick={onCellClick ? (event) => { event.stopPropagation(); onCellClick(cell); } : undefined}
        />
      ))}
    </Grid>
  );
}

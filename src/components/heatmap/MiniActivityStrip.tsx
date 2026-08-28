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
  transition: transform 0.16s ease, box-shadow 0.16s ease;

  @media (hover: hover) {
    &:hover {
      transform: ${({ $clickable }) => ($clickable ? "scaleY(1.45)" : "none")};
    }
  }

  &:focus-visible {
    outline: none;
    transform: scaleY(1.45);
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }
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
          role={onCellClick ? "button" : undefined}
          tabIndex={onCellClick ? 0 : undefined}
          aria-label={onCellClick ? cell.tooltip : undefined}
          onClick={onCellClick ? (event) => { event.stopPropagation(); onCellClick(cell); } : undefined}
          onKeyDown={onCellClick ? (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              onCellClick(cell);
            }
          } : undefined}
        />
      ))}
    </Grid>
  );
}

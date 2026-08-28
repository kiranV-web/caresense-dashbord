import styled, { useTheme } from "styled-components";

export interface AppTileProps {
  /** Tile size in px. Corner radius and mark placement scale off this. */
  size?: number;
  className?: string;
}

// Mark occupies ~56% of the tile width, using the small (<=20px) geometry
// since it's always rendered small here, reversed for the dark tile. Shifted
// 1.5% of the tile width left of true centre — the mark's own weight sits
// left of its viewBox centre (the dot at x=14 of 48), so a true geometric
// centre reads as drifting right.
const MARK_WIDTH_RATIO = 0.56;
const MARK_VIEWBOX = 48;
const LEFT_SHIFT_RATIO = 0.015;
const CORNER_RADIUS_RATIO = 0.28;

const Tile = styled.svg`
  display: block;
`;

export function AppTile({ size = 46, className }: Readonly<AppTileProps>) {
  const theme = useTheme();
  const scale = (size * MARK_WIDTH_RATIO) / MARK_VIEWBOX;
  const centeredOffset = (size - size * MARK_WIDTH_RATIO) / 2;
  const offsetX = centeredOffset - size * LEFT_SHIFT_RATIO;

  return (
    <Tile viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Call Sense" className={className}>
      <rect width={size} height={size} rx={size * CORNER_RADIUS_RATIO} fill={theme.colors.text.primary} />
      <g transform={`translate(${offsetX} ${centeredOffset}) scale(${scale})`}>
        <circle cx="14" cy="24" r="6" fill={theme.colors.logo.dotAndInner.dark} />
        <path d="M22.36 14.04 A13 13 0 0 1 22.36 33.96" fill="none" stroke={theme.colors.logo.dotAndInner.dark}
          strokeWidth="6" strokeLinecap="round" />
        <path d="M28.78 6.38 A23 23 0 0 1 28.78 41.62" fill="none" stroke={theme.colors.logo.outerArc.small}
          strokeWidth="6" strokeLinecap="round" />
      </g>
    </Tile>
  );
}

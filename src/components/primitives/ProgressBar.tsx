import styled, { useTheme } from "styled-components";

export interface ProgressBarProps {
  percent: number;
  color?: string;
  trackColor?: string;
  height?: number;
  /** Renders a small marker at the track's end, e.g. the avg-duration KPI's target line. */
  showTargetMarker?: boolean;
}

const Track = styled.div<{ $track: string; $height: number }>`
  position: relative;
  height: ${({ $height }) => $height}px;
  border-radius: ${({ $height }) => $height / 2}px;
  background: ${({ $track }) => $track};
`;

const Fill = styled.div<{ $percent: number; $color: string; $height: number }>`
  height: ${({ $height }) => $height}px;
  width: ${({ $percent }) => Math.max(0, Math.min(100, $percent))}%;
  border-radius: ${({ $height }) => $height / 2}px;
  background: ${({ $color }) => $color};
`;

const TargetMarker = styled.div`
  position: absolute;
  left: 100%;
  top: -5px;
  width: 2px;
  height: 18px;
  border-radius: 1px;
  background: ${({ theme }) => theme.colors.kpi.progressMarker};
`;

export function ProgressBar({
  percent,
  color,
  trackColor,
  height = 8,
  showTargetMarker = false,
}: Readonly<ProgressBarProps>) {
  const theme = useTheme();
  return (
    <Track $track={trackColor ?? theme.colors.surface.muted} $height={height}>
      <Fill $percent={percent} $color={color ?? theme.colors.accent.green} $height={height} />
      {showTargetMarker && <TargetMarker />}
    </Track>
  );
}

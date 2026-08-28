import styled, { useTheme } from "styled-components";
import { useMemo } from "react";
import type { SentimentSpan } from "@/types/call";
import { generateBars } from "./generateBars";

export type WaveformSize = "sm" | "lg";

export interface SentimentWaveformProps {
  seed: number;
  spans: SentimentSpan[];
  size?: WaveformSize;
  barCount?: number;
  /** 0..1 playback position — bars past this point render at reduced
   * opacity; bars already played show their real, full-strength colour. */
  progressFraction?: number;
  onSeek?: (fraction: number) => void;
}

const sizeConfig = {
  sm: { barCount: 64, height: 36 },
  lg: { barCount: 120, height: 104 },
};

const Row = styled.div<{ $height: number; $interactive: boolean }>`
  display: flex;
  align-items: center;
  gap: 2px;
  height: ${({ $height }) => $height}px;
  ${({ $interactive }) => $interactive && "cursor: pointer;"}
`;

const Bar = styled.div<{ $heightPercent: number; $color: string; $dimmed: boolean }>`
  flex: 1;
  border-radius: ${({ theme }) => theme.radii.waveformBar};
  height: ${({ $heightPercent }) => $heightPercent}%;
  background: ${({ $color }) => $color};
  opacity: ${({ $dimmed }) => ($dimmed ? 0.72 : 1)};
  transition: opacity 0.15s ease;
`;

export function SentimentWaveform({
  seed,
  spans,
  size = "sm",
  barCount,
  progressFraction,
  onSeek,
}: Readonly<SentimentWaveformProps>) {
  const theme = useTheme();
  const config = sizeConfig[size];
  const count = barCount ?? config.barCount;
  const bars = useMemo(() => generateBars(seed, spans, count), [seed, spans, count]);

  return (
    <Row
      $height={config.height}
      $interactive={Boolean(onSeek)}
      role={onSeek ? "slider" : undefined}
      aria-label={onSeek ? "Sentiment waveform, click to seek" : "Sentiment waveform"}
    >
      {bars.map((bar) => (
        <Bar
          key={bar.fraction}
          title={bar.tooltip || undefined}
          $heightPercent={bar.heightPercent}
          $color={theme.colors.tone[bar.color].wave}
          $dimmed={progressFraction !== undefined && bar.fraction > progressFraction}
          onClick={onSeek ? () => onSeek(bar.fraction) : undefined}
        />
      ))}
    </Row>
  );
}

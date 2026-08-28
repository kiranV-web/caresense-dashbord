import type { SentimentSpan } from "@/types/call";

export interface WaveformBar {
  heightPercent: number;
  tooltip: string;
  color: "neutral" | SentimentSpan["tone"];
  fraction: number;
}

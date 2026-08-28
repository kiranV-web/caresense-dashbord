import { createSeededRandom } from "@/utils/seededRandom";
import type { SentimentSpan } from "@/types/call";
import type { WaveformBar } from "./waveform.types";

/** Ports the reference prototype's bar-height formula so the visual matches exactly. */
export function generateBars(seed: number, spans: SentimentSpan[], count: number): WaveformBar[] {
  const random = createSeededRandom(seed);
  return Array.from({ length: count }, (_, i) => {
    const fraction = i / count;
    const span = spans.find((s) => fraction >= s.start && fraction < s.end);
    const base = 26 + random() * 62 * (0.55 + Math.sin(fraction * 7) * 0.45 + 0.4);
    return {
      heightPercent: Math.max(12, Math.min(100, base)),
      color: span ? span.tone : "neutral",
      tooltip: span?.tooltip ?? "",
      fraction,
    };
  });
}

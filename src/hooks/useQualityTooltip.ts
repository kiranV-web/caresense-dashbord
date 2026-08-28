import { useSyncExternalStore } from "react";
import { getQualityTooltip, subscribeQualityTooltip, type QualityTooltipState } from "@/services/qualityTooltipStore";

export function useQualityTooltip(): QualityTooltipState | null {
  return useSyncExternalStore(subscribeQualityTooltip, getQualityTooltip);
}

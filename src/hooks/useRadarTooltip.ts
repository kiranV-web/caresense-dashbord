import { useSyncExternalStore } from "react";
import { getRadarTooltip, subscribeRadarTooltip, type RadarTooltipState } from "@/services/radarTooltipStore";

export function useRadarTooltip(): RadarTooltipState | null {
  return useSyncExternalStore(subscribeRadarTooltip, getRadarTooltip);
}

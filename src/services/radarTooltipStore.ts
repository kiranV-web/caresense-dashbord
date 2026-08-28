export interface RadarTooltipState {
  label: string;
  agentPercent: number | null;
  teamPercent: number;
  target: number;
  failCount: number;
  totalCalls: number;
  x: number;
  y: number;
}

let state: RadarTooltipState | null = null;
const listeners = new Set<() => void>();

export function getRadarTooltip(): RadarTooltipState | null {
  return state;
}

export function setRadarTooltip(next: RadarTooltipState | null): void {
  state = next;
  listeners.forEach((listener) => listener());
}

export function subscribeRadarTooltip(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

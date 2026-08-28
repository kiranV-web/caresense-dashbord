export interface QualityTooltipState {
  label: string;
  passed: boolean;
  x: number;
  y: number;
}

let state: QualityTooltipState | null = null;
const listeners = new Set<() => void>();

export function getQualityTooltip(): QualityTooltipState | null {
  return state;
}

export function setQualityTooltip(next: QualityTooltipState | null): void {
  state = next;
  listeners.forEach((listener) => listener());
}

export function subscribeQualityTooltip(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

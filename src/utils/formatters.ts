/** 278 -> "4:38" */
export function formatDurationShort(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** 274 -> "4m 34s" */
export function formatDurationLong(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** "1:14" -> 74 (seconds) */
export function parseTimestampLabel(label: string): number {
  const [minutes, seconds] = label.split(":").map(Number);
  return minutes * 60 + (seconds || 0);
}

export function initialsFromName(name: string | null | undefined, fallback: string): string {
  const source = name?.trim() || fallback;
  const parts = source.split(/\s+/u).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

export function displayName(name: string | null | undefined, fallback: string): string {
  return name?.trim() || fallback;
}

/** Stable small integer derived from an id string — used to seed decorative
 * (non-semantic) visuals like waveform bar heights and avatar tints. */
export function seedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100_000;
  }
  return hash || 1;
}

export function humanizeEnum(value: string | null | undefined, fallback = "General"): string {
  if (!value) return fallback;
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/gu, (letter) => letter.toUpperCase());
}

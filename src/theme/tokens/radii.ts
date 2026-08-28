export const radii = {
  card: "24px",
  navRail: "34px",
  panel: "16px",
  panelLg: "18px",
  pillSm: "12px",
  pillMd: "16px",
  pillLg: "20px",
  full: "999px",
  avatarSquare: "12px",
  avatarCircle: "50%",
  waveformBar: "2px",
} as const;

export type Radii = typeof radii;

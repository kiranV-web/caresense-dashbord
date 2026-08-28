export const spacing = {
  pagePadding: "34px clamp(20px, 3vw, 42px) 52px",
  stackGap: "28px",
  headerToContent: "32px",
  sidebarToContent: "28px",
  cardPadding: {
    kpi: "18px 22px",
    content: "24px 26px",
    wide: "26px 28px",
  },
} as const;

export type Spacing = typeof spacing;

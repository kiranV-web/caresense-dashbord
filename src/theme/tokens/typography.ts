export const fontFamily = "'Manrope', system-ui, sans-serif";

// role → { size, weight, letterSpacing?, lineHeight?, color-key handled by consumer }
export const typeScale = {
  pageTitle: { size: "21px", weight: 800, letterSpacing: "-0.025em", lineHeight: 1.2 },
  pageSubtitle: { size: "13px", weight: 600 },
  kpiValue: { size: "32px", weight: 800, letterSpacing: "-0.035em", lineHeight: 1.05 },
  kpiLabel: { size: "13.5px", weight: 700 },
  kpiContext: { size: "12.5px", weight: 700 },
  cardHeading: { size: "18px", weight: 800, letterSpacing: "-0.025em" },
  subCardHeading: { size: "16px", weight: 800, letterSpacing: "-0.025em" },
  secondaryKpiValue: { size: "24px", weight: 800, letterSpacing: "-0.035em" },
  rowTitle: { size: "14px", weight: 700, letterSpacing: "-0.01em" },
  rowMeta: { size: "12px", weight: 600 },
  body: { size: "13.5px", weight: 500, lineHeight: 1.55 },
  chip: { size: "12px", weight: 700 },
  tableHeader: { size: "10.5px", weight: 800, letterSpacing: "0.08em" },
  microLabel: { size: "11px", weight: 700 },
} as const;

export type TypeScale = typeof typeScale;

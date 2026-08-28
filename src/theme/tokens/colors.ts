// Design tokens ported verbatim from design_handoff_call_centre_dashboard/README.md
// Never hardcode a hex value in a component — always read it from the theme.

export const colors = {
  bg: {
    app: "#e9e7e2",
  },
  surface: {
    card: "#ffffff",
    sunken: "#faf9f7",
    muted: "#f2f0eb",
    hover: "#f7f6f3",
    // slightly cooler muted tone used for the metadata/file icon chip on Upload
    mutedAlt: "#eeece7",
  },
  line: {
    hairline: "#f2f0eb",
    input: "#e4e1da",
  },
  text: {
    primary: "#1b1c1a",
    secondary: "#5b5d57",
    muted: "#8b8d86",
    faint: "#a8aaa3",
    faintAlt: "#b6b8b1",
    onAccent: "#ffffff",
  },
  accent: {
    green: "#5f7d67",
    deep: "#43594a",
    gradient: "linear-gradient(145deg,#7f9d83 0%,#5c7a64 100%)",
    gradientShadow: "rgba(92,122,100,.24)",
  },
  pastel: {
    // ranked-bar / resolved scale, most → least saturated
    green: ["#8fae94", "#a9c5ac", "#bed4bf", "#cfdfcf", "#dfe9de"] as const,
    greenSolid: "#b8cfb9",
    amber: "#f0d5a6",
    amberWave: "#e8b98a",
    red: "#e8b3a8",
    redWave: "#dc9c92",
  },
  wave: {
    neutral: "#d5d3ce",
  },
  chip: {
    green: { bg: "#e6efe6", fg: "#517a58" },
    amber: { bg: "#fbf1de", fg: "#a37b31" },
    orange: { bg: "#fbeee4", fg: "#b5793a" },
    red: { bg: "#fbe7e2", fg: "#b1594a" },
    redSoft: "#fdf3ef",
    neutral: { bg: "#f2f0eb", fg: "#8b8d86" },
    calm: { bg: "#f2f0eb", fg: "#7b7d76" },
  },
  avatarTints: ["#e4e8e1", "#e9e6df", "#dfe7de", "#e8ece6"] as const,
  heatmap: {
    none: "#eeece7",
    low: "#d7e2d6",
    good: "#b8cfb9",
    difficult: "#f0d5a6",
    rude: "#e8b3a8",
  },
  kpi: {
    sparklineLine: "#cdd8cc",
    sparklineDot: "#c3cdc1",
    progressTrack: "#f1efea",
    progressMarker: "#8b8d86",
  },
  upload: {
    dropzoneBorder: "#d3dcd2",
    dropzoneBg: "#f7f9f6",
    dropzoneBgHover: "#f1f5ef",
    iconBadgeBg: "#e3ece2",
    progressTrack: "#e4e8e2",
    attachBg: "#e8efe8",
    attachFg: "#4d6a55",
  },
  chat: {
    agentBubbleBg: "#f7f6f3",
    agentBubbleFg: "#33352f",
    userBubbleBg: "#1b1c1a",
    userBubbleFg: "#ffffff",
  },
  transcript: {
    agentBubbleBg: "#f7f6f3",
    customerBubbleBg: "#eef3ed",
    bodyText: "#33352f",
  },
  icon: {
    default: "#4a4c47",
    faint: "#b6b8b1",
  },
  overlay: {
    onGradientStrong: "rgba(255,255,255,.92)",
    onGradientMedium: "rgba(255,255,255,.2)",
    onGradientSoft: "rgba(255,255,255,.17)",
    onGradientLabel: "rgba(255,255,255,.78)",
  },
  shadow: {
    card: "0 1px 3px rgba(27,28,26,.05)",
    cardHover: "0 6px 18px rgba(27,28,26,.08)",
    gradientCard: "0 3px 14px rgba(92,122,100,.24)",
    drawer: "0 1px 3px rgba(0,0,0,.18)",
  },
  // Bespoke, deliberately muted palette for the call-quality pass/fail
  // circle stack in the calls table — softer than `chip`/`tone` since it
  // repeats 7x per row; not part of the 6-tone semantic system.
  qualityStack: {
    pass: { bg: "#edf2ed", fg: "#6b8a70", ring: "rgba(81,122,88,.10)", tooltipBg: "#2f3a31", tooltipDot: "#a9c5ac" },
    fail: { bg: "#faeae6", fg: "#c07d70", ring: "rgba(177,89,74,.14)", tooltipBg: "#5d322b", tooltipDot: "#e0a294" },
    tooltipLabelFg: "#ffffff",
    tooltipVerdictFg: "rgba(255,255,255,.6)",
    tooltipShadow: "0 8px 24px rgba(27,28,26,.22)",
  },
  // The semantic tones the whole app draws meaning from (never decorative —
  // see README "Semantic rule"). Every status pill, sentiment chip, rule
  // pass/fail mark and waveform span resolves to one of these.
  tone: {
    neutral: { chipBg: "#f2f0eb", chipFg: "#8b8d86", wave: "#d5d3ce", solid: "#eeece7" },
    // A low-intensity green for calm/neutral moments — distinct from true
    // grey-neutral (no signal) and from full positive (a genuinely good
    // moment). One step paler than "positive" on the pastel green scale
    // below — deliberately not the very palest step, which reads as barely
    // different from plain grey at the small sizes bars render at.
    mild: { chipBg: "#eef3ed", chipFg: "#6f8f76", wave: "#bed4bf", solid: "#bed4bf" },
    positive: { chipBg: "#e6efe6", chipFg: "#517a58", wave: "#a9c5ac", solid: "#b8cfb9" },
    caution: { chipBg: "#fbf1de", chipFg: "#a37b31", wave: "#e8b98a", solid: "#f0d5a6" },
    attention: { chipBg: "#fbeee4", chipFg: "#b5793a", wave: "#e8b98a", solid: "#f0d5a6" },
    critical: { chipBg: "#fbe7e2", chipFg: "#b1594a", wave: "#dc9c92", solid: "#e8b3a8" },
  },
} as const;

export type Colors = typeof colors;

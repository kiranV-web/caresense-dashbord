export const breakpoints = {
  // Below this width the app renders a "desktop only" message instead of
  // attempting any responsive reflow — this product is not designed for
  // tablet/mobile use.
  desktopMin: 1200,
} as const;

export type Breakpoints = typeof breakpoints;

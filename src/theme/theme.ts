import { colors } from "./tokens/colors";
import { spacing } from "./tokens/spacing";
import { radii } from "./tokens/radii";
import { shadows } from "./tokens/shadows";
import { fontFamily, typeScale } from "./tokens/typography";
import { breakpoints } from "./tokens/breakpoints";

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  fontFamily,
  type: typeScale,
  breakpoints,
} as const;

export type AppTheme = typeof theme;

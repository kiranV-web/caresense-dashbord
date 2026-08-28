import { colors } from "./colors";

export const shadows = {
  card: colors.shadow.card,
  cardHover: colors.shadow.cardHover,
  gradientCard: colors.shadow.gradientCard,
  knob: colors.shadow.drawer,
} as const;

export type Shadows = typeof shadows;

import styled, { css } from "styled-components";
import type { ElementType, ReactNode, ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cardShape } from "./styleMixins";

export type CardPadding = "kpi" | "content" | "wide" | "none";

export interface CardProps {
  padding?: CardPadding;
  interactive?: boolean;
  accent?: boolean;
  as?: ElementType;
  children?: ReactNode;
  className?: string;
}

const paddingCss = {
  kpi: css`
    padding: ${({ theme }) => theme.spacing.cardPadding.kpi};
  `,
  content: css`
    padding: ${({ theme }) => theme.spacing.cardPadding.content};
  `,
  wide: css`
    padding: ${({ theme }) => theme.spacing.cardPadding.wide};
  `,
  none: css``,
};

interface StyledCardProps {
  $padding: CardPadding;
  $interactive: boolean;
  $accent: boolean;
}

/** Base white rounded-24 surface — nearly every other card composes this. */
const StyledCard = styled.div<StyledCardProps>`
  ${cardShape}
  ${({ $padding }) => paddingCss[$padding]}

  ${({ $accent, theme }) =>
    $accent &&
    css`
      background: ${theme.colors.accent.gradient};
      color: ${theme.colors.text.onAccent};
      box-shadow: ${theme.shadows.gradientCard};
    `}

  ${({ $interactive }) =>
    $interactive &&
    css`
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => theme.shadows.cardHover};
      }
    `}
`;

type NativeProps = HTMLAttributes<HTMLElement> & ButtonHTMLAttributes<HTMLButtonElement>;

export function Card({
  padding = "content",
  interactive = false,
  accent = false,
  as,
  children,
  ...rest
}: Readonly<CardProps & Partial<NativeProps>>) {
  return (
    <StyledCard as={as} $padding={padding} $interactive={interactive} $accent={accent} {...rest}>
      {children}
    </StyledCard>
  );
}

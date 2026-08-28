import styled, { useTheme } from "styled-components";
import { LogoMark, type LogoVariant } from "./LogoMark";

export interface LogoLockupProps {
  /** Size of the mark in px — the wordmark's gap and cap height scale off
   * this (gap ~0.37x, cap height ~0.62x), matching the 30px reference point
   * (11px gap, 19px type) exactly. Below a ~96px total lockup width there
   * isn't room for the wordmark to read cleanly — use LogoMark alone there
   * instead of shrinking this past a ~16px mark. */
  size?: number;
  variant?: LogoVariant;
  className?: string;
}

const Row = styled.div<{ $gap: number }>`
  display: flex;
  align-items: center;
  gap: ${({ $gap }) => $gap}px;
`;

const Wordmark = styled.span<{ $capHeight: number }>`
  font-family: 'Manrope', system-ui, sans-serif;
  font-size: ${({ $capHeight }) => $capHeight}px;
  letter-spacing: -0.035em;
  white-space: nowrap;
  line-height: 1;
`;

const Call = styled.span<{ $color: string }>`
  font-weight: 800;
  color: ${({ $color }) => $color};
`;

const Sense = styled.span<{ $color: string }>`
  font-weight: 500;
  color: ${({ $color }) => $color};
`;

export function LogoLockup({ size = 30, variant = "light", className }: Readonly<LogoLockupProps>) {
  const theme = useTheme();
  const gap = size * 0.37;
  const capHeight = size * 0.62;
  const callColor = variant === "mono" ? "currentColor" : theme.colors.logo.wordmark.call[variant];
  const senseColor = variant === "mono" ? "currentColor" : theme.colors.logo.wordmark.sense[variant];

  return (
    <Row $gap={gap} className={className}>
      <LogoMark size={size} variant={variant} />
      <Wordmark $capHeight={capHeight}>
        <Call $color={callColor}>Call</Call> <Sense $color={senseColor}>Sense</Sense>
      </Wordmark>
    </Row>
  );
}

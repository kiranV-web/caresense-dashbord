import styled from "styled-components";
import type { ReactNode } from "react";

export interface IconButtonProps {
  children: ReactNode;
  size?: number;
  radius?: string;
  active?: boolean;
  onClick?: () => void;
  "aria-label": string;
  title?: string;
}

const Button = styled.button<{ $size: number; $radius: string; $active: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $radius }) => $radius};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active, theme }) => ($active ? theme.colors.text.primary : theme.colors.surface.muted)};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.onAccent : theme.colors.icon.default)};
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;

  @media (hover: hover) {
    &:hover {
      background: ${({ $active, theme }) => ($active ? theme.colors.accent.deep : theme.colors.surface.hover)};
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: scale(0.94);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }

  &:disabled {
    opacity: 0.45;
    transform: none;
  }
`;

export function IconButton({
  children,
  size = 34,
  radius,
  active = false,
  onClick,
  title,
  ...rest
}: Readonly<IconButtonProps>) {
  return (
    <Button type="button" $size={size} $radius={radius ?? "12px"} $active={active} onClick={onClick} title={title} {...rest}>
      {children}
    </Button>
  );
}

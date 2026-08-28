import styled, { css } from "styled-components";
import { pillShape } from "./styleMixins";

export interface SegmentedItem<T extends string = string> {
  value: T;
  label: string;
}

export type SegmentedVariant = "toggle" | "tabs" | "chips";

export interface SegmentedControlProps<T extends string = string> {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: SegmentedVariant;
  "aria-label": string;
}

const Track = styled.div<{ $variant: SegmentedVariant }>`
  display: flex;
  gap: ${({ $variant }) => ($variant === "chips" ? "10px" : $variant === "toggle" ? "4px" : "3px")};
  flex-wrap: wrap;

  ${({ $variant, theme }) =>
    $variant === "toggle" &&
    css`
      background: ${theme.colors.surface.card};
      padding: 5px;
      border-radius: ${theme.radii.full};
      border: 1px solid ${theme.colors.line.hairline};
      box-shadow: ${theme.shadows.card};
    `}

  ${({ $variant, theme }) =>
    $variant === "tabs" &&
    css`
      background: ${theme.colors.surface.muted};
      padding: 3px;
      border-radius: ${theme.radii.panel};
    `}
`;

const sizeByVariant = {
  toggle: css`
    padding: 9px 22px;
    font-size: 13.5px;
    border-radius: ${({ theme }) => theme.radii.full};
  `,
  tabs: css`
    padding: 6px 14px;
    font-size: 12px;
    border-radius: 13px;
  `,
  chips: css`
    padding: 10px 18px;
    font-size: 13px;
    border-radius: ${({ theme }) => theme.radii.pillLg};
  `,
};

const Item = styled.button<{ $active: boolean; $variant: SegmentedVariant }>`
  ${pillShape}
  ${({ $variant }) => sizeByVariant[$variant]}
  background: ${({ $active, theme }) => ($active ? theme.colors.text.primary : "transparent")};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.onAccent : theme.colors.text.muted)};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.card : "none")};

  @media (hover: hover) {
    &:hover {
      background: ${({ $active, theme }) => ($active ? theme.colors.text.primary : theme.colors.surface.hover)};
      color: ${({ $active, theme }) => ($active ? theme.colors.text.onAccent : theme.colors.text.secondary)};
    }
  }

  &:active {
    transform: scale(0.97);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }

  ${({ $variant, $active, theme }) =>
    $variant === "chips" &&
    !$active &&
    css`
      background: ${theme.colors.surface.muted};
      color: ${theme.colors.text.muted};
    `}
`;

export function SegmentedControl<T extends string = string>({
  items,
  value,
  onChange,
  variant = "chips",
  ...rest
}: Readonly<SegmentedControlProps<T>>) {
  return (
    <Track $variant={variant} role="tablist" {...rest}>
      {items.map((item) => (
        <Item
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          $active={item.value === value}
          $variant={variant}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Item>
      ))}
    </Track>
  );
}

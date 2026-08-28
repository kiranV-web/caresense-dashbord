import styled, { css } from "styled-components";
import { pillShape } from "./styleMixins";

export type PillSize = "xs" | "sm" | "md" | "lg";

const sizeCss = {
  xs: css`
    padding: 4px 10px;
    font-size: 11.5px;
  `,
  sm: css`
    padding: 5px 12px;
    font-size: 12px;
  `,
  md: css`
    padding: 7px 14px;
    font-size: 12.5px;
  `,
  lg: css`
    padding: 9px 22px;
    font-size: 13.5px;
  `,
};

export interface PillProps {
  $bg: string;
  $fg: string;
  $size?: PillSize;
  $bold?: boolean;
}

/** Generic coloured label — StatusPill/SentimentChip resolve theme colours and render this. */
export const Pill = styled.span<PillProps>`
  ${pillShape}
  ${({ $size = "sm" }) => sizeCss[$size]}
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  font-weight: ${({ $bold }) => ($bold ? 800 : 700)};
`;

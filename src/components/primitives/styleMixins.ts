import { css } from "styled-components";

/** Shared "pill" shape used by Pill (span) and SegmentedControl's item buttons. */
export const pillShape = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease;
`;

export const cardShape = css`
  background: ${({ theme }) => theme.colors.surface.card};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

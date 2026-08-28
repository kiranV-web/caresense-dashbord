import styled from "styled-components";

/**
 * Fixed-width desktop wrapper — content is centred and capped rather than
 * stretching edge-to-edge on ultra-wide monitors.
 */
export const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bg.app};
  padding: ${({ theme }) => theme.spacing.pagePadding};
`;

export const PageInner = styled.div`
  max-width: 1560px;
  margin: 0 auto;
  min-width: 1160px;
`;

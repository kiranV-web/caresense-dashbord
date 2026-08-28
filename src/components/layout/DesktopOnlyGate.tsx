import styled from "styled-components";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/LogoMark";

const DesktopContent = styled.div`
  display: block;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktopMin - 1}px) {
    display: none;
  }
`;

const MobileNotice = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktopMin - 1}px) {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 40px;
    background: ${({ theme }) => theme.colors.bg.app};
  }
`;

const MarkWrap = styled.div`
  margin-bottom: 8px;
`;

const Heading = styled.h1`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
`;

const Body = styled.p`
  font-size: 13.5px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.muted};
  max-width: 320px;
  line-height: 1.5;
  margin: 0;
`;

/**
 * Purely CSS-driven: no JS viewport detection, no responsive reflow work
 * anywhere else in the app. Below the desktop breakpoint the dashboard is
 * replaced with this notice; at/above it, the notice is display:none.
 */
export function DesktopOnlyGate({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <DesktopContent>{children}</DesktopContent>
      <MobileNotice>
        <MarkWrap><LogoMark size={42} /></MarkWrap>
        <Heading>Desktop only</Heading>
        <Body>CareSense Call Centre Intelligence is designed for desktop screens. Please reopen it on a larger display.</Body>
      </MobileNotice>
    </>
  );
}

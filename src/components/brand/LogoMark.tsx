import { useState } from "react";
import styled, { css, keyframes, useTheme } from "styled-components";

export type LogoVariant = "light" | "dark" | "mono";

export interface LogoMarkProps {
  /** Rendered size in px. At <=20 a redrawn, thicker-stroke geometry is used
   * instead of naively scaling the normal-size paths down (see SMALL_GEOMETRY). */
  size?: number;
  variant?: LogoVariant;
  className?: string;
}

// Both geometries are centred on (14, 24) in a 0 0 48 48 viewBox, each arc
// spanning 50 degrees either side of the horizontal axis. Never hand-adjust
// an endpoint — recompute as x = 14 + r*cos(50deg), y = 24 -+ r*sin(50deg).
const NORMAL_GEOMETRY = {
  dotRadius: 4.8,
  strokeWidth: 4.6,
  innerPath: "M20.75 15.96 A10.5 10.5 0 0 1 20.75 32.04",
  outerPath: "M25.89 9.83 A18.5 18.5 0 0 1 25.89 38.17",
};
const SMALL_GEOMETRY = {
  dotRadius: 6,
  strokeWidth: 6,
  innerPath: "M22.36 14.04 A13 13 0 0 1 22.36 33.96",
  outerPath: "M28.78 6.38 A23 23 0 0 1 28.78 41.62",
};
const SMALL_SIZE_THRESHOLD = 20;

const entrance = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;

// Fires only for the very first LogoMark mounted in a browser session (this
// app renders separate layout trees for the dashboard vs. Upload/Chat, each
// with their own Header, so a plain mount-triggered animation would replay
// every time a user crosses between them — this module-level latch keeps it
// to a true "once on first load", not a per-mount replay).
let hasPlayedEntrance = false;

function arcAnimationCss(delayMs: number) {
  return css`
    @media (prefers-reduced-motion: no-preference) {
      transform-box: view-box;
      transform-origin: 14px 24px;
      animation: ${entrance} 260ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delayMs}ms both;
    }
  `;
}

const InnerArc = styled.path<{ $animate: boolean }>`
  ${({ $animate }) => $animate && arcAnimationCss(0)}
`;

const OuterArc = styled.path<{ $animate: boolean }>`
  ${({ $animate }) => $animate && arcAnimationCss(90)}
`;

export function LogoMark({ size = 32, variant = "light", className }: Readonly<LogoMarkProps>) {
  const theme = useTheme();
  const [animate] = useState(() => {
    const shouldAnimate = !hasPlayedEntrance;
    hasPlayedEntrance = true;
    return shouldAnimate;
  });

  const isSmall = size <= SMALL_SIZE_THRESHOLD;
  const geometry = isSmall ? SMALL_GEOMETRY : NORMAL_GEOMETRY;

  const dotAndInnerColor = variant === "mono" ? "currentColor" : theme.colors.logo.dotAndInner[variant];
  const outerColor = variant === "mono"
    ? "currentColor"
    : isSmall ? theme.colors.logo.outerArc.small : theme.colors.logo.outerArc[variant];

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label="Call Sense" className={className}>
      <circle cx="14" cy="24" r={geometry.dotRadius} fill={dotAndInnerColor} />
      <InnerArc
        d={geometry.innerPath}
        fill="none"
        stroke={dotAndInnerColor}
        strokeWidth={geometry.strokeWidth}
        strokeLinecap="round"
        $animate={animate}
      />
      <OuterArc
        d={geometry.outerPath}
        fill="none"
        stroke={outerColor}
        strokeWidth={geometry.strokeWidth}
        strokeLinecap="round"
        $animate={animate}
      />
    </svg>
  );
}

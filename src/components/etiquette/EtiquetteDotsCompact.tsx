import styled, { css, useTheme } from "styled-components";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { EtiquetteRuleResult } from "@/types/call";
import { setQualityTooltip } from "@/services/qualityTooltipStore";

const Stack = styled.div`
  display: flex;
  align-items: center;
  padding-left: 8px;
`;

const enterKeyframes = css`
  @keyframes etiquetteDotEnter {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Circle = styled.span<{ $pass: boolean; $delayMs: number; $stackIndex: number }>`
  ${enterKeyframes}
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
  margin-left: -8px;
  flex: none;
  background: ${({ theme, $pass }) => (theme.colors.qualityStack[$pass ? "pass" : "fail"].bg)};
  color: ${({ theme, $pass }) => (theme.colors.qualityStack[$pass ? "pass" : "fail"].fg)};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.surface.card},
    inset 0 0 0 1px ${({ theme, $pass }) => (theme.colors.qualityStack[$pass ? "pass" : "fail"].ring)};
  z-index: ${({ $stackIndex }) => 20 - $stackIndex};
  transition: transform 0.16s ease;

  @media (prefers-reduced-motion: no-preference) {
    animation: etiquetteDotEnter 220ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
    animation-delay: ${({ $delayMs }) => $delayMs}ms;
  }

  &:hover {
    transform: translateY(-2px);
    z-index: 40;
  }
`;

const Count = styled.span<{ $fg: string }>`
  margin-left: 10px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  color: ${({ $fg }) => $fg};
`;

export function EtiquetteDotsCompact({ rules }: Readonly<{ rules: EtiquetteRuleResult[] }>) {
  const theme = useTheme();
  const applicableRules = rules.filter((rule) => rule.status !== "n/a");
  const passCount = applicableRules.filter((rule) => rule.status === "pass").length;
  const failCount = applicableRules.length - passCount;
  const countColor = failCount === 0
    ? theme.colors.tone.positive.chipFg
    : failCount === 1
      ? theme.colors.tone.neutral.chipFg
      : theme.colors.tone.critical.chipFg;

  function showTooltip(event: ReactMouseEvent, label: string, passed: boolean) {
    setQualityTooltip({ label, passed, x: event.clientX, y: event.clientY - 46 });
  }

  return (
    <Stack>
      {applicableRules.map((rule, index) => {
        const pass = rule.status === "pass";
        return (
          <Circle
            key={rule.id}
            $pass={pass}
            $delayMs={index * 35}
            $stackIndex={index}
            onMouseEnter={(event) => showTooltip(event, rule.label, pass)}
            onMouseMove={(event) => showTooltip(event, rule.label, pass)}
            onMouseLeave={() => setQualityTooltip(null)}
          >
            {pass ? "✓" : "✕"}
          </Circle>
        );
      })}
      <Count $fg={countColor}>{passCount}/{applicableRules.length}</Count>
    </Stack>
  );
}

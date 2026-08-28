import styled, { useTheme } from "styled-components";
import { useQualityTooltip } from "@/hooks/useQualityTooltip";

const Panel = styled.div<{ $x: number; $y: number; $bg: string }>`
  position: fixed;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  transform: translateX(-50%);
  z-index: 200;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 13px;
  border-radius: 12px;
  white-space: nowrap;
  background: ${({ $bg }) => $bg};
  box-shadow: ${({ theme }) => theme.colors.qualityStack.tooltipShadow};
`;

const Dot = styled.span<{ $color: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
  background: ${({ $color }) => $color};
`;

const Label = styled.span`
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.qualityStack.tooltipLabelFg};
`;

const Verdict = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.qualityStack.tooltipVerdictFg};
`;

export function QualityTooltip() {
  const theme = useTheme();
  const tooltip = useQualityTooltip();
  if (!tooltip) return null;

  const palette = theme.colors.qualityStack[tooltip.passed ? "pass" : "fail"];

  return (
    <Panel $x={tooltip.x} $y={tooltip.y} $bg={palette.tooltipBg}>
      <Dot $color={palette.tooltipDot} />
      <Label>{tooltip.label}</Label>
      <Verdict>{tooltip.passed ? "Passed" : "Failed"}</Verdict>
    </Panel>
  );
}

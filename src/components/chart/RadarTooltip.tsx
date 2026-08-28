import styled, { useTheme } from "styled-components";
import { useRadarTooltip } from "@/hooks/useRadarTooltip";

const Panel = styled.div<{ $x: number; $y: number; $bg: string }>`
  position: fixed;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  transform: translate(-50%, -100%);
  z-index: 200;
  pointer-events: none;
  padding: 11px 15px;
  border-radius: 12px;
  white-space: nowrap;
  background: ${({ $bg }) => $bg};
  box-shadow: ${({ theme }) => theme.colors.qualityStack.tooltipShadow};
`;

const Label = styled.div`
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.qualityStack.tooltipLabelFg};
  margin-bottom: 6px;
`;

const Row = styled.div`
  display: flex;
  align-items: baseline;
  gap: 14px;
  justify-content: space-between;
  font-size: 11.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.qualityStack.tooltipVerdictFg};

  & + & {
    margin-top: 3px;
  }
`;

const RowValue = styled.span`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.qualityStack.tooltipLabelFg};
`;

export function RadarTooltip() {
  const theme = useTheme();
  const tooltip = useRadarTooltip();
  if (!tooltip) return null;

  const onTarget = tooltip.agentPercent !== null && tooltip.agentPercent >= tooltip.target;
  const bg = theme.colors.qualityStack[onTarget ? "pass" : "fail"].tooltipBg;

  return (
    <Panel $x={tooltip.x} $y={tooltip.y} $bg={bg}>
      <Label>{tooltip.label}</Label>
      <Row><span>Agent</span><RowValue>{tooltip.agentPercent === null ? "—" : `${tooltip.agentPercent}%`}</RowValue></Row>
      <Row><span>Team average</span><RowValue>{tooltip.teamPercent}%</RowValue></Row>
      <Row><span>Target</span><RowValue>{tooltip.target}%</RowValue></Row>
      <Row><span>Failed calls</span><RowValue>{tooltip.failCount} of {tooltip.totalCalls}</RowValue></Row>
    </Panel>
  );
}

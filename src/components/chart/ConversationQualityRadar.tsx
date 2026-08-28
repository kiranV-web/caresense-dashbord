import { useMemo } from "react";
import styled, { useTheme } from "styled-components";
import type { RuleQualityPoint } from "@/types/agentQuality";
import type { ToneKey } from "@/types/common";
import { setRadarTooltip } from "@/services/radarTooltipStore";
import { RadarTooltip } from "./RadarTooltip";

const SIZE = 380;
const CENTER = SIZE / 2;
const MAX_RADIUS = 116;
const TARGET_PERCENT = 80;
const GRID_RINGS = [1 / 3, 2 / 3, 1];
const LABEL_RADIUS = MAX_RADIUS + 34;

interface Point {
  x: number;
  y: number;
}

function pointFor(angle: number, radius: number): Point {
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

function angleFor(index: number, count: number): number {
  return -Math.PI / 2 + index * ((2 * Math.PI) / count);
}

function closedPath(points: Point[]): string {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
}

function markerTone(percent: number | null): ToneKey {
  if (percent === null) return "caution";
  if (percent < 50) return "critical";
  if (percent < TARGET_PERCENT) return "caution";
  return "positive";
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Caption = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 4px;
`;

const CaptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const CaptionSwatch = styled.span<{ $dashed?: boolean }>`
  width: 16px;
  height: 0;
  border-top: ${({ $dashed, theme }) => ($dashed ? `1.5px dashed ${theme.colors.text.faint}` : `2.5px solid ${theme.colors.tone.positive.chipFg}`)};
`;

const ChartBox = styled.div`
  position: relative;
  width: ${SIZE}px;
  height: ${SIZE}px;
`;

const LabelItem = styled.button<{ $x: number; $y: number; $align: "left" | "right" | "center" }>`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  transform: ${({ $align }) => ($align === "left" ? "translate(0, -50%)" : $align === "right" ? "translate(-100%, -50%)" : "translate(-50%, -50%)")};
  max-width: 96px;
  text-align: ${({ $align }) => ($align === "center" ? "center" : $align)};
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: ${({ $align }) => ($align === "left" ? "flex-start" : $align === "right" ? "flex-end" : "center")};
  border-radius: ${({ theme }) => theme.radii.pillLg};
  transition: background 0.18s ease;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.surface.hover};
  }
`;

const LabelText = styled.span<{ $bold: boolean; $active: boolean }>`
  font-size: 12px;
  font-weight: ${({ $bold }) => ($bold ? 800 : 600)};
  line-height: 1.25;
  color: ${({ $active, theme }) => ($active ? theme.colors.text.primary : theme.colors.text.secondary)};
  white-space: normal;
`;

const PriorityDot = styled.span<{ $tone: ToneKey }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex: none;
  background: ${({ theme, $tone }) => theme.colors.tone[$tone].chipFg};
`;

export interface ConversationQualityRadarProps {
  rules: RuleQualityPoint[];
  selectedRule: string | null;
  onSelectRule: (rule: string) => void;
}

export function ConversationQualityRadar({ rules, selectedRule, onSelectRule }: Readonly<ConversationQualityRadarProps>) {
  const theme = useTheme();
  // A null percentage or zero denominator means the rule did not apply to this
  // agent's calls. Never turn that absence into a plotted 0% score.
  const visibleRules = useMemo(
    () => rules.filter((rule) => rule.agentPercent !== null && rule.totalCalls > 0),
    [rules],
  );
  const count = visibleRules.length;

  const axisAngles = useMemo(() => visibleRules.map((_, i) => angleFor(i, count)), [visibleRules, count]);
  const agentPoints = useMemo(
    () => visibleRules.map((rule, i) => pointFor(axisAngles[i]!, (rule.agentPercent! / 100) * MAX_RADIUS)),
    [visibleRules, axisAngles],
  );
  const teamPoints = useMemo(
    () => visibleRules.map((rule, i) => pointFor(axisAngles[i]!, (rule.teamPercent / 100) * MAX_RADIUS)),
    [visibleRules, axisAngles],
  );

  const priorityRuleKeys = useMemo(() => {
    const sorted = [...visibleRules].sort((a, b) => a.agentPercent! - b.agentPercent!);
    return new Set(sorted.slice(0, 2).map((rule) => rule.rule));
  }, [visibleRules]);

  function showTooltip(rule: RuleQualityPoint, clientX: number, clientY: number) {
    setRadarTooltip({
      label: rule.label, agentPercent: rule.agentPercent, teamPercent: rule.teamPercent,
      target: TARGET_PERCENT, failCount: rule.failCount, totalCalls: rule.totalCalls,
      x: clientX, y: clientY - 14,
    });
  }

  return (
    <Wrap>
      <ChartBox>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {GRID_RINGS.map((fraction) => (
            <circle key={fraction} cx={CENTER} cy={CENTER} r={fraction * MAX_RADIUS} fill="none" stroke={theme.colors.line.hairline} strokeWidth={1} />
          ))}
          {axisAngles.map((angle, i) => {
            const p = pointFor(angle, MAX_RADIUS);
            return <line key={visibleRules[i]!.rule} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke={theme.colors.line.hairline} strokeWidth={1} />;
          })}
          <circle
            cx={CENTER} cy={CENTER} r={(TARGET_PERCENT / 100) * MAX_RADIUS}
            fill="none" stroke={theme.colors.text.faint} strokeWidth={1.25} strokeDasharray="2 5"
          />
          <path d={closedPath(teamPoints)} fill="none" stroke={theme.colors.text.faint} strokeWidth={1.5} strokeDasharray="5 4" strokeLinejoin="round" />
          <path
            d={closedPath(agentPoints)} fill={theme.colors.tone.positive.solid} fillOpacity={0.18}
            stroke={theme.colors.tone.positive.chipFg} strokeWidth={2.5} strokeLinejoin="round"
          />
          {agentPoints.map((p, i) => {
            const rule = visibleRules[i]!;
            const tone = markerTone(rule.agentPercent);
            return (
              <circle
                key={rule.rule} cx={p.x} cy={p.y} r={5.5}
                fill={theme.colors.surface.card} stroke={theme.colors.tone[tone].chipFg} strokeWidth={2.5}
                style={{ cursor: "pointer" }}
                onMouseEnter={(event) => showTooltip(rule, event.clientX, event.clientY)}
                onMouseMove={(event) => showTooltip(rule, event.clientX, event.clientY)}
                onMouseLeave={() => setRadarTooltip(null)}
                onClick={() => onSelectRule(rule.rule)}
              >
                <title>{`${rule.label} — ${rule.agentPercent ?? "—"}%`}</title>
              </circle>
            );
          })}
        </svg>
        {visibleRules.map((rule, i) => {
          const angle = axisAngles[i]!;
          const p = pointFor(angle, LABEL_RADIUS);
          const cos = Math.cos(angle);
          const align: "left" | "right" | "center" = cos > 0.35 ? "left" : cos < -0.35 ? "right" : "center";
          const isPriority = priorityRuleKeys.has(rule.rule);
          return (
            <LabelItem
              key={rule.rule} type="button" $x={p.x} $y={p.y} $align={align}
              onClick={() => onSelectRule(rule.rule)}
              onMouseEnter={(event) => showTooltip(rule, event.clientX, event.clientY)}
              onMouseLeave={() => setRadarTooltip(null)}
              onFocus={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                showTooltip(rule, rect.left + rect.width / 2, rect.top);
              }}
              onBlur={() => setRadarTooltip(null)}
            >
              <LabelText $bold={isPriority} $active={selectedRule === rule.rule}>
                {isPriority && <PriorityDot $tone={markerTone(rule.agentPercent)} />}
                {rule.label}
              </LabelText>
            </LabelItem>
          );
        })}
      </ChartBox>
      <Caption>
        <CaptionItem><CaptionSwatch /> Agent</CaptionItem>
        <CaptionItem><CaptionSwatch $dashed /> Team average</CaptionItem>
      </Caption>
      <RadarTooltip />
    </Wrap>
  );
}

import styled, { useTheme } from "styled-components";
import type { CallStatus } from "@/types/call";
import { StatusPill } from "@/components/status/StatusPill";
import { labelForCallStatus, toneForAttentionScore, toneForCallStatus } from "@/utils/tone";

/** Below this, the score itself isn't meaningfully "urgent" — the call is
 * effectively fine, so show a plain green Resolved pill instead of a score. */
const LOW_URGENCY_THRESHOLD = 50;

const Pill = styled.span<{ $bg: string; $fg: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  min-width: 0;
  padding: 4px 14px 4px 4px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  font-size: 12px;
  font-weight: 750;
  white-space: nowrap;
`;

const StatusLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ScoreCircle = styled.span<{ $bg: string; $fg: string }>`
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex: none;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.surface.card};
  font-size: 11px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
`;

/** A shorter status wording for this pill's tight column width — every
 * other status already fits on one line via labelForCallStatus. */
function compactStatusLabel(status: CallStatus): string {
  return status === "resolved_but_improve_quality" ? "Resolved · Needs polish" : labelForCallStatus(status);
}

/** Attention-queue score pill: a colour-coded score circle (red at the
 * critical end, cooling as the score drops) paired with the call's own
 * status — used in place of a plain status pill once a call is ranked. */
export function AttentionScoreStatusPill({ score, status }: Readonly<{ score: number; status: CallStatus }>) {
  const theme = useTheme();
  if (score < LOW_URGENCY_THRESHOLD) return <StatusPill status="resolved" />;
  const scoreTone = theme.colors.tone[toneForAttentionScore(score)];
  const statusTone = theme.colors.tone[toneForCallStatus(status)];
  const label = compactStatusLabel(status);
  return (
    <Pill $bg={statusTone.chipBg} $fg={statusTone.chipFg} aria-label={`Attention score ${score}, status ${label}`}>
      <ScoreCircle $bg={scoreTone.chipBg} $fg={scoreTone.chipFg}>{score}</ScoreCircle>
      <StatusLabel>{label}</StatusLabel>
    </Pill>
  );
}

import styled, { useTheme } from "styled-components";
import { toneForAttentionScore } from "@/utils/tone";

export type ManagerAttentionScoreSize = "compact" | "standard" | "prominent";

const Score = styled.div<{ $size: ManagerAttentionScoreSize; $bg: string; $fg: string }>`
  display: inline-flex;
  flex-direction: ${({ $size }) => ($size === "prominent" ? "column" : "row")};
  align-items: ${({ $size }) => ($size === "prominent" ? "flex-start" : "center")};
  gap: ${({ $size }) => ($size === "prominent" ? "4px" : "6px")};
  padding: ${({ $size }) => ($size === "compact" ? "5px 9px" : $size === "standard" ? "7px 10px" : "11px 14px")};
  border-radius: ${({ theme, $size }) => ($size === "prominent" ? theme.radii.panel : theme.radii.full)};
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  font-weight: 800;
  white-space: nowrap;
`;

const Heading = styled.span`
  font-size: 9.5px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  opacity: 0.8;
`;

const Value = styled.span<{ $size: ManagerAttentionScoreSize }>`
  font-size: ${({ $size }) => ($size === "compact" ? "11.5px" : $size === "standard" ? "12.5px" : "20px")};
  font-variant-numeric: tabular-nums;
  letter-spacing: ${({ $size }) => ($size === "prominent" ? "-0.025em" : "normal")};
`;

export function ManagerAttentionScore({ score, label, size = "standard" }: Readonly<{
  score: number; label: string; size?: ManagerAttentionScoreSize;
}>) {
  const theme = useTheme();
  const tone = theme.colors.tone[toneForAttentionScore(score)];
  return (
    <Score $size={size} $bg={tone.chipBg} $fg={tone.chipFg} aria-label={`Manager attention score ${score}, ${label}`}>
      {size === "prominent" && <Heading>Manager attention</Heading>}
      <Value $size={size}>{score} · {label}</Value>
    </Score>
  );
}

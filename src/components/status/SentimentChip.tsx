import styled, { useTheme } from "styled-components";
import { Pill } from "@/components/primitives/Pill";
import type { ToneKey } from "@/types/common";

export interface SentimentChipProps {
  timestampLabel: string;
  label: string;
  tone: ToneKey;
  onClick?: () => void;
}

const Dot = styled.span<{ $fg: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $fg }) => $fg};
`;

const Clickable = styled.button`
  display: contents;
`;

export function SentimentChip({
  timestampLabel,
  label,
  tone,
  onClick,
}: Readonly<SentimentChipProps>) {
  const theme = useTheme();
  // "Calm" (neutral) uses a slightly different fg than other neutral chips.
  const fg =
    tone === "neutral"
      ? theme.colors.chip.calm.fg
      : theme.colors.tone[tone].chipFg;
  const bg =
    tone === "neutral"
      ? theme.colors.chip.calm.bg
      : theme.colors.tone[tone].chipBg;

  const content = (
    <Pill $bg={bg} $fg={fg} $size="md" $bold>
      <Dot $fg={fg} />
      {timestampLabel} {label}
    </Pill>
  );

  return onClick ? (
    <Clickable
      type="button"
      onClick={onClick}
      aria-label={`Jump to ${timestampLabel} — ${label}`}
    >
      {content}
    </Clickable>
  ) : (
    content
  );
}

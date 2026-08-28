import { useTheme } from "styled-components";
import { Pill } from "@/components/primitives/Pill";
import type { CallStatus } from "@/types/call";
import { labelForCallStatus, toneForCallStatus } from "@/utils/tone";

export function StatusPill({ status }: Readonly<{ status: CallStatus }>) {
  const theme = useTheme();
  const tone = theme.colors.tone[toneForCallStatus(status)];
  return (
    <Pill $bg={tone.chipBg} $fg={tone.chipFg} $size="sm">
      {labelForCallStatus(status)}
    </Pill>
  );
}

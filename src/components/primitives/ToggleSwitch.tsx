import styled from "styled-components";

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}

const Track = styled.button<{ $checked: boolean }>`
  width: 46px;
  height: 26px;
  border-radius: 13px;
  position: relative;
  transition: background 0.2s ease;
  background: ${({ $checked, theme }) => ($checked ? theme.colors.accent.green : theme.colors.line.input)};
`;

const Knob = styled.span<{ $checked: boolean }>`
  position: absolute;
  top: 3px;
  left: ${({ $checked }) => ($checked ? "23px" : "3px")};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface.card};
  box-shadow: ${({ theme }) => theme.shadows.knob};
  transition: left 0.2s ease;
`;

export function ToggleSwitch({ checked, onChange, label }: Readonly<ToggleSwitchProps>) {
  return (
    <Track
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      $checked={checked}
      onClick={() => onChange(!checked)}
    >
      <Knob $checked={checked} />
    </Track>
  );
}

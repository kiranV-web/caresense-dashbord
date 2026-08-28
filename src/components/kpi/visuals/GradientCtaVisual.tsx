import styled from "styled-components";

const ChipsRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const Chip = styled.span`
  font-size: 11.5px;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.overlay.onGradientMedium};
  padding: 4px 10px;
  border-radius: 12px;
`;

export function GradientCtaVisual({ chips }: Readonly<{ chips: string[] }>) {
  return (
    <ChipsRow>
      {chips.map((chip) => (
        <Chip key={chip}>{chip}</Chip>
      ))}
    </ChipsRow>
  );
}

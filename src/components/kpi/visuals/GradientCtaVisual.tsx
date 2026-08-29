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

const Cta = styled.div`
  margin-top: 12px;
  font-size: 12px;
  font-weight: 800;
`;

export function GradientCtaVisual({ chips }: Readonly<{ chips: string[] }>) {
  return (
    <ChipsRow>
      {chips.map((chip) => (
        <Chip key={chip}>{chip}</Chip>
      ))}
      <Cta>Review queue →</Cta>
    </ChipsRow>
  );
}

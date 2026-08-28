import styled, { useTheme } from "styled-components";
import { ProgressBar } from "@/components/primitives/ProgressBar";

export interface KpiProgressTrackProps {
  percentOfTarget: number;
  targetLabel: string;
}

const Wrapper = styled.div`
  margin-top: 12px;
`;

const Labels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.faint};
  margin-top: 7px;
`;

export function KpiProgressTrack({ percentOfTarget, targetLabel }: Readonly<KpiProgressTrackProps>) {
  const theme = useTheme();
  return (
    <Wrapper>
      <ProgressBar
        percent={percentOfTarget}
        color={theme.colors.pastel.greenSolid}
        trackColor={theme.colors.kpi.progressTrack}
        showTargetMarker
      />
      <Labels>
        <span>0</span>
        <span>{targetLabel}</span>
      </Labels>
    </Wrapper>
  );
}

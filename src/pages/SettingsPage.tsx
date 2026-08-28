import { useState } from "react";
import styled from "styled-components";
import { Card } from "@/components/primitives/Card";
import { useAsync } from "@/hooks/useAsync";
import { getSettings, updateIdealDuration } from "@/services/settingsService";

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.stackGap};
  max-width: 780px;
`;

const CardTitle = styled.div`
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.025em;
`;

const CardSubtitle = styled.div`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 4px;
`;

const DurationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
`;

const DurationInput = styled.input`
  width: 100px;
  padding: 13px 16px;
  border-radius: ${({ theme }) => theme.radii.panelLg};
  border: 1.5px solid ${({ theme }) => theme.colors.line.input};
  background: ${({ theme }) => theme.colors.surface.sunken};
  font-size: 17px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  font-variant-numeric: tabular-nums;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;

  &:focus-visible {
    background: ${({ theme }) => theme.colors.surface.card};
    border-color: ${({ theme }) => theme.colors.interaction.focusOutline};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }
`;

const MinutesLabel = styled.span`
  font-size: 13.5px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Explanation = styled.div`
  font-size: 12.5px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 14px;
  line-height: 1.6;
  max-width: 540px;
`;

const RuleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.line.hairline};
`;

const RuleText = styled.div`
  flex: 1;
`;

const RuleName = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const RuleDesc = styled.div`
  font-size: 12.5px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
`;

export function SettingsPage() {
  const { data: settings, loading } = useAsync(getSettings, []);
  const [duration, setDuration] = useState<number | undefined>(undefined);

  const effectiveRules = settings?.qualityRules ?? [];
  const effectiveDuration = duration ?? settings?.idealDurationMinutes ?? 5;

  async function changeDuration(next: number) {
    setDuration(next);
    await updateIdealDuration(next);
  }

  if (loading || !settings) return <Stack>Loading…</Stack>;

  return (
    <Stack>
      <Card padding="wide">
        <CardTitle>Ideal call duration</CardTitle>
        <DurationRow>
          <DurationInput
            type="number"
            min={1}
            aria-label="Ideal call duration in minutes"
            value={effectiveDuration}
            onChange={(e) => void changeDuration(Number(e.target.value) || 1)}
          />
          <MinutesLabel>minutes</MinutesLabel>
        </DurationRow>
        <Explanation>
          Calls exceeding this duration may be highlighted for review but are not automatically treated as poor quality.
        </Explanation>
        <Explanation>Not yet implemented.</Explanation>
      </Card>

      <Card padding="wide">
        <CardTitle>Call quality rules</CardTitle>
        <CardSubtitle>Checked on every analysed call.</CardSubtitle>
        <div style={{ marginTop: 10 }}>
          {effectiveRules.map((rule) => (
            <RuleRow key={rule.id}>
              <RuleText>
                <RuleName>{rule.name}</RuleName>
                <RuleDesc>{rule.description}</RuleDesc>
              </RuleText>
            </RuleRow>
          ))}
        </div>
      </Card>
    </Stack>
  );
}

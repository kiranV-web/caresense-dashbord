import { useState } from "react";
import styled from "styled-components";
import { Card } from "@/components/primitives/Card";
import { ToggleSwitch } from "@/components/primitives/ToggleSwitch";
import { useAsync } from "@/hooks/useAsync";
import { getSettings, updateIdealDuration, updateRule } from "@/services/settingsService";
import type { QualityRule } from "@/types/settings";

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
  const [rules, setRules] = useState<QualityRule[] | undefined>(undefined);
  const [duration, setDuration] = useState<number | undefined>(undefined);

  const effectiveRules = rules ?? settings?.qualityRules ?? [];
  const effectiveDuration = duration ?? settings?.idealDurationMinutes ?? 5;

  async function toggleRule(ruleId: string, enabled: boolean) {
    setRules(effectiveRules.map((r) => (r.id === ruleId ? { ...r, enabled } : r)));
    await updateRule(ruleId, enabled);
  }

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
            value={effectiveDuration}
            onChange={(e) => void changeDuration(Number(e.target.value) || 1)}
          />
          <MinutesLabel>minutes</MinutesLabel>
        </DurationRow>
        <Explanation>
          Calls exceeding this duration may be highlighted for review but are not automatically treated as poor quality.
        </Explanation>
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
              <ToggleSwitch checked={rule.enabled} onChange={(next) => void toggleRule(rule.id, next)} label={rule.name} />
            </RuleRow>
          ))}
        </div>
      </Card>
    </Stack>
  );
}

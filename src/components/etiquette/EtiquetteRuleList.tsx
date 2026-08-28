import styled, { useTheme } from "styled-components";
import type { EtiquetteRuleResult, RuleEvidence } from "@/types/call";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  font-weight: 700;
`;

const Mark = styled.span<{ $bg: string; $fg: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
`;

const Name = styled.span`
  flex: 1;
`;

const Note = styled.span<{ $fg: string }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $fg }) => $fg};
`;

const Evidence = styled.div`
  margin-top: 16px;
  background: ${({ theme }) => theme.colors.chip.redSoft};
  border-radius: ${({ theme }) => theme.radii.panelLg};
  padding: 16px;
`;

const EvidenceHeading = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.chip.red.fg};
`;

const EvidenceQuotes = styled.div`
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 8px;
  line-height: 1.55;
  font-weight: 500;
`;

const EvidenceObservation = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 8px;
  line-height: 1.55;
  font-weight: 600;
`;

const markFor: Record<EtiquetteRuleResult["status"], string> = { pass: "✓", fail: "✕", "n/a": "–" };

export interface EtiquetteRuleListProps {
  rules: EtiquetteRuleResult[];
  evidence?: RuleEvidence;
}

export function EtiquetteRuleList({ rules, evidence }: Readonly<EtiquetteRuleListProps>) {
  const theme = useTheme();
  return (
    <div>
      <List>
        {rules.map((rule) => {
          const pass = rule.status === "pass";
          const applicable = rule.status !== "n/a";
          const palette = applicable
            ? theme.colors.qualityStack[pass ? "pass" : "fail"]
            : { bg: theme.colors.surface.muted, fg: theme.colors.text.muted };
          return (
            <Row key={rule.id}>
              <Mark $bg={palette.bg} $fg={palette.fg}>
                {markFor[rule.status]}
              </Mark>
              <Name>{rule.label}</Name>
              <Note $fg={palette.fg}>{applicable ? (pass ? "Passed" : "Failed") : "Not applicable"}</Note>
            </Row>
          );
        })}
      </List>

      {evidence && (
        <Evidence>
          <EvidenceHeading>{evidence.heading}</EvidenceHeading>
          <EvidenceQuotes>
            Customer: &ldquo;{evidence.customerQuote}&rdquo;
            <br />
            Agent: &ldquo;{evidence.agentQuote}&rdquo;
          </EvidenceQuotes>
          <EvidenceObservation>AI: {evidence.observation}</EvidenceObservation>
        </Evidence>
      )}
    </div>
  );
}

import styled from "styled-components";
import type { ReactNode } from "react";
import { Card } from "@/components/primitives/Card";

export interface KpiCardProps {
  value: ReactNode;
  label: string;
  contextLabel?: ReactNode;
  visual?: ReactNode;
  accent?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

const Layout = styled.div<{ $hasVisual: boolean }>`
  display: flex;
  justify-content: ${({ $hasVisual }) => ($hasVisual ? "space-between" : "flex-start")};
  align-items: flex-start;
  gap: 12px;
`;

const Value = styled.div`
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.05;
`;

const Label = styled.div<{ $accent: boolean }>`
  font-size: 13.5px;
  font-weight: 700;
  margin-top: 6px;
  color: ${({ $accent, theme }) => ($accent ? "inherit" : theme.colors.text.secondary)};
`;

const Context = styled.div<{ $accent: boolean }>`
  font-size: 12.5px;
  font-weight: 700;
  margin-top: 4px;
  color: ${({ $accent, theme }) => ($accent ? "inherit" : theme.colors.accent.green)};
`;

export function KpiCard({ value, label, contextLabel, visual, accent = false, onClick, children }: Readonly<KpiCardProps>) {
  return (
    <Card padding="kpi" accent={accent} interactive={Boolean(onClick)} onClick={onClick} as={onClick ? "button" : "div"} style={onClick ? buttonReset : undefined}>
      <Layout $hasVisual={Boolean(visual)}>
        <div>
          <Value>{value}</Value>
          <Label $accent={accent}>{label}</Label>
          {contextLabel && <Context $accent={accent}>{contextLabel}</Context>}
        </div>
        {visual}
      </Layout>
      {children}
    </Card>
  );
}

const buttonReset = { width: "100%", textAlign: "left" as const };

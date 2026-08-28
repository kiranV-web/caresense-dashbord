import styled from "styled-components";
import { SegmentedControl, type SegmentedItem } from "@/components/primitives/SegmentedControl";
import { LogoMark } from "@/components/brand/LogoMark";

export type AppMode = "upload" | "dash" | "chat";

export interface HeaderProps {
  title: string;
  subtitle: string;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const modeItems: SegmentedItem<AppMode>[] = [
  { value: "upload", label: "Upload" },
  { value: "dash", label: "Dashboard" },
  { value: "chat", label: "Chat agent" },
];

const Grid = styled.header`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.headerToContent};
`;

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Title = styled.div`
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
`;

const Subtitle = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 600;
`;

const End = styled.div`
  justify-self: end;
`;

export function Header({ title, subtitle, mode, onModeChange }: Readonly<HeaderProps>) {
  return (
    <Grid>
      <Identity>
        <LogoMark size={42} />
        <div>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </div>
      </Identity>

      <SegmentedControl items={modeItems} value={mode} onChange={onModeChange} variant="toggle" aria-label="Application mode" />

      <End />
    </Grid>
  );
}

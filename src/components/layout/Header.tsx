import styled from "styled-components";
import { useNavigate } from "react-router-dom";
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

// Centres the mark over the sidebar rail below it — the rail's icons sit
// centred within its 68px width, but the mark's own width (42px) starts
// flush at the rail's left edge otherwise, landing ~14px left of that centre.
const LogoButton = styled.button`
  margin-left: 14px;
  padding: 0;
  border: none;
  background: none;
  display: flex;
  cursor: pointer;
  border-radius: 50%;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }
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
  const navigate = useNavigate();
  return (
    <Grid>
      <Identity>
        <LogoButton type="button" aria-label="Go to home" title="Home" onClick={() => navigate("/")}>
          <LogoMark size={42} />
        </LogoButton>
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

import styled from "styled-components";
import { Home, Users, Phone, ContactRound, Settings, LogOut } from "lucide-react";

export type SidebarKey = "home" | "customers" | "team" | "calls" | "settings";

export interface SidebarNavProps {
  activeKey: SidebarKey;
  onNavigate: (key: SidebarKey) => void;
}

const navItems: { key: SidebarKey; label: string; Icon: typeof Home }[] = [
  { key: "home", label: "Home", Icon: Home },
  { key: "calls", label: "Calls", Icon: Phone },
  { key: "customers", label: "Customers", Icon: ContactRound },
  { key: "team", label: "Team", Icon: Users },
];

const Rail = styled.nav`
  width: 68px;
  flex: none;
  background: ${({ theme }) => theme.colors.surface.card};
  border-radius: ${({ theme }) => theme.radii.navRail};
  padding: 14px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: 1px solid ${({ theme }) => theme.colors.line.hairline};
  box-shadow: ${({ theme }) => theme.shadows.card};
  position: sticky;
  top: 34px;
`;

const IconWrap = styled.div`
  position: relative;
  display: flex;

  &:hover > span {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, 0);
  }
`;

const IconTooltip = styled.span`
  position: absolute;
  top: 100%;
  left: 50%;
  margin-top: 8px;
  padding: 5px 9px;
  border-radius: ${({ theme }) => theme.radii.pillSm};
  background: ${({ theme }) => theme.colors.text.primary};
  color: ${({ theme }) => theme.colors.text.onAccent};
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, -3px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
  z-index: 50;
`;

const IconCircle = styled.button<{ $active: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active, theme }) => ($active ? theme.colors.text.primary : "transparent")};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.onAccent : theme.colors.text.muted)};
  box-shadow: ${({ $active, theme }) => ($active ? `0 5px 14px ${theme.colors.interaction.focusRing}` : "none")};
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;

  @media (hover: hover) {
    &:hover {
      background: ${({ $active, theme }) => ($active ? theme.colors.text.primary : theme.colors.surface.hover)};
      color: ${({ $active, theme }) => ($active ? theme.colors.text.onAccent : theme.colors.text.secondary)};
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: scale(0.94);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.interaction.focusRing};
  }
`;

// 156px (up from the original 80px) — brings the rail's total height to
// roughly 20% taller than before Settings/Logout were grouped together.
const Spacer = styled.div`
  height: 156px;
`;

export function SidebarNav({ activeKey, onNavigate }: Readonly<SidebarNavProps>) {
  return (
    <Rail aria-label="Primary">
      {navItems.map(({ key, label, Icon }) => (
        <IconWrap key={key}>
          <IconCircle type="button" aria-label={label} $active={activeKey === key} onClick={() => onNavigate(key)}>
            <Icon size={19} strokeWidth={1.7} />
          </IconCircle>
          <IconTooltip>{label}</IconTooltip>
        </IconWrap>
      ))}
      <Spacer />
      <IconWrap>
        <IconCircle type="button" aria-label="Settings" $active={activeKey === "settings"} onClick={() => onNavigate("settings")}>
          <Settings size={19} strokeWidth={1.7} />
        </IconCircle>
        <IconTooltip>Settings</IconTooltip>
      </IconWrap>
      <IconWrap>
        <IconCircle type="button" aria-label="Not implemented" $active={false}>
          <LogOut size={19} strokeWidth={1.7} />
        </IconCircle>
        <IconTooltip>Log out</IconTooltip>
      </IconWrap>
    </Rail>
  );
}

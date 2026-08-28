import styled from "styled-components";
import { Home, Users, Phone, Settings, LogOut } from "lucide-react";

export type SidebarKey = "home" | "team" | "calls" | "settings";

export interface SidebarNavProps {
  activeKey: SidebarKey;
  onNavigate: (key: SidebarKey) => void;
}

const navItems: { key: SidebarKey; label: string; Icon: typeof Home }[] = [
  { key: "home", label: "Home", Icon: Home },
  { key: "team", label: "Team", Icon: Users },
  { key: "calls", label: "Calls", Icon: Phone },
  { key: "settings", label: "Settings", Icon: Settings },
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
  box-shadow: ${({ theme }) => theme.shadows.card};
  position: sticky;
  top: 34px;
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
  transition: background 0.2s ease;
`;

const Spacer = styled.div`
  height: 80px;
`;

export function SidebarNav({ activeKey, onNavigate }: Readonly<SidebarNavProps>) {
  return (
    <Rail aria-label="Primary">
      {navItems.map(({ key, label, Icon }) => (
        <IconCircle key={key} type="button" title={label} aria-label={label} $active={activeKey === key} onClick={() => onNavigate(key)}>
          <Icon size={19} strokeWidth={1.7} />
        </IconCircle>
      ))}
      <Spacer />
      <IconCircle type="button" title="Log out" aria-label="Log out" $active={false}>
        <LogOut size={19} strokeWidth={1.7} />
      </IconCircle>
    </Rail>
  );
}

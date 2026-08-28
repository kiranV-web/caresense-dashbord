import { Outlet } from "react-router-dom";
import { AppShell } from "./AppShell";
import { SidebarNav, type SidebarKey } from "./SidebarNav";
import { useAppChrome } from "@/hooks/useAppChrome";

const sidebarRoutes: Record<SidebarKey, string> = {
  home: "/",
  team: "/team",
  calls: "/calls",
  settings: "/settings",
};

export function DashboardLayout() {
  const { mode, chrome, onModeChange, navigate } = useAppChrome();

  return (
    <AppShell
      title={chrome.title}
      subtitle={chrome.subtitle}
      mode={mode}
      onModeChange={onModeChange}
      sidebar={<SidebarNav activeKey={chrome.sidebarKey} onNavigate={(key) => navigate(sidebarRoutes[key])} />}
    >
      <Outlet />
    </AppShell>
  );
}

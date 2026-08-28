import { Outlet } from "react-router-dom";
import { AppShell } from "./AppShell";
import { useAppChrome } from "@/hooks/useAppChrome";

export function FocusLayout() {
  const { mode, chrome, onModeChange } = useAppChrome();

  return (
    <AppShell title={chrome.title} subtitle={chrome.subtitle} mode={mode} onModeChange={onModeChange}>
      <Outlet />
    </AppShell>
  );
}

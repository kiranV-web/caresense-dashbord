import { useNavigate, useLocation } from "react-router-dom";
import type { AppMode } from "@/components/layout/Header";
import type { SidebarKey } from "@/components/layout/SidebarNav";

interface PageChrome {
  title: string;
  subtitle: string;
  sidebarKey: SidebarKey;
}

function chromeFor(pathname: string): PageChrome {
  if (pathname === "/") {
    return { title: "Good morning, Alex", subtitle: "Here is what is happening with your support team today.", sidebarKey: "home" };
  }
  if (pathname === "/team") {
    return { title: "Team", subtitle: "Agent performance for the selected period", sidebarKey: "team" };
  }
  if (pathname.startsWith("/team/")) {
    return { title: "Team", subtitle: "Agent overview", sidebarKey: "team" };
  }
  if (pathname === "/calls") {
    return { title: "Calls", subtitle: "1,284 calls · 24 – 26 Aug", sidebarKey: "calls" };
  }
  if (pathname.startsWith("/calls/")) {
    return { title: "Calls", subtitle: "Call detail", sidebarKey: "calls" };
  }
  if (pathname === "/settings") {
    return { title: "Settings", subtitle: "Call analysis rules", sidebarKey: "settings" };
  }
  return { title: "Home", subtitle: "", sidebarKey: "home" };
}

/** Derives header/sidebar chrome from the current route and exposes mode navigation. */
export function useAppChrome() {
  const location = useLocation();
  const navigate = useNavigate();

  const mode: AppMode = location.pathname === "/upload" ? "upload" : location.pathname === "/chat" ? "chat" : "dash";

  const chrome: PageChrome =
    mode === "upload"
      ? { title: "Upload recordings", subtitle: "Batch analysis for retail bank support calls", sidebarKey: "home" }
      : mode === "chat"
        ? { title: "Chat agent", subtitle: "Ask about calls, agents and devices", sidebarKey: "home" }
        : chromeFor(location.pathname);

  function onModeChange(next: AppMode) {
    if (next === "upload") navigate("/upload");
    else if (next === "chat") navigate("/chat");
    else navigate("/");
  }

  return { mode, chrome, onModeChange, navigate };
}

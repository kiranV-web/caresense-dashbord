import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FocusLayout } from "@/components/layout/FocusLayout";
import { HomePage } from "@/pages/HomePage";
import { TeamPage } from "@/pages/TeamPage";
import { AgentDetailPage } from "@/pages/AgentDetailPage";
import { CallsPage } from "@/pages/CallsPage";
import { CallDetailPage } from "@/pages/CallDetailPage";
import { RecurringGroupDetailPage } from "@/pages/RecurringGroupDetailPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { UploadPage } from "@/pages/UploadPage";
import { ChatPage } from "@/pages/ChatPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { CustomerDetailPage } from "@/pages/CustomerDetailPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team/:agentId" element={<AgentDetailPage />} />
        <Route path="/calls" element={<CallsPage />} />
        <Route path="/calls/:callId" element={<CallDetailPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
        <Route path="/recurring-groups/:groupId" element={<RecurringGroupDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route element={<FocusLayout />}>
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Route>
    </Routes>
  );
}

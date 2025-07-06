
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Dashboard from "@/pages/Dashboard";
import JobsPage from "@/pages/JobsPage";
import ClientsPage from "@/pages/ClientsPage";
import SchedulePage from "@/pages/SchedulePage";
import EstimatesPage from "@/pages/EstimatesPage";
import InvoicesPage from "@/pages/InvoicesPage";
import FinancePage from "@/pages/FinancePage";
import ReportsPage from "@/pages/ReportsPage";
import MessagesPage from "@/pages/MessagesPage";
import SettingsPage from "@/pages/SettingsPage";
import AutomationsPage from "@/pages/AutomationsPage";
import TeamManagementPage from "@/pages/TeamManagementPage";
import ProfileCompanyPage from "@/pages/ProfileCompanyPage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ClientDetailPage from "@/pages/ClientDetailPage";
import TeamMemberProfilePage from "@/pages/TeamMemberProfilePage";
import PhoneNumbersPage from "@/pages/PhoneNumbersPage";
import PhoneNumbersSettingsPage from "@/pages/settings/PhoneNumbersSettingsPage";
import PhoneNumberManagement from "@/pages/PhoneNumberManagement";
import ConnectCenterPageOptimized from "@/pages/ConnectCenterPageOptimized";
import DocumentsPage from "@/pages/DocumentsPage";
import TasksPage from "@/pages/TasksPage";
import InventoryPage from "@/pages/InventoryPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import ProductsPage from "@/pages/ProductsPage";
import EstimateViewPage from "@/pages/EstimateViewPage";
import InvoicePortal from "@/pages/InvoicePortal";
import EstimatePortal from "@/pages/EstimatePortal";
import ClientPortal from "@/pages/ClientPortal";
import ApprovalPage from "@/pages/ApprovalPage";
import ApprovalSuccessPage from "@/pages/ApprovalSuccessPage";
import ApprovalTestPage from "@/pages/ApprovalTestPage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import AuthPage from "@/pages/AuthPage";
import PreviewPage from "@/pages/PreviewPage";
import AcceptInvitationPage from "@/pages/AcceptInvitationPage";
import AdminRolesPage from "@/pages/AdminRolesPage";
import TestPortalAccessPage from "@/pages/TestPortalAccessPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AdvancedReportsPage from "@/pages/AdvancedReportsPage";
import ReportBuilderPage from "@/pages/ReportBuilderPage";
import AiCenterPage from "@/pages/AiCenterPage";
import TestWorkflowPage from "@/pages/TestWorkflowPage";
import PhoneManagementPage from "@/pages/PhoneManagementPage";
import TelnyxDebugPage from "@/pages/TelnyxDebugPage";
import JobCreationTestPage from "@/pages/JobCreationTestPage";
import NotFound from "@/pages/NotFound";
import { GlobalRealtimeProvider } from "@/contexts/GlobalRealtimeProvider";
import { AppProviders } from "@/components/ui/AppProviders";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalRealtimeProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppProviders>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/clients/:clientId" element={<ClientDetailPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/estimates" element={<EstimatesPage />} />
                <Route path="/estimates/:estimateId" element={<EstimateViewPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/reports/advanced" element={<AdvancedReportsPage />} />
                <Route path="/reports/builder" element={<ReportBuilderPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/connect" element={<ConnectCenterPageOptimized />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/configuration" element={<ConfigurationPage />} />
                <Route path="/automations" element={<AutomationsPage />} />
                <Route path="/ai" element={<AiCenterPage />} />
                <Route path="/team" element={<TeamManagementPage />} />
                <Route path="/team/:userId" element={<TeamMemberProfilePage />} />
                <Route path="/phone-numbers" element={<PhoneNumbersPage />} />
                <Route path="/settings/phone-numbers" element={<PhoneNumbersSettingsPage />} />
                <Route path="/phone-management" element={<PhoneNumberManagement />} />
                <Route path="/phone-mgmt" element={<PhoneManagementPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/profile/company" element={<ProfileCompanyPage />} />
                <Route path="/invoice-portal/:invoiceId" element={<InvoicePortal />} />
                <Route path="/estimate-portal/:estimateId" element={<EstimatePortal />} />
                <Route path="/client-portal/:clientId" element={<ClientPortal />} />
                <Route path="/approval/:token" element={<ApprovalPage />} />
                <Route path="/approval-success" element={<ApprovalSuccessPage />} />
                <Route path="/approval-test" element={<ApprovalTestPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/preview" element={<PreviewPage />} />
                <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
                <Route path="/admin/roles" element={<AdminRolesPage />} />
                <Route path="/test-portal" element={<TestPortalAccessPage />} />
                <Route path="/test-workflow" element={<TestWorkflowPage />} />
                <Route path="/telnyx-debug" element={<TelnyxDebugPage />} />
                <Route path="/test-job-creation" element={<JobCreationTestPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppProviders>
          </BrowserRouter>
        </TooltipProvider>
      </GlobalRealtimeProvider>
    </QueryClientProvider>
  );
}

export default App;

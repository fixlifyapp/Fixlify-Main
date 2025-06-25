
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageLayout } from "./components/layout/PageLayout";
import { RBACProvider } from "./components/auth/RBACProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Page imports
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import ClientsPage from "./pages/ClientsPage";
import SchedulePage from "./pages/SchedulePage";
import FinancePage from "./pages/FinancePage";
import ConnectPage from "./pages/ConnectPage";
import CommunicationsPage from "./pages/CommunicationsPage";
import AiCenterPage from "./pages/AiCenterPage";
import AutomationsPage from "./pages/AutomationsPage";
import AutomationsVisualBuilderPage from "./pages/AutomationsVisualBuilderPage";
import AutomationsFormBuilderPage from "./pages/AutomationsFormBuilderPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TeamPage from "./pages/TeamPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RBACProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageLayout>
                  <DashboardPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={
              <ProtectedRoute>
                <PageLayout>
                  <JobsPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <PageLayout>
                  <ClientsPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <PageLayout>
                  <SchedulePage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/finance" element={
              <ProtectedRoute>
                <PageLayout>
                  <FinancePage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/connect" element={
              <ProtectedRoute>
                <PageLayout>
                  <ConnectPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/communications" element={
              <ProtectedRoute>
                <PageLayout>
                  <CommunicationsPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-center" element={
              <ProtectedRoute>
                <PageLayout>
                  <AiCenterPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/automations" element={
              <ProtectedRoute>
                <PageLayout>
                  <AutomationsPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/automations/visual-builder" element={
              <ProtectedRoute>
                <PageLayout>
                  <AutomationsVisualBuilderPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/automations/form-builder" element={
              <ProtectedRoute>
                <PageLayout>
                  <AutomationsFormBuilderPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <PageLayout>
                  <AnalyticsPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <PageLayout>
                  <TeamPage />
                </PageLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <PageLayout>
                  <SettingsPage />
                </PageLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </RBACProvider>
  </QueryClientProvider>
);

export default App;

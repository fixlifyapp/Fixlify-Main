import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

import AuthPage from "@/pages/AuthPage";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import JobsPageOptimized from "@/pages/JobsPageOptimized";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ClientsPage from "@/pages/ClientsPage";
import ClientDetailPage from "@/pages/ClientDetailPage";
import EstimatesPage from "@/pages/EstimatesPage";
import EstimateViewPage from "@/pages/EstimateViewPage";
import InvoicesPage from "@/pages/InvoicesPage";
import FinancePage from "@/pages/FinancePage";
import SchedulePage from "@/pages/SchedulePage";
import MessagesPage from "@/pages/MessagesPage";
import ConnectCenterPageOptimized from "@/pages/ConnectCenterPageOptimized";
import ReportsPage from "@/pages/ReportsPage";
import ReportBuilderPage from "@/pages/ReportBuilderPage";
import AdvancedReportsPage from "@/pages/AdvancedReportsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AdvancedDashboard from "@/pages/AdvancedDashboard";
import TeamManagementPage from "@/pages/TeamManagementPage";
import TeamMemberProfilePage from "@/pages/TeamMemberProfilePage";
import TeamCollaborationPage from "@/pages/TeamCollaborationPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfileCompanyPage from "@/pages/ProfileCompanyPage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import AISettingsPage from "@/pages/AISettingsPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import TelnyxSettingsPage from "@/pages/TelnyxSettingsPage";
import PhoneNumbersPage from "@/pages/PhoneNumbersPage";
import TelnyxPage from "@/pages/TelnyxPage";
import ProductsPage from "@/pages/ProductsPage";
import InventoryPage from "@/pages/InventoryPage";
import AutomationsPage from "@/pages/AutomationsPage";
import DocumentsPage from "@/pages/DocumentsPage";
import AiCenterPage from "@/pages/AiCenterPage";
import PreviewPage from "@/pages/PreviewPage";
import AdminRolesPage from "@/pages/AdminRolesPage";
import ApprovalPage from "@/pages/ApprovalPage";
import ApprovalSuccessPage from "@/pages/ApprovalSuccessPage";
import TestRealtimePage from "@/pages/TestRealtimePage";
import NotFound from "@/pages/NotFound";
import { AppProviders } from "@/components/ui/AppProviders";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ClientPortal from "./pages/ClientPortal";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";

const queryClient = new QueryClient();

// Wrapper component for protected routes with providers
const ProtectedRouteWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <AppProviders>
        {children}
      </AppProviders>
    </ProtectedRoute>
  );
};

// Wrapper component for public routes with auth context (no auth required but auth context available)
const PublicRouteWithAuth = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </AuthProvider>
  );
};

// Wrapper component for public routes (no auth providers)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/auth" element={
            <AuthProvider>
              <TooltipProvider>
                <AuthPage />
              </TooltipProvider>
            </AuthProvider>
          } />
          {/* Client Portal routes - completely public with token access */}
          <Route path="/portal/:accessToken" element={<PublicRoute><ClientPortal /></PublicRoute>} />
          
          {/* Approval routes - public with no auth context */}
          <Route path="/approve/:token" element={<PublicRoute><ApprovalPage /></PublicRoute>} />
          <Route path="/approve/:token/success" element={<PublicRoute><ApprovalSuccessPage /></PublicRoute>} />
          
          {/* Team invitation acceptance - public route */}
          <Route path="/accept-invitation" element={<PublicRoute><AcceptInvitationPage /></PublicRoute>} />
          
          {/* Root route - now public with auth context */}
          <Route path="/" element={
            <AuthProvider>
              <TooltipProvider>
                <Index />
              </TooltipProvider>
            </AuthProvider>
          } />
          
          {/* Protected routes with authentication */}
          <Route path="/dashboard" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><Dashboard /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/jobs" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><JobsPageOptimized /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/jobs/:jobId" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><JobDetailsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/clients" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><ClientsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/clients/:id" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><ClientDetailPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/estimates" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><EstimatesPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/estimates/:id" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><EstimateViewPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/invoices" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><InvoicesPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/finance" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><FinancePage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/schedule" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><SchedulePage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/messages" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><MessagesPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/connect" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><ConnectCenterPageOptimized /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/reports" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><ReportsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/reports/builder" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><ReportBuilderPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/reports/advanced" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><AdvancedReportsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/analytics" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><AnalyticsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/advanced-dashboard" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><AdvancedDashboard /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/team" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><TeamManagementPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/team/:userId" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><TeamMemberProfilePage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/team/collaboration" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><TeamCollaborationPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/settings" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><SettingsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/settings/profile" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><ProfileCompanyPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/profile-company" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><ProfileCompanyPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/settings/configuration" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><ConfigurationPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/configuration" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><ConfigurationPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/settings/ai" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><AISettingsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/ai-settings" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><AISettingsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/settings/integrations" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><IntegrationsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/integrations" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><IntegrationsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/settings/telnyx" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><TelnyxSettingsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/telnyx-settings" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><TelnyxSettingsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/phone-numbers" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><PhoneNumbersPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/telnyx" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><TelnyxPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/products" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><ProductsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/inventory" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><InventoryPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/automations" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><AutomationsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/documents" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><DocumentsPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/ai-center" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><AiCenterPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/preview" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><PreviewPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/admin/roles" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><AdminRolesPage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/test-realtime" element={
            <AuthProvider>
              <ProtectedRouteWithProviders><TestRealtimePage /></ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

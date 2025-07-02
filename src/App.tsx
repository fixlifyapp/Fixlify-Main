import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppProviders } from "@/components/ui/AppProviders";

// Pages
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import JobsPageOptimized from "@/pages/JobsPageOptimized";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ClientsPage from "@/pages/ClientsPage";
import ClientDetailPage from "@/pages/ClientDetailPage";
import SchedulePage from "@/pages/SchedulePage";
import FinancePage from "@/pages/FinancePage";
import ConnectCenterPageOptimized from "@/pages/ConnectCenterPageOptimized";
import AiCenterPage from "@/pages/AiCenterPage";
import AutomationsPage from "@/pages/AutomationsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import TeamManagementPage from "@/pages/TeamManagementPage";
import TasksPage from "@/pages/TasksPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfileCompanyPage from "@/pages/ProfileCompanyPage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import ProductsPage from "@/pages/ProductsPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import PhoneNumbersPage from "@/pages/PhoneNumbersPage";
import PhoneManagementPage from "@/pages/PhoneManagementPage";
import EstimatesPage from "@/pages/EstimatesPage";
import InvoicesPage from "@/pages/InvoicesPage";
import ReportsPage from "@/pages/ReportsPage";
import DocumentsPage from "@/pages/DocumentsPage";
import InventoryPage from "@/pages/InventoryPage";
import AdminRolesPage from "@/pages/AdminRolesPage";
import TeamMemberProfilePage from "@/pages/TeamMemberProfilePage";
import AcceptInvitationPage from "@/pages/AcceptInvitationPage";
import ClientPortal from "@/pages/ClientPortal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

// Wrapper for protected routes with providers
const ProtectedRouteWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <AppProviders>
        {children}
      </AppProviders>
    </ProtectedRoute>
  );
};

function App() {
  console.log('🚀 Fixlify App loaded');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Authentication */}
            <Route path="/auth" element={
              <AuthProvider>
                <AuthPage />
              </AuthProvider>
            } />
            
            {/* Accept Invitation */}
            <Route path="/accept-invitation/:token" element={
              <AuthProvider>
                <AcceptInvitationPage />
              </AuthProvider>
            } />
            
            {/* Client Portal */}
            <Route path="/portal/:accessToken" element={
              <ClientPortal />
            } />
            
            {/* Root redirect */}
            <Route path="/" element={
              <AuthProvider>
                <Navigate to="/dashboard" replace />
              </AuthProvider>
            } />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <Dashboard />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Jobs */}
            <Route path="/jobs" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <JobsPageOptimized />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/jobs/:jobId" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <JobDetailsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Clients */}
            <Route path="/clients" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <ClientsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/clients/:clientId" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <ClientDetailPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Schedule */}
            <Route path="/schedule" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <SchedulePage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Finance */}
            <Route path="/finance" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <FinancePage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/estimates" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <EstimatesPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/invoices" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <InvoicesPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Communication */}
            <Route path="/communications" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <ConnectCenterPageOptimized />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Messages - Redirect to Connect Center */}
            <Route path="/messages" element={
              <Navigate to="/communications?tab=messages" replace />
            } />
            
            {/* AI Center */}
            <Route path="/ai-center" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <AiCenterPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Automations */}
            <Route path="/automations" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <AutomationsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Analytics */}
            <Route path="/analytics" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <AnalyticsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/reports" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <ReportsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Team */}
            <Route path="/team" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <TeamManagementPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/team/:memberId" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <TeamMemberProfilePage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Tasks */}
            <Route path="/tasks" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <TasksPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Settings Routes */}
            <Route path="/settings" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <SettingsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/settings/profile" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <ProfileCompanyPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/profile-company" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <ProfileCompanyPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/settings/configuration" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <ConfigurationPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/configuration" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <ConfigurationPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/settings/products" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <ProductsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/products" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <ProductsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/settings/integrations" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <IntegrationsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/integrations" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <IntegrationsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/settings/phone-numbers" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <PhoneNumbersPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/phone-numbers" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <PhoneNumbersPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/phone-management" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <PhoneManagementPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/settings/admin-roles" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <AdminRolesPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/admin-roles" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <AdminRolesPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/documents" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <DocumentsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/inventory" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <InventoryPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* 404 */}
            <Route path="*" element={
              <div style={{ padding: '20px' }}>
                <h1>404 - Page not found</h1>
                <a href="/dashboard">Go to Dashboard</a>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

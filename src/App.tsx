import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppProviders } from "@/components/ui/AppProviders";
import { setupAuthErrorHandler } from "@/utils/auth-fix";
import { suppressSMSErrors } from "@/utils/suppressSMSErrors";
import authMonitor from "@/utils/auth-monitor.js?raw";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Critical pages (loaded immediately)
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";

// Lazy load all other pages
const TestDashboard = lazy(() => import("@/pages/TestDashboard"));
const TestPage = lazy(() => import("@/pages/TestPage"));
const JobsPageOptimized = lazy(() => import("@/pages/JobsPageOptimized"));
const JobDetailsPage = lazy(() => import("@/pages/JobDetailsPage"));
const ClientsPage = lazy(() => import("@/pages/ClientsPage"));
const ClientDetailPage = lazy(() => import("@/pages/ClientDetailPage"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const FinancePage = lazy(() => import("@/pages/FinancePage"));
const ConnectCenterPage = lazy(() => import("@/pages/ConnectCenterPage"));
const ConnectPage = lazy(() => import("@/pages/ConnectPage"));
const AiCenterPage = lazy(() => import("@/pages/AiCenterPage"));
const AutomationsPage = lazy(() => import("@/pages/AutomationsPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const TeamManagementPage = lazy(() => import("@/pages/TeamManagementPage"));
const TasksPage = lazy(() => import("@/pages/TasksPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ProfileCompanyPage = lazy(() => import("@/pages/ProfileCompanyPage"));
const ConfigurationPage = lazy(() => import("@/pages/ConfigurationPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const IntegrationsPage = lazy(() => import("@/pages/IntegrationsPage"));
const PhoneNumbersPage = lazy(() => import("@/pages/PhoneNumbersPage"));
const PhoneNumbersSettingsPage = lazy(() => import("@/pages/settings/PhoneNumbersSettingsPage"));
const PhoneManagementPage = lazy(() => import("@/pages/PhoneManagementPage"));
const EstimatesPage = lazy(() => import("@/pages/EstimatesPage"));
const InvoicesPage = lazy(() => import("@/pages/InvoicesPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const AdminRolesPage = lazy(() => import("@/pages/AdminRolesPage"));
const TeamMemberProfilePage = lazy(() => import("@/pages/TeamMemberProfilePage"));
const AcceptInvitationPage = lazy(() => import("@/pages/AcceptInvitationPage"));
const ClientPortal = lazy(() => import("@/pages/ClientPortal"));
const TestPortalAccessPage = lazy(() => import("@/pages/TestPortalAccessPage"));
const EstimatePortal = lazy(() => import("@/pages/EstimatePortal"));
const InvoicePortal = lazy(() => import("@/pages/InvoicePortal"));

import EdgeFunctionsPage from "@/pages/EdgeFunctionsPage";
import SMSTestPage from "@/pages/SMSTestPage"
import EmailTestPage from "@/pages/EmailTestPage";

// Helper component for lazy loaded routes
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
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
  
  // Setup auth error handler
  React.useEffect(() => {
    setupAuthErrorHandler();
    suppressSMSErrors();
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
            
            {/* Estimate View */}
            <Route path="/portal/estimate/:token" element={
              <EstimatePortal />
            } />
            
            {/* Invoice View */}
            <Route path="/portal/invoice/:token" element={
              <InvoicePortal />
            } />
            
            {/* Test Portal Access */}
            <Route path="/test-portal-access" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <TestPortalAccessPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            


            {/* Edge Functions Management */}
            <Route path="/edge-functions" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <EdgeFunctionsPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* SMS Test Page */}
            <Route path="/sms-test" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <SMSTestPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Email Test Page */}
            <Route path="/email-test" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <EmailTestPage />
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Root redirect */}
            <Route path="/" element={
              <AuthProvider>
                <Navigate to="/dashboard" replace />
              </AuthProvider>
            } />
            
            {/* Test Page */}
            <Route path="/test" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <LazyRoute>
                    <TestPage />
                  </LazyRoute>
                </ProtectedRouteWithProviders>
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
                  <LazyRoute>
                    <JobsPageOptimized />
                  </LazyRoute>
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/jobs/:jobId" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <LazyRoute>
                    <JobDetailsPage />
                  </LazyRoute>
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Clients */}
            <Route path="/clients" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <LazyRoute>
                    <ClientsPage />
                  </LazyRoute>
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/clients/:clientId" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <LazyRoute>
                    <ClientDetailPage />
                  </LazyRoute>
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Schedule */}
            <Route path="/schedule" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <LazyRoute>
                    <SchedulePage />
                  </LazyRoute>
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Finance */}
            <Route path="/finance" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <LazyRoute>
                    <FinancePage />
                  </LazyRoute>
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/estimates" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <LazyRoute>
                    <EstimatesPage />
                  </LazyRoute>
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            <Route path="/invoices" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <LazyRoute>
                    <InvoicesPage />
                  </LazyRoute>
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Connect - Main communication hub */}
            <Route path="/connect" element={
              <AuthProvider>
                <ProtectedRouteWithProviders>
                  <LazyRoute>
                    <ConnectPage />
                  </LazyRoute>
                </ProtectedRouteWithProviders>
              </AuthProvider>
            } />
            
            {/* Communication - Legacy route, redirect to Connect */}
            <Route path="/communications" element={
              <Navigate to="/connect" replace />
            } />
            
            {/* Messages - Redirect to Connect */}
            <Route path="/messages" element={
              <Navigate to="/connect" replace />
            } />
            
            {/* Email - Redirect to Connect */}
            <Route path="/email" element={
              <Navigate to="/connect" replace />
            } />
            
            {/* Calls - Redirect to Connect */}
            <Route path="/calls" element={
              <Navigate to="/connect" replace />
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
                  <PhoneNumbersSettingsPage />
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

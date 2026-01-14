import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppProviders } from "@/components/ui/AppProviders";
// Auth fix removed
import { suppressSMSErrors } from "@/utils/suppressSMSErrors";
import authMonitor from "@/utils/auth-monitor.js?raw";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PWAUpdateHandler } from "@/components/pwa/PWAUpdateHandler";
// Import real-time debug utility
import "@/utils/realtimeDebug";
// Import real-time error handler
import "@/utils/realtimeErrorHandler";
// Automation now handled by database triggers and cron jobs

// Pages - Critical pages loaded immediately, others lazy-loaded
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import JobsPageOptimized from "@/pages/JobsPageOptimized";
import AcceptInvitationPage from "@/pages/AcceptInvitationPage";
import UniversalPortal from "@/pages/UniversalPortal";

// Lazy-loaded pages to reduce initial bundle
const JobDetailsPage = React.lazy(() => import("@/pages/JobDetailsPage"));
const ClientsPage = React.lazy(() => import("@/pages/ClientsPage"));
const ClientDetailPage = React.lazy(() => import("@/pages/ClientDetailPageV2"));
const SchedulePage = React.lazy(() => import("@/pages/SchedulePage"));
const FinancePage = React.lazy(() => import("@/pages/FinancePage"));
const EstimatesPage = React.lazy(() => import("@/pages/EstimatesPage"));
const InvoicesPage = React.lazy(() => import("@/pages/InvoicesPage"));
const ConnectPage = React.lazy(() => import("@/pages/ConnectPage"));
const AiCenterPage = React.lazy(() => import("@/pages/AiCenterPage"));
const AutomationsPage = React.lazy(() => import("@/pages/AutomationsPage"));
const AnalyticsPage = React.lazy(() => import("@/pages/AnalyticsPage"));
const ReportsPage = React.lazy(() => import("@/pages/ReportsPage"));
const TeamManagementPage = React.lazy(() => import("@/pages/TeamManagementPage"));
const TeamMemberProfilePage = React.lazy(() => import("@/pages/TeamMemberProfilePage"));
const TasksPage = React.lazy(() => import("@/pages/TasksPage"));
const SettingsPage = React.lazy(() => import("@/pages/SettingsPage"));
const ProfileCompanyPage = React.lazy(() => import("@/pages/ProfileCompanyPage"));
const ConfigurationPage = React.lazy(() => import("@/pages/ConfigurationPage"));
const ProductsPage = React.lazy(() => import("@/pages/ProductsPage"));
const IntegrationsPage = React.lazy(() => import("@/pages/IntegrationsPage"));
const PhoneNumberManagementPage = React.lazy(() => import("@/pages/PhoneNumberManagementPage"));
const PhoneNumberPurchasePage = React.lazy(() => import("@/pages/PhoneNumberPurchasePage"));
const PhoneNumberConfigPage = React.lazy(() => import("@/pages/settings/PhoneNumberConfigPage"));
const AIInsightsPage = React.lazy(() => import("@/pages/settings/AIInsightsPage"));
const BillingPage = React.lazy(() => import("@/pages/settings/BillingPage"));
const DocumentsPage = React.lazy(() => import("@/pages/DocumentsPage"));
const InventoryPage = React.lazy(() => import("@/pages/InventoryPage"));
const AdminRolesPage = React.lazy(() => import("@/pages/AdminRolesPage"));
const EdgeFunctionsPage = React.lazy(() => import("@/pages/EdgeFunctionsPage"));
const AdminPhonePoolPage = React.lazy(() => import("@/pages/AdminPhonePoolPage"));
const ClientPortal = React.lazy(() => import("@/pages/ClientPortal"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 20 * 60 * 1000, // 20 minutes
      refetchInterval: false, // Disable automatic refetching
    },
  },
});

// Loading fallback component for lazy-loaded routes
const PageLoadingFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '18px', marginBottom: '16px' }}>Loading...</div>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f0f0f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

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

// Wrapper for lazy-loaded protected routes
const LazyProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={<PageLoadingFallback />}>
    <AuthProvider>
      <ProtectedRouteWithProviders>
        {children}
      </ProtectedRouteWithProviders>
    </AuthProvider>
  </React.Suspense>
);

function App() {
  // Setup auth error handler
  React.useEffect(() => {
    suppressSMSErrors();
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <PWAUpdateHandler />
          <InstallPrompt />
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
            
            {/* Universal Portal - handles both estimates and invoices */}
            <Route path="/portal/:token" element={
              <UniversalPortal />
            } />

            {/* Client Portal - full dashboard for client with all their documents */}
            <Route path="/client-portal/:accessToken" element={
              <React.Suspense fallback={<PageLoadingFallback />}>
                <ClientPortal />
              </React.Suspense>
            } />

            {/* Edge Functions Management */}
            <Route path="/edge-functions" element={
              <LazyProtectedRoute>
                <EdgeFunctionsPage />
              </LazyProtectedRoute>
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
              <LazyProtectedRoute>
                <JobDetailsPage />
              </LazyProtectedRoute>
            } />

            {/* Clients */}
            <Route path="/clients" element={
              <LazyProtectedRoute>
                <ClientsPage />
              </LazyProtectedRoute>
            } />

            <Route path="/clients/:clientId" element={
              <LazyProtectedRoute>
                <ClientDetailPage />
              </LazyProtectedRoute>
            } />

            {/* Schedule */}
            <Route path="/schedule" element={
              <LazyProtectedRoute>
                <SchedulePage />
              </LazyProtectedRoute>
            } />

            {/* Finance */}
            <Route path="/finance" element={
              <LazyProtectedRoute>
                <FinancePage />
              </LazyProtectedRoute>
            } />

            <Route path="/estimates" element={
              <LazyProtectedRoute>
                <EstimatesPage />
              </LazyProtectedRoute>
            } />

            <Route path="/invoices" element={
              <LazyProtectedRoute>
                <InvoicesPage />
              </LazyProtectedRoute>
            } />

            {/* Connect - Main communication hub */}
            <Route path="/connect" element={
              <LazyProtectedRoute>
                <ConnectPage />
              </LazyProtectedRoute>
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
              <LazyProtectedRoute>
                <AiCenterPage />
              </LazyProtectedRoute>
            } />
            
            {/* Automations */}
            <Route path="/automations" element={
              <LazyProtectedRoute>
                <AutomationsPage />
              </LazyProtectedRoute>
            } />
            
            {/* Analytics */}
            <Route path="/analytics" element={
              <LazyProtectedRoute>
                <AnalyticsPage />
              </LazyProtectedRoute>
            } />

            <Route path="/reports" element={
              <LazyProtectedRoute>
                <ReportsPage />
              </LazyProtectedRoute>
            } />
            
            {/* Team */}
            <Route path="/team" element={
              <LazyProtectedRoute>
                <TeamManagementPage />
              </LazyProtectedRoute>
            } />

            <Route path="/team/:memberId" element={
              <LazyProtectedRoute>
                <TeamMemberProfilePage />
              </LazyProtectedRoute>
            } />
            
            {/* Tasks */}
            <Route path="/tasks" element={
              <LazyProtectedRoute>
                <TasksPage />
              </LazyProtectedRoute>
            } />
            
            {/* Settings Routes */}
            <Route path="/settings" element={
              <LazyProtectedRoute>
                <SettingsPage />
              </LazyProtectedRoute>
            } />

            <Route path="/settings/profile" element={
              <LazyProtectedRoute>
                <ProfileCompanyPage />
              </LazyProtectedRoute>
            } />

            <Route path="/profile-company" element={
              <LazyProtectedRoute>
                <ProfileCompanyPage />
              </LazyProtectedRoute>
            } />

            <Route path="/settings/configuration" element={
              <LazyProtectedRoute>
                <ConfigurationPage />
              </LazyProtectedRoute>
            } />

            <Route path="/configuration" element={
              <LazyProtectedRoute>
                <ConfigurationPage />
              </LazyProtectedRoute>
            } />

            <Route path="/settings/products" element={
              <LazyProtectedRoute>
                <ProductsPage />
              </LazyProtectedRoute>
            } />

            <Route path="/products" element={
              <LazyProtectedRoute>
                <ProductsPage />
              </LazyProtectedRoute>
            } />

            <Route path="/settings/integrations" element={
              <LazyProtectedRoute>
                <IntegrationsPage />
              </LazyProtectedRoute>
            } />

            <Route path="/integrations" element={
              <LazyProtectedRoute>
                <IntegrationsPage />
              </LazyProtectedRoute>
            } />

            <Route path="/settings/phone-numbers" element={
              <LazyProtectedRoute>
                <PhoneNumberManagementPage />
              </LazyProtectedRoute>
            } />

            <Route path="/settings/phone-numbers/purchase" element={
              <LazyProtectedRoute>
                <PhoneNumberPurchasePage />
              </LazyProtectedRoute>
            } />

            <Route path="/settings/phone-config/:phoneId" element={
              <LazyProtectedRoute>
                <PhoneNumberConfigPage />
              </LazyProtectedRoute>
            } />

            <Route path="/settings/ai-insights" element={
              <LazyProtectedRoute>
                <AIInsightsPage />
              </LazyProtectedRoute>
            } />

            <Route path="/settings/billing" element={
              <LazyProtectedRoute>
                <BillingPage />
              </LazyProtectedRoute>
            } />

            <Route path="/settings/admin-roles" element={
              <LazyProtectedRoute>
                <AdminRolesPage />
              </LazyProtectedRoute>
            } />

            {/* Admin Phone Pool Management */}
            <Route path="/admin/phone-pool" element={
              <LazyProtectedRoute>
                <AdminPhonePoolPage />
              </LazyProtectedRoute>
            } />

            <Route path="/admin-roles" element={
              <LazyProtectedRoute>
                <AdminRolesPage />
              </LazyProtectedRoute>
            } />

            <Route path="/documents" element={
              <LazyProtectedRoute>
                <DocumentsPage />
              </LazyProtectedRoute>
            } />

            <Route path="/inventory" element={
              <LazyProtectedRoute>
                <InventoryPage />
              </LazyProtectedRoute>
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
    </ErrorBoundary>
  );
}

export default App;

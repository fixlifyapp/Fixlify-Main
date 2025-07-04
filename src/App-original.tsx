import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import TestPage from "@/pages/TestPage";
import JobsPageOptimized from "@/pages/JobsPageOptimized";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ClientsPage from "@/pages/ClientsPage";
import ClientDetailPage from "@/pages/ClientDetailPage";
import SchedulePage from "@/pages/SchedulePage";
import FinancePage from "@/pages/FinancePage";
import ConnectCenterPageOptimized from "@/pages/ConnectCenterPageOptimized";
import CommunicationsSettingsPage from "@/pages/CommunicationsSettingsPage";
import AiCenterPage from "@/pages/AiCenterPage";
import AutomationsPage from "@/pages/AutomationsPage";
import AutomationBuilderPage from "@/pages/AutomationBuilderPage";
import AutomationTemplatesPage from "@/pages/AutomationTemplatesPage";
import AiAutomationPage from "@/pages/AiAutomationPage";
import AutomationAnalyticsPage from "@/pages/AutomationAnalyticsPage";
import AutomationTestingPage from "@/pages/AutomationTestingPage";
import AutomationSettingsPage from "@/pages/AutomationSettingsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import TeamManagementPage from "@/pages/TeamManagementPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfileCompanyPage from "@/pages/ProfileCompanyPage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import ProductsPage from "@/pages/ProductsPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppProviders } from "@/components/ui/AppProviders";

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

const AdvancedDashboard = lazy(() => import("@/pages/AdvancedDashboard"));

function App() {
  console.log('🚀 Fixlify App fully loaded');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Default route redirects to dashboard if authenticated, otherwise to auth */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Auth routes */}
          <Route path="/auth" element={
            <AuthProvider>
              <TooltipProvider>
                <AuthPage />
              </TooltipProvider>
            </AuthProvider>
          } />
          
          {/* Legacy login route redirects to auth */}
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          
          {/* Test route for debugging */}
          <Route path="/test" element={<TestPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <Dashboard />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
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
          
          <Route path="/clients" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <ClientsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/clients/:id" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <ClientDetailPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/schedule" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <SchedulePage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/finance" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <FinancePage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/connect" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <ConnectCenterPageOptimized />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/communications" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <CommunicationsSettingsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/ai-center" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <AiCenterPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/automations" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <AutomationsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/automations/builder" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <AutomationBuilderPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/automations/templates" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <AutomationTemplatesPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/automations/ai" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <AiAutomationPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/automations/analytics" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <AutomationAnalyticsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/automations/testing" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <AutomationTestingPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/automations/settings" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <AutomationSettingsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />

          
          <Route path="/analytics" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <AnalyticsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/team" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <TeamManagementPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/settings" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <SettingsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          {/* Settings sub-routes */}
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
          
          <Route path="/settings/telnyx" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <CommunicationsSettingsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/settings/ai" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <CommunicationsSettingsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/ai-settings" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <CommunicationsSettingsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/settings/profile-company" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <ProfileCompanyPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/settings/configuration-page" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <ConfigurationPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/settings/products-page" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <ProductsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/settings/integrations-page" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <IntegrationsPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          <Route path="/dashboard/advanced" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <AdvancedDashboard />
                </React.Suspense>
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          {/* 404 route */}
          <Route path="*" element={
            <AuthProvider>
              <TooltipProvider>
                <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                    <Navigate to="/dashboard" replace />
                  </div>
                </div>
              </TooltipProvider>
            </AuthProvider>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

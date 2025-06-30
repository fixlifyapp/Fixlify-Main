import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import JobsPageOptimized from "@/pages/JobsPageOptimized";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ClientsPage from "@/pages/ClientsPage";
import ClientDetailPage from "@/pages/ClientDetailPage";
import SchedulePage from "@/pages/SchedulePage";
import FinancePage from "@/pages/FinancePage";
import ConnectCenterPageOptimized from "@/pages/ConnectCenterPageOptimized";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";

import AiCenterPage from "@/pages/AiCenterPage";
import AutomationsPage from "@/pages/AutomationsPage";
import { AdvancedWorkflowAutomation } from "@/components/automations/AdvancedWorkflowAutomation";
import AnalyticsPage from "@/pages/AnalyticsPage";
import TeamManagementPage from "@/pages/TeamManagementPage";
import TasksPage from "@/pages/TasksPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfileCompanyPage from "@/pages/ProfileCompanyPage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import ProductsPage from "@/pages/ProductsPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import PhoneNumbersPage from "./pages/PhoneNumbersPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppProviders } from "@/components/ui/AppProviders";
import TestDebug from "@/pages/TestDebug";
import MessagingDebugPage from "@/pages/MessagingDebugPage";
import JobCreationTestPage from "@/pages/JobCreationTestPage";
import ComponentTest from "@/pages/ComponentTest";
import TestAutomationPage from "@/pages/TestAutomationPage";
import { useAutomationTriggers } from "@/hooks/use-automation-triggers";

const queryClient = new QueryClient();

import { ErrorBoundary } from "@/components/ErrorBoundary";

// Import test for development
if (import.meta.env.DEV) {
  import('./tests/test-automation-creation');
}

// Initialize automation trigger service in the App component

// Test route for debugging
const TestPage = () => (
  <div style={{ padding: '20px', background: 'lightgreen', minHeight: '100vh' }}>
    <h1>🧪 Test Route Working</h1>
    <p>This page confirms routing is functional</p>
    <a href="/dashboard" style={{ color: 'blue' }}>Go to Dashboard</a>
  </div>
);

// Simple wrapper for protected routes
const ProtectedRouteWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <AppProviders>
        <AuthenticatedApp>
          {children}
        </AuthenticatedApp>
      </AppProviders>
    </ProtectedRoute>
  );
};

// Setup automation triggers when authenticated
const AuthenticatedApp = ({ children }: { children: React.ReactNode }) => {
  useAutomationTriggers();
  return <>{children}</>;
};

function App() {
  console.log('🚀 Fixlify App loaded');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Test route for debugging */}
              <Route path="/test" element={<TestPage />} />
              <Route path="/debug" element={<TestDebug />} />
              <Route path="/component-test" element={<ComponentTest />} />
              <Route path="/messaging-debug" element={
                <AuthProvider>
                  <ProtectedRouteWithProviders>
                    <MessagingDebugPage />
                  </ProtectedRouteWithProviders>
                </AuthProvider>
              } />
              
              {/* Authentication */}
              <Route path="/auth" element={
                <AuthProvider>
                  <AuthPage />
                </AuthProvider>
              } />
              
              {/* Main app routes */}
              <Route path="/" element={
                <AuthProvider>
                  <Navigate to="/dashboard" replace />
                </AuthProvider>
              } />
              
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
              
              <Route path="/clients/:clientId" element={
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
              
              <Route path="/messages" element={
                <AuthProvider>
                  <ProtectedRouteWithProviders>
                    <DebugErrorBoundary componentName="ConnectCenterPageOptimized">
                      <ConnectCenterPageOptimized />
                    </DebugErrorBoundary>
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
              
              <Route path="/advanced-workflow" element={
                <AuthProvider>
                  <ProtectedRouteWithProviders>
                    <AdvancedWorkflowAutomation />
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
            
            <Route path="/tasks" element={
                <AuthProvider>
                  <ProtectedRouteWithProviders>
                    <TasksPage />
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
              
              <Route path="/settings/profile" element={
                <AuthProvider>
                  <ProtectedRouteWithProviders>
                    <DebugErrorBoundary componentName="ProfileCompanyPage">
                      <ProfileCompanyPage />
                    </DebugErrorBoundary>
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
              
              
              <Route path="/settings/products" element={
                <AuthProvider>
                  <ProtectedRouteWithProviders>
                    <ProductsPage />
                  </ProtectedRouteWithProviders>
                </AuthProvider>
              } />
              
              <Route path="/settings/integrations" element={
                <AuthProvider>
                  <ProtectedRouteWithProviders>
                    <DebugErrorBoundary componentName="IntegrationsPage">
                      <IntegrationsPage />
                    </DebugErrorBoundary>
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
              
              <Route path="/job-creation-test" element={
                <AuthProvider>
                  <ProtectedRouteWithProviders>
                    <JobCreationTestPage />
                  </ProtectedRouteWithProviders>
                </AuthProvider>
              } />
              
              <Route path="/test-automation" element={
                <AuthProvider>
                  <ProtectedRouteWithProviders>
                    <TestAutomationPage />
                  </ProtectedRouteWithProviders>
                </AuthProvider>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
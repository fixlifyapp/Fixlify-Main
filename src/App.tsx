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

import AiCenterPage from "@/pages/AiCenterPage";
import AutomationsPage from "@/pages/AutomationsPage";
import { AdvancedWorkflowAutomation } from "@/components/automations/AdvancedWorkflowAutomation";
import AnalyticsPage from "@/pages/AnalyticsPage";
import TeamManagementPage from "@/pages/TeamManagementPage";
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
import { automationTrigger } from "@/services/automation-trigger";

const queryClient = new QueryClient();

import { ErrorBoundary } from "@/components/ErrorBoundary";

// Initialize automation trigger service
if (typeof window !== 'undefined') {
  // Delay initialization to avoid errors during startup
  setTimeout(() => {
    try {
      automationTrigger.scheduleTimeTriggers();
    } catch (error) {
      console.error('Failed to initialize automation triggers:', error);
    }
  }, 1000);
}

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
        {children}
      </AppProviders>
    </ProtectedRoute>
  );
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
          <Route path="/messaging-debug" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <MessagingDebugPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          <Route path="/job-test" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <JobCreationTestPage />
              </ProtectedRouteWithProviders>
            </AuthProvider>
          } />
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Auth routes */}
          <Route path="/auth" element={
            <AuthProvider>
              <TooltipProvider>
                <AuthPage />
              </TooltipProvider>
            </AuthProvider>
          } />
          
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          
          {/* Main protected routes */}
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
          
          <Route path="/automations/advanced" element={
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
          
          <Route path="/phone-numbers" element={
            <AuthProvider>
              <ProtectedRouteWithProviders>
                <PhoneNumbersPage />
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
          
          {/* 404 fallback */}
          <Route path="*" element={
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
              <a href="/dashboard" style={{ color: 'blue', marginTop: '20px' }}>Go to Dashboard</a>
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
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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
import CommunicationsSettingsPage from "@/pages/CommunicationsSettingsPage";
import AiCenterPage from "@/pages/AiCenterPage";
import AutomationsPage from "@/pages/AutomationsPage";
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

function App() {
  console.log('🚀 Fixlify App fully loaded');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <AuthProvider>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>🏠 Welcome to Fixlify</h1>
                <p>Your comprehensive business management platform</p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <Link to="/auth" style={{ 
                    padding: '10px 20px', 
                    background: '#8b5cf6', 
                    color: 'white', 
                    textDecoration: 'none',
                    borderRadius: '5px'
                  }}>
                    Sign In
                  </Link>
                  <Link to="/dashboard" style={{ 
                    padding: '10px 20px', 
                    background: '#10b981', 
                    color: 'white', 
                    textDecoration: 'none',
                    borderRadius: '5px'
                  }}>
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </AuthProvider>
          } />
          
          {/* Auth route */}
          <Route path="/auth" element={
            <AuthProvider>
              <TooltipProvider>
                <AuthPage />
              </TooltipProvider>
            </AuthProvider>
          } />
          
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
          
          {/* 404 route */}
          <Route path="*" element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>404 - Page Not Found</h1>
              <Link to="/">Go Home</Link>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

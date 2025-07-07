
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppProviders } from "@/providers";
import { PageLayout } from "@/components/layout/PageLayout";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { AppErrorBoundary } from "@/components/ui/AppErrorBoundary";

// Import pages
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import Clients from "@/pages/Clients";
import Schedule from "@/pages/Schedule";
import Estimates from "@/pages/Estimates";
import Invoices from "@/pages/Invoices";
import Finance from "@/pages/Finance";
import Reports from "@/pages/Reports";
import Messages from "@/pages/Messages";
import Connect from "@/pages/Connect";
import Automations from "@/pages/Automations";
import AiCenter from "@/pages/AiCenter";
import Team from "@/pages/Team";
import Documents from "@/pages/Documents";
import Tasks from "@/pages/Tasks";
import Inventory from "@/pages/Inventory";
import Integrations from "@/pages/Integrations";
import Products from "@/pages/Products";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import EstimateView from "@/pages/EstimateView";
import InvoiceView from "@/pages/InvoiceView";
import ClientPortal from "@/pages/ClientPortal";
import JobDetails from "@/pages/JobDetails";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('JWT') || error?.message?.includes('refresh_token')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => {
  return (
    <GlobalErrorBoundary>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <AppProviders>
                <BrowserRouter>
                  <div className="min-h-screen bg-gray-50/30">
                    <Toaster />
                    <Sonner />
                    <Routes>
                      {/* Public routes */}
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/estimate/:id" element={<EstimateView />} />
                      <Route path="/invoice/:id" element={<InvoiceView />} />
                      <Route path="/client-portal/:clientId" element={<ClientPortal />} />
                      
                      {/* Protected routes */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Dashboard />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/jobs" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Jobs />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/jobs/:id" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <JobDetails />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/clients" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Clients />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/schedule" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Schedule />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/estimates" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Estimates />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/invoices" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Invoices />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/finance" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Finance />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/reports" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Reports />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/messages" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Messages />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/connect" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Connect />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/automations" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Automations />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/ai" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <AiCenter />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/team" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Team />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/documents" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Documents />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/tasks" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Tasks />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/inventory" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Inventory />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/integrations" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Integrations />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/products" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Products />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Settings />
                          </PageLayout>
                        </ProtectedRoute>
                      } />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </BrowserRouter>
              </AppProviders>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </AppErrorBoundary>
    </GlobalErrorBoundary>
  );
};

export default App;

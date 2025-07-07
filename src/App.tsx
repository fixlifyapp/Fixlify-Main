
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

// Import pages - using existing pages
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Auth from "@/pages/Auth";

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
                      
                      {/* Protected routes */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <PageLayout>
                            <Dashboard />
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

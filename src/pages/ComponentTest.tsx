import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "@/hooks/use-auth";
import { AppProviders } from "@/components/ui/AppProviders";
import ProfileCompanyPage from "@/pages/ProfileCompanyPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import ConnectPage from "@/pages/ConnectPage";
import { DebugErrorBoundary } from "@/components/DebugErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export default function ComponentTest() {
  const [currentComponent, setCurrentComponent] = React.useState<string>('profile');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <div className="p-4 bg-white shadow-sm">
              <h1 className="text-xl font-bold mb-4">Component Testing</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentComponent('profile')}
                  className={`px-4 py-2 rounded ${currentComponent === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Profile Company Page
                </button>
                <button
                  onClick={() => setCurrentComponent('integrations')}
                  className={`px-4 py-2 rounded ${currentComponent === 'integrations' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Integrations Page
                </button>
                <button
                  onClick={() => setCurrentComponent('connect')}
                  className={`px-4 py-2 rounded ${currentComponent === 'connect' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Connect Center Page
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {currentComponent === 'profile' && (
                <DebugErrorBoundary componentName="ProfileCompanyPage">
                  <AppProviders>
                    <ProfileCompanyPage />
                  </AppProviders>
                </DebugErrorBoundary>
              )}
              
              {currentComponent === 'integrations' && (
                <DebugErrorBoundary componentName="IntegrationsPage">
                  <AppProviders>
                    <IntegrationsPage />
                  </AppProviders>
                </DebugErrorBoundary>
              )}
              
              {currentComponent === 'connect' && (
                <DebugErrorBoundary componentName="ConnectPage">
                  <AppProviders>
                    <ConnectPage />
                  </AppProviders>
                </DebugErrorBoundary>
              )}
            </div>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
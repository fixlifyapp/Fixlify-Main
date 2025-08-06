import React, { createContext, useContext, useEffect, useRef } from 'react';
import { automationProcessor } from '@/services/automationProcessorService';
import { AutomationRetryService } from '@/services/automationRetryService';
import { useAuth } from '@/hooks/use-auth';

interface AutomationProcessorContextType {
  processNow: () => Promise<void>;
  retryFailed: (options?: any) => Promise<{ retried: number; errors: number }>;
  getRetryStats: () => Promise<any>;
}

const AutomationProcessorContext = createContext<AutomationProcessorContextType | undefined>(undefined);

export const useAutomationProcessor = () => {
  const context = useContext(AutomationProcessorContext);
  if (!context) {
    throw new Error('useAutomationProcessor must be used within AutomationProcessorProvider');
  }
  return context;
};

export const AutomationProcessorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const autoRetryStop = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (user) {
      // Start the processor when user is authenticated
      console.log('🚀 Starting automation processor for user:', user.id);
      automationProcessor.start();
      
      // Start auto-retry service (checks every 5 minutes)
      autoRetryStop.current = AutomationRetryService.startAutoRetry();
    } else {
      // Stop the processor when user logs out
      console.log('🛑 Stopping automation processor (no user)');
      automationProcessor.stop();
      
      // Stop auto-retry
      if (autoRetryStop.current) {
        autoRetryStop.current();
        autoRetryStop.current = null;
      }
    }

    return () => {
      // Cleanup on unmount
      automationProcessor.stop();
      
      // Stop auto-retry
      if (autoRetryStop.current) {
        autoRetryStop.current();
        autoRetryStop.current = null;
      }
    };
  }, [user]);

  const value = {
    processNow: () => automationProcessor.processNow(),
    retryFailed: (options?: any) => AutomationRetryService.retryFailedAutomations(options),
    getRetryStats: () => AutomationRetryService.getRetryStats()
  };

  return (
    <AutomationProcessorContext.Provider value={value}>
      {children}
    </AutomationProcessorContext.Provider>
  );
};
import React, { createContext, useContext, useEffect } from 'react';
import { automationProcessor } from '@/services/automationProcessorService';
import { useAuth } from '@/hooks/use-auth';

interface AutomationProcessorContextType {
  processNow: () => Promise<void>;
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

  useEffect(() => {
    if (user) {
      // Start the processor when user is authenticated
      console.log('🚀 Starting automation processor for user:', user.id);
      automationProcessor.start();
    } else {
      // Stop the processor when user logs out
      console.log('🛑 Stopping automation processor (no user)');
      automationProcessor.stop();
    }

    return () => {
      // Cleanup on unmount
      automationProcessor.stop();
    };
  }, [user]);

  const value = {
    processNow: () => automationProcessor.processNow()
  };

  return (
    <AutomationProcessorContext.Provider value={value}>
      {children}
    </AutomationProcessorContext.Provider>
  );
};

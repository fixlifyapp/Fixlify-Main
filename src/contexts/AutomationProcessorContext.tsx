import React, { createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AutomationProcessorContextType {
  processNow: () => Promise<void>;
  getSystemHealth: () => Promise<any>;
  testJobAutomation: (jobId: string, oldStatus?: string, newStatus?: string) => Promise<any>;
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
  const value = {
    processNow: async () => {
      // Trigger the unified automation processor
      const { error } = await supabase.rpc('process_automation_system');
      if (error) {
        console.error('Failed to trigger automation processing:', error);
        throw error;
      }
      console.log('✅ Manual automation processing triggered');
    },
    
    getSystemHealth: async () => {
      const { data, error } = await supabase
        .from('automation_system_health')
        .select('*')
        .single();
      
      if (error) {
        console.error('Failed to get system health:', error);
        throw error;
      }
      
      return data;
    },
    
    testJobAutomation: async (jobId: string, oldStatus = 'pending', newStatus = 'completed') => {
      const { data, error } = await supabase.rpc('test_job_status_automation', {
        p_job_id: jobId,
        p_old_status: oldStatus,
        p_new_status: newStatus
      });
      
      if (error) {
        console.error('Failed to test job automation:', error);
        throw error;
      }
      
      return data;
    }
  };

  return (
    <AutomationProcessorContext.Provider value={value}>
      {children}
    </AutomationProcessorContext.Provider>
  );
};
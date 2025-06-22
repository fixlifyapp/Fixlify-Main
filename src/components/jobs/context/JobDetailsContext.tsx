import React, { createContext, useContext, useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobDetailsContextType } from "./types";
import { useJobData } from "./useJobData";
import { useJobStatusUpdate } from "./useJobStatusUpdate";
import { toast } from "sonner";

const JobDetailsContext = createContext<JobDetailsContextType | null>(null);

export const useJobDetails = () => {
  const context = useContext(JobDetailsContext);
  if (!context) {
    throw new Error("useJobDetails must be used within JobDetailsProvider");
  }
  return context;
};

export const JobDetailsProvider = ({ 
  jobId, 
  children 
}: { 
  jobId: string;
  children: React.ReactNode;
}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [financialRefreshTrigger, setFinancialRefreshTrigger] = useState(0);
  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const refreshJob = () => {
    if (isMountedRef.current) {
      setRefreshTrigger(prev => prev + 1);
    }
  };
  
  const refreshFinancials = () => {
    if (isMountedRef.current) {
      console.log('🔄 Triggering financial refresh from context');
      setFinancialRefreshTrigger(prev => prev + 1);
    }
  };
  
  // Load job data with stable refresh trigger
  const {
    job,
    isLoading,
    currentStatus,
    setCurrentStatus,
    invoiceAmount,
    balance
  } = useJobData(jobId, refreshTrigger);
  
  // Handle status updates
  const { updateJobStatus: handleUpdateJobStatus } = useJobStatusUpdate(jobId, refreshJob);
  
  // Set up real-time subscription
  useEffect(() => {
    if (!jobId) return;
    
    // Clean up any existing subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }
    
    console.log(`Setting up real-time subscription for job ${jobId}`);
    
    const channel = supabase
      .channel(`job-details-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          console.log('Job update detected:', payload);
          if (isMountedRef.current) {
            refreshJob();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: job?.clientId ? `id=eq.${job.clientId}` : undefined
        },
        (payload) => {
          console.log('Client update detected:', payload);
          if (isMountedRef.current) {
            refreshJob();
          }
        }
      )
      .subscribe();
    
    subscriptionRef.current = channel;
    
    return () => {
      console.log(`Cleaning up real-time subscription for job ${jobId}`);
      supabase.removeChannel(channel);
    };
  }, [jobId, job?.clientId]);
  
  const updateJobStatus = async (newStatus: string) => {
    // Optimistic update - update UI immediately without waiting
    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    
    try {
      await handleUpdateJobStatus(newStatus);
      // Status already updated optimistically, no need to refresh
    } catch (error) {
      // Revert optimistic update on error
      setCurrentStatus(previousStatus);
      throw error;
    }
  };
  
  return (
    <JobDetailsContext.Provider value={{
      job,
      isLoading,
      currentStatus,
      invoiceAmount,
      balance,
      refreshJob,
      refreshFinancials,
      financialRefreshTrigger,
      updateJobStatus
    }}>
      {children}
    </JobDetailsContext.Provider>
  );
};

// Re-export types for backward compatibility
export type { JobInfo } from "./types";

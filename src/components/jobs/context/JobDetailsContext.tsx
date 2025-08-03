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
  const clientSubscriptionRef = useRef<any>(null);
  
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
      console.log(`Cleaning up existing subscription for job ${jobId}`);
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    console.log(`Setting up real-time subscription for job ${jobId}`);
    
    const channelName = `job-details-${jobId}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
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
          // Check if this is a status update
          if (payload.new && payload.new.status !== currentStatus) {
            console.log('Status changed via real-time:', payload.new.status);
            setCurrentStatus(payload.new.status);
          }
          // Only refresh if this wasn't an optimistic update we just made
          if (isMountedRef.current) {
            // Small delay to prevent race conditions with optimistic updates
            setTimeout(() => {
              if (isMountedRef.current) {
                refreshJob();
              }
            }, 100);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error(`Real-time subscription error for job ${jobId}:`, err);
        } else {
          console.log(`Real-time subscription status for job ${jobId}:`, status);
        }
      });
    
    subscriptionRef.current = channel;
    
    return () => {
      console.log(`Cleaning up real-time subscription for job ${jobId}`);
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [jobId]);
  
  // Separate subscription for client updates
  useEffect(() => {
    if (!job?.clientId) return;
    
    // Clean up any existing client subscription
    if (clientSubscriptionRef.current) {
      console.log(`Cleaning up existing client subscription`);
      supabase.removeChannel(clientSubscriptionRef.current);
      clientSubscriptionRef.current = null;
    }
    
    console.log(`Setting up client subscription for client ${job.clientId}`);
    
    const clientChannelName = `job-client-${job.clientId}-${Date.now()}`;
    
    const clientChannel = supabase
      .channel(clientChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `id=eq.${job.clientId}`
        },
        (payload) => {
          console.log('Client update detected:', payload);
          if (isMountedRef.current) {
            refreshJob();
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error(`Client subscription error:`, err);
        } else {
          console.log(`Client subscription status:`, status);
        }
      });
    
    clientSubscriptionRef.current = clientChannel;
    
    return () => {
      console.log(`Cleaning up client subscription`);
      if (clientSubscriptionRef.current) {
        supabase.removeChannel(clientSubscriptionRef.current);
        clientSubscriptionRef.current = null;
      }
    };
  }, [job?.clientId]);
  
  const updateJobStatus = async (newStatus: string) => {
    if (!job) {
      console.error('No job data available for status update');
      return;
    }
    
    // Optimistic update - update UI immediately
    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    
    try {
      await handleUpdateJobStatus(newStatus, previousStatus);
      console.log(`✅ Job status updated from ${previousStatus} to ${newStatus}`);
      
      // Force a refresh to ensure UI is in sync with database
      setTimeout(() => {
        refreshJob();
      }, 500);
    } catch (error) {
      console.error(`❌ Failed to update status from ${previousStatus} to ${newStatus}:`, error);
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

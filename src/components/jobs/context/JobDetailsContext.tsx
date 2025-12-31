import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobDetailsContextType } from "./types";
import { useJobData } from "./useJobData";
import { useJobStatusUpdate } from "./useJobStatusUpdate";
import { toast } from "sonner";
import { invalidateJobCache } from "./utils/jobDataCache";

const JobDetailsContext = createContext<JobDetailsContextType | null>(null);

// Minimum time between refreshes (ms)
const REFRESH_THROTTLE_MS = 300;

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
  const lastRefreshRef = useRef<number>(0);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Throttled refresh to prevent multiple rapid updates
  const refreshJob = useCallback(() => {
    if (!isMountedRef.current) return;

    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshRef.current;

    if (timeSinceLastRefresh < REFRESH_THROTTLE_MS) {
      // Skip this refresh - too soon after the last one
      return;
    }

    lastRefreshRef.current = now;
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  const refreshFinancials = () => {
    if (isMountedRef.current) {
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
      subscriptionRef.current = null;
    }
    
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
          // Check if this is a status update
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new && payload.new.status !== currentStatus) {
            setCurrentStatus(payload.new.status as string);
          }
          // Refresh immediately - throttling prevents duplicates
          refreshJob();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error(`Real-time subscription error for job ${jobId}:`, err);
        }
      });
    
    subscriptionRef.current = channel;
    
    return () => {
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
      supabase.removeChannel(clientSubscriptionRef.current);
      clientSubscriptionRef.current = null;
    }
    
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
          if (isMountedRef.current) {
            refreshJob();
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error(`Client subscription error:`, err);
        }
      });

    clientSubscriptionRef.current = clientChannel;

    return () => {
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

    // Invalidate cache to ensure fresh data on next fetch
    invalidateJobCache(jobId);

    try {
      await handleUpdateJobStatus(newStatus, previousStatus);
      // Real-time subscription will handle the refresh automatically
    } catch (error) {
      console.error(`Failed to update status:`, error);
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

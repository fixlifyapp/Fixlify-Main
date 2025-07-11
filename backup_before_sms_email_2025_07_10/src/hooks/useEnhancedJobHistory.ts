
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useJobHistory } from './useJobHistory';
import { HistoryItemInput } from '@/types/job-history';

export const useEnhancedJobHistory = (jobId: string) => {
  const {
    historyItems,
    isLoading,
    addHistoryItem,
    refreshHistory,
    ...historyProps
  } = useJobHistory(jobId);

  // Listen for real-time updates to related tables
  useEffect(() => {
    if (!jobId) return;

    // Set up real-time subscriptions for comprehensive tracking
    const channels = [
      // Job updates
      supabase
        .channel('job-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        }, () => {
          refreshHistory();
        })
        .subscribe(),

      // Estimate updates
      supabase
        .channel('estimate-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'estimates',
          filter: `job_id=eq.${jobId}`
        }, () => {
          refreshHistory();
        })
        .subscribe(),

      // Invoice updates
      supabase
        .channel('invoice-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `job_id=eq.${jobId}`
        }, () => {
          refreshHistory();
        })
        .subscribe(),

      // Payment updates
      supabase
        .channel('payment-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'payments'
        }, (payload) => {
          // Check if payment belongs to this job's invoices
          if (payload.new || payload.old) {
            refreshHistory();
          }
        })
        .subscribe(),

      // Communication updates
      supabase
        .channel('communication-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'estimate_communications'
        }, () => {
          refreshHistory();
        })
        .subscribe(),

      supabase
        .channel('invoice-communication-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'invoice_communications'
        }, () => {
          refreshHistory();
        })
        .subscribe(),

      // Direct history updates
      supabase
        .channel('history-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'job_history',
          filter: `job_id=eq.${jobId}`
        }, () => {
          refreshHistory();
        })
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [jobId, refreshHistory]);

  // Enhanced logging functions
  const logUserAction = async (action: string, details: any) => {
    await addHistoryItem({
      job_id: jobId,
      type: 'user-action',
      title: action,
      description: `User performed: ${action}`,
      meta: {
        action,
        details,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_address: 'client'
      }
    });
  };

  const logNavigation = async (from: string, to: string) => {
    await addHistoryItem({
      job_id: jobId,
      type: 'navigation',
      title: 'Tab Navigation',
      description: `Navigated from ${from} to ${to}`,
      meta: {
        from,
        to,
        timestamp: new Date().toISOString()
      }
    });
  };

  const logFormInteraction = async (formType: string, action: string, data?: any) => {
    await addHistoryItem({
      job_id: jobId,
      type: 'form-interaction',
      title: `${formType} ${action}`,
      description: `${action} performed on ${formType}`,
      meta: {
        formType,
        action,
        data,
        timestamp: new Date().toISOString()
      }
    });
  };

  const canViewItem = (item: any) => {
    // Basic permission check - can be expanded based on user roles
    return true;
  };

  return {
    historyItems,
    isLoading,
    addHistoryItem,
    refreshHistory,
    logUserAction,
    logNavigation,
    logFormInteraction,
    canViewItem,
    ...historyProps
  };
};

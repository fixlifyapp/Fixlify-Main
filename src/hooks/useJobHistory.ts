
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HistoryItem, HistoryItemInput } from '@/types/job-history';
import { useRBAC } from '@/components/auth/RBACProvider';

// Export types for external use
export type { HistoryItem, HistoryItemInput } from '@/types/job-history';

export const useJobHistory = (jobId: string) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  const [showRestrictedItems, setShowRestrictedItems] = useState(false);
  const { currentUser, hasPermission } = useRBAC();
  const isMountedRef = useRef(true);

  const fetchHistory = useCallback(async () => {
    if (!jobId) return;

    try {
      const { data, error } = await supabase
        .from('job_history')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (isMountedRef.current) {
        setHistoryItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching job history:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [jobId]);

  const addHistoryItem = async (item: HistoryItemInput) => {
    try {
      const { data, error } = await supabase
        .from('job_history')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      
      setHistoryItems(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding history item:', error);
      throw error;
    }
  };

  // Stable refresh function for external use (e.g., realtime hooks)
  const refreshHistory = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  const togglePinnedItem = (id: string) => {
    setPinnedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const canViewItem = (item: HistoryItem): boolean => {
    // Technicians can only see certain types of history items
    if (currentUser?.role === 'technician') {
      const allowedTypes = ['note', 'status-change', 'job-created', 'technician'];
      return allowedTypes.includes(item.type);
    }
    
    // Admin/Manager/Dispatcher can see all items if showRestrictedItems is true
    if (hasPermission('admin') || hasPermission('manager') || hasPermission('jobs.view.all')) {
      return showRestrictedItems || (item.visibility !== 'restricted');
    }
    
    return (item.visibility !== 'restricted');
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHistoryItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting history item:', error);
      throw error;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchHistory();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchHistory]);

  return {
    historyItems,
    isLoading,
    pinnedItems,
    showRestrictedItems,
    setShowRestrictedItems,
    togglePinnedItem,
    canViewItem,
    deleteHistoryItem,
    addHistoryItem,
    refreshHistory
  };
};

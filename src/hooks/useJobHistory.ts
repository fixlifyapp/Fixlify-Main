import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HistoryItem, HistoryItemInput } from '@/types/job-history';
import { useRBAC } from '@/components/auth/RBACProvider';

// Export types for external use
export type { HistoryItem, HistoryItemInput } from '@/types/job-history';

interface ConversationData {
  id: string;
  job_id: string;
  client_id: string;
  caller_number: string;
  call_duration: number;
  call_direction: string;
  call_status: string;
  summary: string;
  transcript: string;
  ai_notes: string;
  sentiment: string;
  topics: string[];
  action_items: string[];
  created_at: string;
  metadata: any;
}

export const useJobHistory = (jobId: string) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  const [showRestrictedItems, setShowRestrictedItems] = useState(false);
  const { currentUser, hasPermission } = useRBAC();

  const fetchHistory = async () => {
    if (!jobId) return;
    
    try {
      // Fetch regular history items
      const { data: historyData, error: historyError } = await supabase
        .from('job_history')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      // Fetch conversations related to this job
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('call_conversations')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Transform conversations to history items format
      const conversationItems: HistoryItem[] = (conversationsData || []).map((conv: ConversationData) => ({
        id: `conv-${conv.id}`,
        job_id: conv.job_id,
        type: 'conversation',
        title: `Phone Call with ${conv.caller_number || 'Customer'}`,
        description: conv.summary || 'Phone conversation recorded',
        user_id: currentUser?.id,
        user_name: 'AI Dispatcher',
        created_at: conv.created_at,
        visibility: 'normal',
        metadata: {
          conversation_id: conv.id,
          call_duration: conv.call_duration,
          call_direction: conv.call_direction,
          call_status: conv.call_status,
          summary: conv.summary,
          sentiment: conv.sentiment,
          topics: conv.topics,
          action_items: conv.action_items,
          ai_notes: conv.ai_notes
        }
      }));

      // Combine and sort all items by created_at
      const allItems = [...(historyData || []), ...conversationItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setHistoryItems(allItems);
    } catch (error) {
      console.error('Error fetching job history:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const refreshHistory = () => {
    fetchHistory();
  };

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
      const allowedTypes = ['note', 'status-change', 'job-created', 'technician', 'conversation'];
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
      // Check if it's a conversation item
      if (id.startsWith('conv-')) {
        const conversationId = id.replace('conv-', '');
        const { error } = await supabase
          .from('call_conversations')
          .delete()
          .eq('id', conversationId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('job_history')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      
      setHistoryItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting history item:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchHistory();

    // Subscribe to realtime updates for conversations
    const conversationSubscription = supabase
      .channel(`conversations-${jobId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'call_conversations',
        filter: `job_id=eq.${jobId}`
      }, () => {
        fetchHistory();
      })
      .subscribe();

    return () => {
      conversationSubscription.unsubscribe();
    };
  }, [jobId]);

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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

export interface ClientHistoryItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: string;
}

export const useClientHistory = (clientId?: string) => {
  const [history, setHistory] = useState<ClientHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch client history data
  const fetchHistory = async () => {
    if (!clientId) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // First get all jobs for this client
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('client_id', clientId);
        
      if (jobsError) throw jobsError;
      
      if (!jobs || jobs.length === 0) {
        setHistory([]);
        setIsLoading(false);
        return;
      }
      
      // Get job IDs
      const jobIds = jobs.map(job => job.id);
      
      // Get job history for all these jobs
      const { data: historyData, error: historyError } = await supabase
        .from('job_history')
        .select('*')
        .in('job_id', jobIds);
        
      if (historyError) throw historyError;
      
      // Format history data
      const formattedHistory: ClientHistoryItem[] = (historyData || []).map(item => ({
        id: item.id,
        date: item.created_at,
        title: item.title,
        description: item.description,
        type: item.type
      }));
      
      // Sort by date (newest first)
      // Simplified sorting to avoid TypeScript depth issues
      const sortedHistory = [...formattedHistory].sort((a, b) => {
        // Convert to timestamps for comparison
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;  // Descending order
      });
      
      setHistory(sortedHistory);
    } catch (error) {
      console.error("Error loading client history:", error);
      toast.error("Failed to load client history");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up initial data fetch
  useEffect(() => {
    fetchHistory();
  }, [clientId]);
  
  // Set up real-time updates for job history
  useRealtimeSync({
    tables: ['job_history'],
    onUpdate: fetchHistory,
    enabled: !!clientId
  });
  
  return {
    history,
    isLoading,
    refreshHistory: fetchHistory
  };
};

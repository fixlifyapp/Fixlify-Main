
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Estimate } from '@/hooks/useEstimates';

export interface EstimateDetails {
  id: string;
  estimate_number: string;
  job_title: string;
  client_name: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
}

export interface EstimateDataHook {
  estimate: EstimateDetails | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Re-export Estimate type for convenience
export type { Estimate };

export const useEstimateData = (estimateId?: string): EstimateDataHook => {
  const [estimate, setEstimate] = useState<EstimateDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!estimateId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First fetch estimate data
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError) {
        throw estimateError;
      }

      // Then fetch related job data
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*, clients(*)')
        .eq('id', estimateData.job_id)
        .single();

      if (jobError) {
        console.warn('Could not fetch job data:', jobError);
      }

      // Fetch line items separately
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', estimateId)
        .eq('parent_type', 'estimate');

      if (lineItemsError) {
        throw lineItemsError;
      }

      // Transform the data to match EstimateDetails interface
      const transformedEstimate: EstimateDetails = {
        id: estimateData.id,
        estimate_number: estimateData.estimate_number,
        job_title: jobData?.title || 'Unknown Job',
        client_name: jobData?.clients?.name || 'Unknown Client',
        total: estimateData.total,
        status: estimateData.status,
        created_at: estimateData.created_at,
        items: lineItems || []
      };

      setEstimate(transformedEstimate);
    } catch (error: any) {
      console.error('Error fetching estimate data:', error);
      setError(error.message || 'Failed to fetch estimate data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (estimateId) {
      refetch();
    }
  }, [estimateId]);

  return {
    estimate,
    isLoading,
    error,
    refetch
  };
};

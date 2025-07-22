
import { useState, useEffect } from 'react';
import { Estimate } from '@/types/documents';

export interface EstimateDataHook {
  estimate: Estimate | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Re-export Estimate type for convenience
export type { Estimate };

export const useEstimateData = (estimateId?: string): EstimateDataHook => {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!estimateId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock data for now - in a real app this would fetch from the API
      const mockEstimate: Estimate = {
        id: estimateId,
        job_id: 'mock-job',
        estimate_number: 'EST-001',
        status: 'draft',
        total: 0,
        notes: '',
        items: [],
        subtotal: 0,
        tax_rate: 0,
        tax_amount: 0,
        // discount_amount: 0, // Remove this line - not in Estimate interface
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setEstimate(mockEstimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch estimate');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [estimateId]);

  return {
    estimate,
    isLoading,
    error,
    refetch
  };
};

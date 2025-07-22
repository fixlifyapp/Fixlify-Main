import { useState, useEffect } from 'react';
import { transformToUnifiedEstimate } from '@/utils/unified-transforms';
import type { Estimate } from '@/types/documents';

interface UseEstimateDataProps {
  estimateId?: string;
  jobId?: string;
}

export const useEstimateData = ({ estimateId, jobId }: UseEstimateDataProps) => {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Create a mock estimate with all required fields
        const mockEstimateData = {
          id: `est-${Date.now()}`,
          job_id: jobId || '',
          estimate_number: `EST-${Date.now()}`,
          status: 'draft' as const,
          total: 0,
          notes: '',
          items: [],
          subtotal: 0,
          tax_rate: 0,
          tax_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system'
        };
        
        const transformedEstimate = transformToUnifiedEstimate(mockEstimateData);
        setEstimate(transformedEstimate);
      } catch (err) {
        console.error('Error fetching estimate:', err);
        setError('Failed to fetch estimate');
      } finally {
        setLoading(false);
      }
    };

    if (estimateId || jobId) {
      fetchEstimate();
    }
  }, [estimateId, jobId]);

  return {
    estimate,
    loading,
    error,
    refetch: () => {
      // Refetch logic here
    }
  };
};
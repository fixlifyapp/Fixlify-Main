
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobOverview {
  id: string;
  job_id: string;
  warranty_info?: any;
  emergency_contact?: any;
  billing_contact?: any;
  lead_source?: string;
  created_at?: string;
  updated_at?: string;
}

export const useJobOverview = (jobId: string) => {
  const [overview, setOverview] = useState<JobOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        
        // First, get the job data with only lead_source (other fields were removed)
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            id,
            job_type,
            lead_source
          `)
          .eq('id', jobId)
          .maybeSingle();

        if (jobError) {
          console.error("Error fetching job overview data:", jobError);
          toast.error("Error loading job overview");
          return;
        }

        // Then get the job_overview data
        const { data: overviewData, error: overviewError } = await supabase
          .from('job_overview')
          .select('*')
          .eq('job_id', jobId)
          .maybeSingle();

        if (overviewError && overviewError.code !== 'PGRST116') {
          console.error("Error fetching job overview:", overviewError);
          toast.error("Error loading job overview details");
          return;
        }

        // Combine the data (only with remaining fields)
        const combinedOverview: JobOverview = {
          id: overviewData?.id || '',
          job_id: jobId,
          lead_source: jobData?.lead_source,
          warranty_info: overviewData?.warranty_info || {},
          emergency_contact: overviewData?.emergency_contact || {},
          billing_contact: overviewData?.billing_contact || {},
          created_at: overviewData?.created_at,
          updated_at: overviewData?.updated_at
        };

        setOverview(combinedOverview);
      } catch (error) {
        console.error("Error in fetchOverview:", error);
        toast.error("Error loading job overview");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, [jobId]);

  const saveOverview = async (data: Partial<JobOverview>) => {
    try {
      // Separate job table fields from job_overview table fields (only lead_source remains)
      const jobFields = {
        lead_source: data.lead_source
      };

      const overviewFields = {
        job_id: jobId,
        warranty_info: data.warranty_info || {},
        emergency_contact: data.emergency_contact || {},
        billing_contact: data.billing_contact || {}
      };

      // Update jobs table
      const { error: jobError } = await supabase
        .from('jobs')
        .update(jobFields)
        .eq('id', jobId);

      if (jobError) throw jobError;

      // Upsert job_overview table
      const { error: overviewError } = await supabase
        .from('job_overview')
        .upsert(overviewFields, { onConflict: 'job_id' });

      if (overviewError) throw overviewError;

      toast.success("Job overview updated successfully");
      
      // Refresh the data
      setOverview(prev => prev ? { ...prev, ...data } : null);
      
      return true;
    } catch (error) {
      console.error("Error saving job overview:", error);
      toast.error("Failed to save job overview");
      return false;
    }
  };

  return {
    overview,
    isLoading,
    saveOverview
  };
};

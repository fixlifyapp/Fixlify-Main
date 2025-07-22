import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";
import { useJobTypes, useJobStatuses } from "@/hooks/useConfigItems";
import { generateNextId } from "@/utils/idGeneration";
import { usePermissions } from "@/hooks/usePermissions";
import { withRetry, handleJobsError } from "@/utils/errorHandling";
import { toast } from "@/components/ui/sonner";

export interface Job {
  id: string;
  title?: string;
  client_id?: string;
  description?: string;
  job_type?: string;
  lead_source?: string;
  status: string;
  service?: string;
  date?: string;
  schedule_start?: string;
  schedule_end?: string;
  technician_id?: string;
  revenue?: number;
  notes?: string;
  tags?: string[];
  tasks?: string[];
  property_id?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  user_id?: string;
  created_by?: string;
  invoice_date?: string;
  assigned_to?: string;
  line_items?: any[];
  custom_fields?: Record<string, any>;
  tax_amount?: number;
  total_amount?: number;
  discount?: number;
  client?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  schedule?: any;
  attachments?: any[];
  payments?: any[];
  technician?: {
    id: string;
    name?: string;
    email?: string;
  };
  invoices?: any[];
  estimates?: any[];
}

// Validation function for job data
const validateJobData = (jobData: any): any => {
  const validatedData = {
    ...jobData,
    // Core required fields
    id: jobData.id || '',
    title: jobData.title || 'New Job',
    status: jobData.status || 'not-started',
    user_id: jobData.user_id || '',
    created_at: jobData.created_at || new Date().toISOString(),
    
    // Optional fields with proper null handling
    client_id: jobData.client_id || null,
    description: jobData.description || null,
    job_type: jobData.job_type || null,
    lead_source: jobData.lead_source || null,
    service: jobData.service || null,
    schedule_start: jobData.schedule_start || null,
    schedule_end: jobData.schedule_end || null,
    technician_id: jobData.technician_id || null,
    property_id: jobData.property_id || null,
    address: jobData.address || null,
    revenue: jobData.revenue ? parseFloat(jobData.revenue) : null,
    notes: jobData.notes || null,
    tags: Array.isArray(jobData.tags) ? jobData.tags : [],
    tasks: Array.isArray(jobData.tasks) ? jobData.tasks : [],
    custom_fields: jobData.custom_fields || {},
    tax_amount: jobData.tax_amount ? parseFloat(jobData.tax_amount) : null,
    total_amount: jobData.total_amount ? parseFloat(jobData.total_amount) : null,
    discount: jobData.discount ? parseFloat(jobData.discount) : null,
    created_by: jobData.created_by || jobData.user_id || null,
    updated_by: jobData.updated_by || jobData.user_id || null,
    updated_at: jobData.updated_at || new Date().toISOString()
  };

  // Remove any undefined values to prevent database errors
  Object.keys(validatedData).forEach(key => {
    if (validatedData[key] === undefined) {
      delete validatedData[key];
    }
  });

  return validatedData;
};

export const useJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { canCreateJobs, canEditJobs, canDeleteJobs } = usePermissions();
  const { jobTypes } = useJobTypes();
  const { jobStatuses } = useJobStatuses();
  
  // Reference to track if we're currently creating a job
  const isCreatingJobRef = useRef(false);
  
  // Stable fetch function that won't change on every render
  const fetchJobs = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID available, skipping job fetch");
      setJobs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching jobs for user:", user.id);
      
      const { data, error } = await withRetry(
        () => supabase
          .from("jobs")
          .select(`
            *,
            client:clients!jobs_client_id_fkey (
              id, name, email, phone, address, city, state, zip
            ),
            technician:profiles!jobs_technician_id_fkey (
              id, name, email
            ),
            schedule:job_schedules!job_schedules_job_id_fkey (
              id, start_time, end_time, technician_id
            ),
            attachments:job_attachments!job_attachments_job_id_fkey (
              id, file_name, file_url, file_type, uploaded_at
            ),
            payments:payments!payments_job_id_fkey (
              id, amount, payment_date, payment_method, status
            ),
            invoices:invoices!invoices_job_id_fkey (
              id, invoice_number, status, total, created_at
            ),
            estimates:estimates!estimates_job_id_fkey (
              id, estimate_number, status, total, created_at
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        {
          maxRetries: 3,
          retryDelay: 1000,
          onError: handleJobsError
        }
      );

      if (error) {
        console.error("Error fetching jobs:", error);
        throw error;
      }
      
      // Transform the data to handle null relationships
      const transformedJobs = (data || []).map(job => ({
        ...job,
        client: job.client || null,
        technician: job.technician || null,
        schedule: Array.isArray(job.schedule) ? job.schedule[0] : null,
        attachments: job.attachments || [],
        payments: job.payments || [],
        invoices: job.invoices || [],
        estimates: job.estimates || []
      }));
      
      console.log("Fetched jobs:", transformedJobs.length);
      setJobs(transformedJobs);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Use unified realtime hook for all job-related tables
  useUnifiedRealtime({
    tables: ['jobs', 'job_schedules', 'job_attachments', 'payments'],
    userId: user?.id,
    onUpdate: fetchJobs,
    isEnabled: !isLoading && !isCreatingJobRef.current
  });

  // Initial data fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, refreshTrigger]);

  const createJob = useCallback(async (jobData: Partial<Job>) => {
    if (isCreatingJobRef.current) {
      console.log("⚠️ Job creation already in progress, preventing duplicate");
      return null;
    }
    
    isCreatingJobRef.current = true;
    
    if (!canCreateJobs()) {
      console.log("❌ Permission denied for job creation");
      toast.error("You don't have permission to create jobs");
      isCreatingJobRef.current = false;
      return null;
    }

    try {
      console.log("🆔 Generating job ID...");
      const jobId = await generateNextId('job');
      console.log("✅ Generated job ID:", jobId);
      
      const autoTitle = jobData.title || 
        `${jobData.client?.name || 'Service'} - ${jobData.job_type || jobData.service || 'General Service'}`;
      console.log("📝 Auto-generated title:", autoTitle);
      
      let clientAddress = '';
      if (jobData.client_id) {
        console.log("🏠 Fetching client address for:", jobData.client_id);
        const { data: clientData } = await supabase
          .from('clients')
          .select('address, city, state, zip')
          .eq('id', jobData.client_id)
          .single();
        
        if (clientData) {
          const addressParts = [
            clientData.address,
            clientData.city,
            clientData.state,
            clientData.zip
          ].filter(Boolean);
          clientAddress = addressParts.join(', ');
        }
      }
      
      const validatedJobData = validateJobData({
        ...jobData,
        id: jobId,
        title: autoTitle,
        address: clientAddress,
        user_id: user?.id,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log("💾 Creating job with data:", validatedJobData);
      const { data, error } = await supabase
        .from("jobs")
        .insert([validatedJobData])
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating job:", error);
        throw error;
      }

      console.log("✅ Job created successfully:", data);
      
      // Immediately add to local state for instant UI update
      setJobs(prev => [data, ...prev]);
      
      return data;
    } catch (error) {
      console.error("Failed to create job:", error);
      throw error;
    } finally {
      isCreatingJobRef.current = false;
    }
  }, [user?.id, canCreateJobs]);

  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    if (!canEditJobs()) {
      toast.error("You don't have permission to edit jobs");
      return null;
    }

    try {
      const validatedUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      // Remove undefined values
      Object.keys(validatedUpdates).forEach(key => {
        if (validatedUpdates[key] === undefined) {
          delete validatedUpdates[key];
        }
      });

      const { data, error } = await supabase
        .from("jobs")
        .update(validatedUpdates)
        .eq("id", jobId)
        .eq("user_id", user?.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state immediately for better UX
      setJobs(prev => prev.map(job => job.id === jobId ? { ...job, ...data } : job));
      
      return data;
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!canDeleteJobs()) {
      toast.error("You don't have permission to delete jobs");
      return false;
    }

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      // Optimistic update - immediately remove from local state
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
      console.log('Job deleted successfully:', jobId);
      toast.success('Job deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      // On error, refresh to restore correct state
      setRefreshTrigger(prev => prev + 1);
      toast.error('Failed to delete job');
      throw error;
    }
  };

  const refreshJobs = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    jobs,
    isLoading,
    createJob,
    updateJob,
    deleteJob,
    refreshJobs,
    jobTypes,
    jobStatuses
  };
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDataIsolation } from "@/hooks/useDataIsolation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { withUserFilter, prepareInsert } = useDataIsolation();
  const { user } = useAuth();
  
  const fetchJobs = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Using withUserFilter to automatically add user_id filter
      const query = withUserFilter(
        supabase
          .from('jobs')
          .select(`
            *,
            client:clients(name, email, phone),
            job_products(*, product:products(*))
          `)
          .order('created_at', { ascending: false })
      );
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };
  
  const createJob = async (jobData: any) => {
    try {
      // prepareInsert automatically adds user_id and created_by
      const safeJobData = prepareInsert(jobData);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(safeJobData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Refresh jobs list
      await fetchJobs();
      
      toast.success("Job created successfully");
      return data;
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
      throw error;
    }
  };
  const updateJob = async (jobId: string, updates: any) => {
    try {
      // Use withUserFilter to ensure user can only update their own jobs
      const query = withUserFilter(
        supabase
          .from('jobs')
          .update(updates)
          .eq('id', jobId)
      );
      
      const { data, error } = await query.select().single();
      
      if (error) throw error;
      
      await fetchJobs();
      
      toast.success("Job updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job");
      throw error;
    }
  };
  
  const deleteJob = async (jobId: string) => {
    try {
      // Use withUserFilter to ensure user can only delete their own jobs
      const query = withUserFilter(
        supabase
          .from('jobs')
          .delete()
          .eq('id', jobId)
      );
      
      const { error } = await query;
      
      if (error) throw error;
      
      await fetchJobs();
      
      toast.success("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
      throw error;
    }
  };
  
  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, [user?.id]);
  
  return {
    jobs,
    isLoading,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob
  };
};
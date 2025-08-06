import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useJobTypes, useJobStatuses } from "@/hooks/useConfigItems";
import { generateNextId } from "@/utils/idGeneration";
import { usePermissions } from "@/hooks/usePermissions";
import { withRetry, handleJobsError } from "@/utils/errorHandling";
import { Job, JobStatus, CreateJobInput, UpdateJobInput, validateJob } from "@/types/job";

export const useJobsStable = (clientId?: string, enableCustomFields?: boolean) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { getJobViewScope, canCreateJobs, canEditJobs, canDeleteJobs } = usePermissions();
  const isCreatingJobRef = useRef(false);
  
  // Get configuration data for validation and consistency
  const { items: jobTypes } = useJobTypes();
  const { items: jobStatuses } = useJobStatuses();

  // Memoize fetchJobs to prevent infinite loops
  const fetchJobs = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      if (!isAuthenticated) {
        setHasError(true);
      }
      return;
    }

    if (hasError) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    
    try {
      await withRetry(async () => {
        let query = supabase
          .from('jobs')
          .select(`
            *,
            client:clients(id, name, email, phone, address, city, state, zip)
          `);
        
        // Apply client filter if provided
        if (clientId) {
          query = query.eq('client_id', clientId);
        }
        
        // Apply view scope permissions
        const viewScope = getJobViewScope();
        switch(viewScope) {
          case 'own':
            query = query.or(`user_id.eq.${user.id},created_by.eq.${user.id},technician_id.eq.${user.id}`);
            break;
          case 'team':
            // For team scope, get team members' jobs
            const { data: teamData } = await supabase
              .from('profiles')
              .select('id')
              .eq('organization_id', user.user_metadata?.organization_id);
            
            if (teamData && teamData.length > 0) {
              const teamIds = teamData.map(member => member.id);
              query = query.in('user_id', teamIds);
            }
            break;
          case 'all':
            // No additional filter needed
            break;
        }
        
        // Order by created_at desc to show newest first
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          console.error('❌ Error fetching jobs:', error);
          handleJobsError(error, 'useJobs - fetchJobs');
          setHasError(true);
          throw error;
        }
        
        if (!data) {
          console.log('❌ No data returned from jobs query');
          setJobs([]);
          return;
        }
        
        console.log(`✅ Fetched ${data.length} jobs`);
        setJobs(data as Job[]);
      }, {
        maxRetries: 2,
        baseDelay: 1000
      });
    } catch (error) {
      console.error('❌ Failed to fetch jobs after retries:', error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, user?.id, isAuthenticated, getJobViewScope, hasError]);

  // Only trigger fetch when dependencies actually change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // NO REAL-TIME UPDATES - only manual refresh

  const validateJobData = (jobData: any) => {
    console.log("🔍 validateJobData input:", jobData);
    
    // Validate job type against configuration
    if (jobData.job_type && jobTypes.length > 0) {
      const validJobType = jobTypes.find(jt => jt.name === jobData.job_type);
      if (!validJobType) {
        console.warn(`Job type "${jobData.job_type}" not found in configuration, using default`);
        const defaultJobType = jobTypes.find(jt => jt.is_default);
        jobData.job_type = defaultJobType?.name || 'General Service';
      }
    }

    // Validate status against configuration
    if (jobData.status && jobStatuses.length > 0) {
      const validStatus = jobStatuses.find(js => js.name.toLowerCase() === jobData.status.toLowerCase());
      if (!validStatus) {
        console.warn(`Job status "${jobData.status}" not found in configuration, using default`);
        const defaultStatus = jobStatuses.find(js => js.is_default) || jobStatuses[0];
        jobData.status = defaultStatus?.name || 'New';
      } else {
        // Use the correct casing from the configuration
        jobData.status = validStatus.name;
      }
    }

    // Handle schedule date fields properly
    if (jobData.schedule_start) {
      jobData.date = jobData.schedule_start;
    } else if (!jobData.date && jobData.created_at) {
      jobData.date = jobData.created_at;
    }

    return jobData;
  };

  const refreshJobs = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    fetchJobs();
  }, [fetchJobs]);

  const addJob = useCallback(async (jobData: CreateJobInput) => {
    if (isCreatingJobRef.current) {
      console.log('⚠️ Job creation already in progress, skipping duplicate request');
      return null;
    }

    isCreatingJobRef.current = true;
    console.log("🚀 Starting job creation with data:", jobData);

    try {
      // Generate next job ID
      const nextJobId = await generateNextId('jobs', 'J-');
      console.log("✅ Generated job ID:", nextJobId);

      const validatedData = validateJobData({
        ...jobData,
        id: nextJobId,
        user_id: user?.id,
        created_by: user?.id,
        status: jobData.status || 'New',
        job_type: jobData.job_type || 'General Service',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log("✅ Validated job data:", validatedData);

      const { data, error } = await supabase
        .from('jobs')
        .insert([validatedData])
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .single();

      if (error) {
        console.error('❌ Error creating job:', error);
        handleJobsError(error, 'useJobs - addJob');
        throw error;
      }

      console.log("✅ Job created successfully:", data);
      
      // Refresh jobs list after creation
      await fetchJobs();
      
      return data as Job;
    } catch (error) {
      console.error('❌ Failed to create job:', error);
      throw error;
    } finally {
      isCreatingJobRef.current = false;
    }
  }, [user?.id, fetchJobs, validateJobData, jobTypes, jobStatuses]);

  const updateJob = useCallback(async (jobId: string, updates: UpdateJobInput) => {
    console.log(`🔄 Updating job ${jobId} with:`, updates);

    try {
      const validatedUpdates = validateJobData({
        ...updates,
        updated_at: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('jobs')
        .update(validatedUpdates)
        .eq('id', jobId)
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .single();

      if (error) {
        console.error('❌ Error updating job:', error);
        handleJobsError(error, 'useJobs - updateJob');
        throw error;
      }

      console.log("✅ Job updated successfully:", data);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => job.id === jobId ? data as Job : job)
      );
      
      return data as Job;
    } catch (error) {
      console.error('❌ Failed to update job:', error);
      throw error;
    }
  }, [validateJobData]);

  const deleteJob = useCallback(async (jobId: string) => {
    console.log(`🗑️ Deleting job ${jobId}`);

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('❌ Error deleting job:', error);
        handleJobsError(error, 'useJobs - deleteJob');
        throw error;
      }

      console.log("✅ Job deleted successfully");
      
      // Update local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      return true;
    } catch (error) {
      console.error('❌ Failed to delete job:', error);
      throw error;
    }
  }, []);

  return {
    jobs,
    isLoading,
    hasError,
    refreshJobs,
    addJob,
    updateJob,
    deleteJob,
    canCreate: canCreateJobs(),
    canEdit: canEditJobs(),
    canDelete: canDeleteJobs()
  };
};
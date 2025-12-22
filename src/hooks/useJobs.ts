import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";
import { useJobTypes, useJobStatuses } from "@/hooks/useConfigItems";
import { generateNextId } from "@/utils/idGeneration";
import { usePermissions } from "@/hooks/usePermissions";
import { withRetry, handleJobsError } from "@/utils/errorHandling";
import { Job, JobStatus, CreateJobInput, UpdateJobInput, validateJob } from "@/types/job";

export const useJobs = (clientId?: string, enableCustomFields?: boolean) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
        
        // IMPORTANT: Filter by user_id to ensure data isolation
        query = query.or(`user_id.eq.${user.id},created_by.eq.${user.id}`);
        
        // Apply client filter if specified
        if (clientId) {
          query = query.eq('client_id', clientId);
        }
        
        // Apply role-based filtering
        const jobViewScope = getJobViewScope();
        if (jobViewScope === "assigned" && user?.id) {
          query = query.eq('technician_id', user.id);
        } else if (jobViewScope === "none") {
          setJobs([]);
          setIsLoading(false);
          return;
        }
        
        query = query.order('created_at', { ascending: false });
        
        // Add timeout to prevent hanging
        const queryPromise = query;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 15000)
        );
        
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        if (error) throw error;
        
        // Process jobs to ensure they have proper arrays for tags and tasks
        const processedJobs = (data || []).map(job => ({
          ...job,
          tags: Array.isArray(job.tags) ? job.tags : [],
          tasks: Array.isArray(job.tasks) 
            ? job.tasks.map(task => typeof task === 'string' ? task : String(task))
            : [],
          title: job.title || `${job.client?.name || 'Service'} - ${job.job_type || job.service || 'General Service'}`
        }));
        
        setJobs(processedJobs);
      }, {
        maxRetries: 2,
        baseDelay: 2000,
        exponentialBackoff: true
      });
    } catch (error) {
      setHasError(true);
      handleJobsError(error, 'useJobs - fetchJobs');
    } finally {
      setIsLoading(false);
    }
  }, [clientId, user?.id, isAuthenticated, getJobViewScope, hasError]);

  // Only trigger fetch when dependencies actually change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, refreshTrigger]);

  // Stable callback for real-time updates
  const handleRealtimeUpdate = useCallback(() => {
    console.log('Real-time update triggered for jobs');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Throttled real-time updates with stable callback
  useUnifiedRealtime({
    tables: ['jobs'],
    onUpdate: handleRealtimeUpdate,
    enabled: !hasError && isAuthenticated
  });

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
      // If we have schedule_start, use it as the primary date
      jobData.date = jobData.schedule_start;
    } else if (jobData.date && !jobData.schedule_start) {
      // If we only have date, use it for schedule_start
      jobData.schedule_start = jobData.date;
    }

    // Remove any undefined values or objects with _type: 'undefined'
    Object.keys(jobData).forEach(key => {
      if (jobData[key] === undefined) {
        delete jobData[key];
      } else if (jobData[key] && typeof jobData[key] === 'object' && jobData[key]._type === 'undefined') {
        delete jobData[key];
      }
    });

    // Remove any fields that don't exist in the database schema
    const validFields = [
      'id', 'client_id', 'created_by', 'title', 'description', 'status', 'date',
      'schedule_start', 'schedule_end', 'revenue', 'technician_id', 'tags', 'notes',
      'created_at', 'updated_at', 'job_type', 'lead_source', 'tasks', 'property_id',
      'address', 'user_id', 'created_by_automation', 'automation_triggered_at',
      'deleted_at', 'service'
    ];
    
    Object.keys(jobData).forEach(key => {
      if (!validFields.includes(key)) {
        console.warn(`Removing invalid field: ${key}`);
        delete jobData[key];
      }
    });

    console.log("✅ validateJobData output:", jobData);
    return jobData;
  };

  const addJob = async (jobData: Partial<Job>) => {
    console.log("🔍 addJob called with:", jobData);
    console.log("🔑 User ID:", user?.id);
    console.log("✅ Can create jobs:", canCreateJobs());
    
    // Prevent concurrent job creation
    if (isCreatingJobRef.current) {
      console.warn("⚠️ Job creation already in progress, ignoring duplicate call");
      return null;
    }
    
    isCreatingJobRef.current = true;
    
    if (!canCreateJobs()) {
      console.log("❌ Permission denied for job creation");
      import('@/components/ui/sonner').then(({ toast }) => {
        toast.error("You don't have permission to create jobs");
      });
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
        updated_at: new Date().toISOString(),
        tags: Array.isArray(jobData.tags) ? jobData.tags : [],
        tasks: Array.isArray(jobData.tasks) ? jobData.tasks : []
      });

      console.log("💾 Inserting job into database...");
      const { data, error } = await supabase
        .from('jobs')
        .insert(validatedJobData)
        .select()
        .single();

      if (error) {
        console.error("❌ Database insert error:", error);
        throw error;
      }

      console.log('✅ Job created successfully:', data);
      isCreatingJobRef.current = false;
      return data;
    } catch (error) {
      console.error('Error creating job:', error);
      isCreatingJobRef.current = false;
      throw error;
    }
  };

  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    if (!canEditJobs()) {
      import('@/components/ui/sonner').then(({ toast }) => {
        toast.error("You don't have permission to edit jobs");
      });
      return null;
    }

    try {
      console.log('🔄 Starting job update:', { jobId, updates });
      
      const validatedUpdates = validateJobData({
        ...updates,
        updated_at: new Date().toISOString()
      });
      
      console.log('✅ Validated updates:', validatedUpdates);

      const { data, error } = await supabase
        .from('jobs')
        .update(validatedUpdates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Job updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating job:', error);
      throw error;
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!canDeleteJobs()) {
      import('@/components/ui/sonner').then(({ toast }) => {
        toast.error("You don't have permission to delete jobs");
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      // Optimistic update - immediately remove from local state
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
      console.log('Job deleted successfully:', jobId);
      import('@/components/ui/sonner').then(({ toast }) => {
        toast.success('Job deleted successfully');
      });
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      // On error, refresh to restore correct state
      setRefreshTrigger(prev => prev + 1);
      import('@/components/ui/sonner').then(({ toast }) => {
        toast.error('Failed to delete job');
      });
      throw error;
    }
  };

  const refreshJobs = useCallback(() => {
    setHasError(false);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const clearError = useCallback(() => {
    setHasError(false);
    refreshJobs();
  }, [refreshJobs]);

  return {
    jobs,
    isLoading,
    hasError,
    addJob,
    updateJob,
    deleteJob,
    refreshJobs,
    clearError,
    canCreate: canCreateJobs(),
    canEdit: canEditJobs(),
    canDelete: canDeleteJobs(),
    viewScope: getJobViewScope()
  };
};

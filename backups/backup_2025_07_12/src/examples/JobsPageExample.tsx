// Example: Updated JobsPage with data isolation and niche empty states
import { useEffect, useState } from "react";
import { NicheEmptyState } from "@/components/empty-states/NicheEmptyState";
import { useDataIsolation } from "@/hooks/useDataIsolation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const JobsPageExample = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [businessType, setBusinessType] = useState("");
  const { createSafeQuery } = useDataIsolation();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchJobs();
    fetchBusinessType();
  }, []);
  
  const fetchBusinessType = async () => {
    if (!user?.id) return;
    
    const { data } = await createSafeQuery('profiles')
      .select('business_niche')
      .single();
      
    setBusinessType(data?.business_niche || 'Other');
  };
  
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      
      // Use the safe query builder - automatically filters by user_id
      const { data, error } = await createSafeQuery('jobs')
        .select(`
          *,
          client:clients(name, email, phone),
          job_products(*, product:products(*))
        `)
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Error fetching jobs:", error);
        return;
      }
      
      setJobs(data || []);
    } catch (error) {
      console.error("Error in fetchJobs:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const createJob = async (jobData: any) => {
    try {
      // prepareInsert automatically adds user_id and created_by
      const { data, error } = await createSafeQuery('jobs')
        .insert(jobData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Refresh jobs list
      await fetchJobs();
      return data;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Empty state - niche specific
  if (jobs.length === 0) {
    return <NicheEmptyState type="jobs" businessType={businessType} />;
  }
  
  // Normal jobs list
  return (
    <div>
      {/* Your existing jobs list component */}
      <h1>Jobs ({jobs.length})</h1>
      {/* ... rest of your jobs UI */}
    </div>
  );
};
// Example: Complete implementation of JobsPage with multi-tenancy
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { NicheEmptyState } from "@/components/empty-states/NicheEmptyState";
import { useJobs } from "@/hooks/useJobs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { JobsList } from "@/components/jobs/JobsList";
import { PageHeader } from "@/components/layout/PageHeader";

export const JobsPageMultiTenant = () => {
  const navigate = useNavigate();
  const { jobs, isLoading } = useJobs();
  const { user } = useAuth();
  const [businessType, setBusinessType] = useState<string>("");
  
  useEffect(() => {
    fetchBusinessType();
  }, [user?.id]);
  
  const fetchBusinessType = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('business_niche')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setBusinessType(data?.business_niche || 'Other');
    } catch (error) {
      console.error("Error fetching business type:", error);
      setBusinessType('Other');
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
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Manage your service jobs and work orders"
        action={
          jobs.length > 0 && (
            <Button onClick={() => navigate('/jobs/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          )
        }
      />
      
      {jobs.length === 0 ? (
        <NicheEmptyState type="jobs" businessType={businessType} />
      ) : (
        <JobsList jobs={jobs} />
      )}
    </div>
  );
};
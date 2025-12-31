
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobDataFetchResult {
  jobData: any;
  paymentsData: any[] | null;
}

export const fetchJobWithClient = async (jobId: string): Promise<JobDataFetchResult> => {
  // First, check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("❌ Auth error:", authError);
    throw new Error("Authentication failed");
  }
  
  if (!user) {
    console.error("❌ No authenticated user");
    throw new Error("No authenticated user");
  }
  
  // With simplified RLS, we can directly fetch the job with client data
  const { data: jobData, error: jobError } = await supabase
    .from('jobs')
    .select(`
      *,
      clients(*)
    `)
    .eq('id', jobId)
    .single();
  
  if (jobError) {
    console.error("❌ Error fetching job with client:", jobError);
    
    // If join fails, try fetching job and client separately
    const { data: jobOnly, error: jobOnlyError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (jobOnlyError) {
      console.error("❌ Job not found:", jobOnlyError);
      toast.error(`Job ${jobId} not found`);
      throw new Error(`Job not found: ${jobId}`);
    }
    
    // Get client separately if job has client_id
    let clientData = null;
    if (jobOnly.client_id) {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', jobOnly.client_id)
        .single();
        
      if (!clientError && client) {
        clientData = client;
      } else {
        console.warn("⚠️ Could not fetch client data:", clientError);
      }
    }
    
    const finalJobData = { ...jobOnly, clients: clientData };
    
    // Fetch payments for this job
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('job_id', jobId);
      
    if (paymentsError) {
      console.warn("⚠️ Could not fetch payments:", paymentsError);
    }
    
    return { jobData: finalJobData, paymentsData };
  }
  
  if (!jobData) {
    console.error("❌ No job data returned for jobId:", jobId);
    toast.error(`Job ${jobId} not found`);
    throw new Error("Job not found");
  }

  // Fetch payments for this job
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('payments')
    .select('amount')
    .eq('job_id', jobId);
    
  if (paymentsError) {
    console.warn("⚠️ Could not fetch payments:", paymentsError);
  }
  
  return { jobData, paymentsData };
};

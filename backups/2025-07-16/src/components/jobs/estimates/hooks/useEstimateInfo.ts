import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useEstimateInfo = (jobId?: string) => {
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>({
    name: "Fixlify Services",
    logo: "/placeholder.svg",
    address: "123 Business Ave, Suite 456",
    phone: "(555) 123-4567",
    email: "info@fixlify.com",
    legalText: "All estimates are valid for 30 days from the date of issue."
  });
  
  useEffect(() => {
    if (jobId) {
      // Fetch job information
      const fetchJobInfo = async () => {
        const { data: job, error } = await supabase
          .from('jobs')
          .select('*, clients(*)')
          .eq('id', jobId)
          .single();
          
        if (error) {
          console.error('Error fetching job info:', error);
          return;
        }
        
        if (job) {
          setJobInfo(job);
          setClientInfo(job.clients);
        }
      };
      
      fetchJobInfo();
    }
  }, [jobId]);
  
  return {
    jobInfo,
    clientInfo,
    companyInfo
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ClientInfo {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  fullAddress?: string;
}

interface JobData {
  id: string;
  title: string;
  description?: string;
  client_id?: string;
  property_id?: string;
  address?: string;
}

export const useJobData = (jobId: string) => {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [jobAddress, setJobAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('=== useJobData Debug ===');
        console.log('Fetching job data for jobId:', jobId);

        // Fetch job data with client information without abortSignal
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            clients(*)
          `)
          .eq('id', jobId)
          .maybeSingle();

        if (jobError) {
          console.error('Error fetching job:', jobError);
          throw jobError;
        }

        if (!job) {
          console.log('No job found with ID:', jobId);
          setError('Job not found');
          return;
        }

        console.log('Job data fetched:', job);
        setJobData(job);

        // Set job address
        const address = job?.address || '';
        setJobAddress(address);
        console.log('Job address set:', address);

        // Extract client info
        if (job?.clients) {
          const client = Array.isArray(job.clients) ? job.clients[0] : job.clients;
          console.log('Client data extracted:', client);
          
          // Format client address
          const clientAddress = [
            client.address,
            client.city,
            client.state,
            client.zip
          ].filter(Boolean).join(', ');

          const clientData = {
            id: client.id,
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            company: client.company || '',
            fullAddress: clientAddress
          };

          setClientInfo(clientData);
          console.log('Client info set:', clientData);
        } else {
          console.log('No client data found in job');
          // Set default client info
          setClientInfo({
            name: 'Unknown Client',
            email: '',
            phone: '',
            company: '',
            fullAddress: ''
          });
        }
      } catch (err: any) {
        console.error('Error in fetchJobData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  return {
    jobData,
    clientInfo,
    jobAddress,
    propertyId: jobData?.property_id,
    loading,
    error
  };
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './use-organization';

export interface Job {
  id: string;
  title?: string;
  description?: string;
  client_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  // Add other job fields as needed
}

export const useJobs = () => {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['jobs', organization?.id],
    queryFn: async () => {
      // Get user's profile first to match the organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('organization_id', organization?.id)
        .single();

      if (!profile?.user_id) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to recent jobs for performance

      if (error) throw error;
      return data as Job[];
    },
    enabled: !!organization?.id,
  });
};

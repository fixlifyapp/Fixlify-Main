import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

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
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['jobs', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .or(`user_id.eq.${user.id},created_by.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Job[];
    },
    enabled: !!isAuthenticated && !!user?.id,
  });
};

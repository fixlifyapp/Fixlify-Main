import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './use-organization';

export interface Profile {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  phone?: string | null;
  organization_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useProfiles = () => {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: ['profiles', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!organization?.id,
  });
};

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
};

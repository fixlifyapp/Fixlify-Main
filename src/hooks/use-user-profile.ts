import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  phone?: string;
  organization_id?: string;
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  timezone?: string;
  business_hours?: any;
  created_at?: string;
  updated_at?: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // If no organization_id, set it to the default one
        if (data && !data.organization_id) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ organization_id: '00000000-0000-0000-0000-000000000001' })
            .eq('id', user.id);

          if (!updateError) {
            data.organization_id = '00000000-0000-0000-0000-000000000001';
          }
        }

        setProfile(data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  return { profile, loading, error };
};

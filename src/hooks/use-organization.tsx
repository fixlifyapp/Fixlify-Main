import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';

interface Organization {
  id: string;
  name: string;
  business_type?: string;
  settings?: any;
}

export function useOrganization() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    // For now, we'll use the user's profile as the organization
    // In a real app, you'd fetch the actual organization data
    const loadOrganization = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setOrganization({
            id: profile.id,
            name: profile.name || 'My Company',
            business_type: profile.business_niche || 'field_service',
            settings: profile.settings || {}
          });
        }
      } catch (error) {
        console.error('Error loading organization:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [user?.id]);

  return { organization, loading };
}
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
        // First get the user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, organization_id, business_niche')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profile?.organization_id) {
          // If profile has organization_id, fetch the organization
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profile.organization_id)
            .single();

          if (!orgError && org) {
            setOrganization({
              id: org.id,
              name: org.name || 'My Company',
              business_type: org.business_type || profile.business_niche || 'field_service',
              settings: {}
            });
          } else {
            // Organization not found, use default
            setOrganization({
              id: '00000000-0000-0000-0000-000000000001',
              name: profile.name || 'My Company',
              business_type: profile.business_niche || 'field_service',
              settings: {}
            });
          }
        } else {
          // No organization_id in profile, use default
          setOrganization({
            id: '00000000-0000-0000-0000-000000000001',
            name: profile?.name || 'My Company',
            business_type: profile?.business_niche || 'field_service',
            settings: {}
          });
        }
      } catch (error) {
        console.error('Error loading organization:', error);
        // Fallback to default organization on error
        setOrganization({
          id: '00000000-0000-0000-0000-000000000001',
          name: 'My Company',
          business_type: 'field_service',
          settings: {}
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [user?.id]);

  return { organization, loading };
}
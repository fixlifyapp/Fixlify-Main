import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';

export const useCompanySettings = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();

  const { data: companySettings, isLoading } = useQuery({
    queryKey: ['company-settings', user?.id, organization?.id],
    queryFn: async () => {
      // First try to get from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('timezone, business_hours')
        .eq('user_id', user?.id)
        .single();

      if (!profileError && profile) {
        return {
          timezone: profile.timezone || 'America/New_York',
          businessHours: profile.business_hours || {
            monday: { start: '09:00', end: '17:00', enabled: true },
            tuesday: { start: '09:00', end: '17:00', enabled: true },
            wednesday: { start: '09:00', end: '17:00', enabled: true },
            thursday: { start: '09:00', end: '17:00', enabled: true },
            friday: { start: '09:00', end: '17:00', enabled: true },
            saturday: { start: '09:00', end: '17:00', enabled: false },
            sunday: { start: '09:00', end: '17:00', enabled: false },
          }
        };
      }

      // Try organization settings
      if (organization?.id) {
        const { data: orgSettings, error: orgError } = await supabase
          .from('organization_settings')
          .select('timezone, business_hours')
          .eq('organization_id', organization.id)
          .single();

        if (!orgError && orgSettings) {
          return {
            timezone: orgSettings.timezone || 'America/New_York',
            businessHours: orgSettings.business_hours || {
              monday: { start: '09:00', end: '17:00', enabled: true },
              tuesday: { start: '09:00', end: '17:00', enabled: true },
              wednesday: { start: '09:00', end: '17:00', enabled: true },
              thursday: { start: '09:00', end: '17:00', enabled: true },
              friday: { start: '09:00', end: '17:00', enabled: true },
              saturday: { start: '09:00', end: '17:00', enabled: false },
              sunday: { start: '09:00', end: '17:00', enabled: false },
            }
          };
        }
      }

      // Default values
      return {
        timezone: 'America/New_York',
        businessHours: {
          monday: { start: '09:00', end: '17:00', enabled: true },
          tuesday: { start: '09:00', end: '17:00', enabled: true },
          wednesday: { start: '09:00', end: '17:00', enabled: true },
          thursday: { start: '09:00', end: '17:00', enabled: true },
          friday: { start: '09:00', end: '17:00', enabled: true },
          saturday: { start: '09:00', end: '17:00', enabled: false },
          sunday: { start: '09:00', end: '17:00', enabled: false },
        }
      };
    },
    enabled: !!user?.id,
  });

  return {
    timezone: companySettings?.timezone || 'America/New_York',
    businessHours: companySettings?.businessHours,
    isLoading,
  };
};
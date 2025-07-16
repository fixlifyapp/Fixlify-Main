import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { toast } from 'sonner';

export const useCompanySettings = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: companySettings, isLoading } = useQuery({
    queryKey: ['company-settings', user?.id, organization?.id],
    queryFn: async () => {
      // First try to get from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (!profileError && profile) {
        return {
          company_name: profile.company_name || '',
          company_email: profile.company_email || '',
          company_phone: profile.company_phone || '',
          company_address: profile.company_address || '',
          company_logo: profile.company_logo || '',
          website: profile.website || '',
          timezone: profile.timezone || 'America/New_York',
          business_hours: profile.business_hours || {
            monday: { start: '09:00', end: '17:00', enabled: true },
            tuesday: { start: '09:00', end: '17:00', enabled: true },
            wednesday: { start: '09:00', end: '17:00', enabled: true },
            thursday: { start: '09:00', end: '17:00', enabled: true },
            friday: { start: '09:00', end: '17:00', enabled: true },
            saturday: { start: '09:00', end: '17:00', enabled: false },
            sunday: { start: '09:00', end: '17:00', enabled: false },
          },
          brand_color: profile.brand_color || '#3b82f6',
          ...profile
        };
      }

      // Try organization settings
      if (organization?.id) {
        const { data: orgSettings, error: orgError } = await supabase
          .from('organization_settings')
          .select('*')
          .eq('organization_id', organization.id)
          .single();

        if (!orgError && orgSettings) {
          return {
            company_name: orgSettings.company_name || '',
            company_email: orgSettings.company_email || '',
            company_phone: orgSettings.company_phone || '',
            company_address: orgSettings.company_address || '',
            company_logo: orgSettings.company_logo || '',
            website: orgSettings.website || '',
            timezone: orgSettings.timezone || 'America/New_York',
            business_hours: orgSettings.business_hours || {
              monday: { start: '09:00', end: '17:00', enabled: true },
              tuesday: { start: '09:00', end: '17:00', enabled: true },
              wednesday: { start: '09:00', end: '17:00', enabled: true },
              thursday: { start: '09:00', end: '17:00', enabled: true },
              friday: { start: '09:00', end: '17:00', enabled: true },
              saturday: { start: '09:00', end: '17:00', enabled: false },
              sunday: { start: '09:00', end: '17:00', enabled: false },
            },
            brand_color: orgSettings.brand_color || '#3b82f6',
            ...orgSettings
          };
        }
      }

      // Default values
      return {
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        company_logo: '',
        website: '',
        timezone: 'America/New_York',
        business_hours: {
          monday: { start: '09:00', end: '17:00', enabled: true },
          tuesday: { start: '09:00', end: '17:00', enabled: true },
          wednesday: { start: '09:00', end: '17:00', enabled: true },
          thursday: { start: '09:00', end: '17:00', enabled: true },
          friday: { start: '09:00', end: '17:00', enabled: true },
          saturday: { start: '09:00', end: '17:00', enabled: false },
          sunday: { start: '09:00', end: '17:00', enabled: false },
        },
        brand_color: '#3b82f6'
      };
    },
    enabled: !!user?.id,
  });

  const updateCompanySettings = useMutation({
    mutationFn: async (updates: any) => {
      if (!user?.id) throw new Error('No user found');

      // Update in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // If organization exists, update there too
      if (organization?.id) {
        const { error: orgError } = await supabase
          .from('organization_settings')
          .upsert({
            organization_id: organization.id,
            ...updates,
            updated_at: new Date().toISOString()
          });

        if (orgError) throw orgError;
      }

      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast.success('Company settings updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating company settings:', error);
      toast.error('Failed to update company settings');
    }
  });

  return {
    companySettings,
    isLoading,
    updateCompanySettings: updateCompanySettings.mutate
  };
};
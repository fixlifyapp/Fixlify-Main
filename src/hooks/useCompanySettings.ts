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
      // First try to get from company_settings table
      const { data: companyData, error: companyError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!companyError && companyData) {
        return {
          company_name: companyData.company_name || '',
          company_email: companyData.company_email || '',
          company_phone: companyData.company_phone || '',
          company_address: companyData.company_address || '',
          company_logo: companyData.company_logo_url || '',
          website: companyData.company_website || '',
          timezone: companyData.company_timezone || 'America/New_York',
          business_hours: companyData.business_hours || {
            monday: { start: '09:00', end: '17:00', enabled: true },
            tuesday: { start: '09:00', end: '17:00', enabled: true },
            wednesday: { start: '09:00', end: '17:00', enabled: true },
            thursday: { start: '09:00', end: '17:00', enabled: true },
            friday: { start: '09:00', end: '17:00', enabled: true },
            saturday: { start: '09:00', end: '17:00', enabled: false },
            sunday: { start: '09:00', end: '17:00', enabled: false },
          },
          brand_color: '#3b82f6',
          ...companyData
        };
      }

      // Then try to get from profiles table
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

      // Also update the company_settings table
      const { error: companyError } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          company_name: updates.company_name,
          company_email: updates.company_email,
          company_phone: updates.company_phone,
          company_address: updates.company_address,
          company_city: updates.company_city,
          company_state: updates.company_state,
          company_zip: updates.company_zip,
          company_country: updates.company_country,
          company_website: updates.website,
          company_logo_url: updates.company_logo,
          updated_at: new Date().toISOString()
        });

      if (companyError) {
        console.error('Error updating company_settings:', companyError);
        // Don't throw here, as profiles was updated successfully
      }

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
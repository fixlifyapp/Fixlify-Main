import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { toast } from 'sonner';
import { DEFAULT_TIMEZONE } from '@/utils/timezones';

interface CompanySettings {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_city?: string;
  company_state?: string;
  company_zip?: string;
  company_country?: string;
  company_website?: string;
  company_timezone?: string;
  business_type?: string;
  tax_id?: string;
  logo_url?: string;
  [key: string]: any;
}

export const useCompanySettings = () => {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCompanySettings = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching company settings:', error);
        toast.error('Failed to load company settings');
      } else if (data) {
        // Ensure timezone is set
        if (!data.company_timezone) {
          data.company_timezone = DEFAULT_TIMEZONE;
        }
        // Ensure business_hours is set
        if (!data.business_hours) {
          data.business_hours = {
            monday: { open: "09:00", close: "17:00", enabled: true },
            tuesday: { open: "09:00", close: "17:00", enabled: true },
            wednesday: { open: "09:00", close: "17:00", enabled: true },
            thursday: { open: "09:00", close: "17:00", enabled: true },
            friday: { open: "09:00", close: "17:00", enabled: true },
            saturday: { open: "09:00", close: "15:00", enabled: false },
            sunday: { open: "10:00", close: "14:00", enabled: false }
          };
        }
        setCompanySettings(data);
      } else {
        // No settings found, create minimal default
        const defaultSettings = {
          user_id: user.id,
          company_timezone: DEFAULT_TIMEZONE,
          business_hours: {
            monday: { open: "09:00", close: "17:00", enabled: true },
            tuesday: { open: "09:00", close: "17:00", enabled: true },
            wednesday: { open: "09:00", close: "17:00", enabled: true },
            thursday: { open: "09:00", close: "17:00", enabled: true },
            friday: { open: "09:00", close: "17:00", enabled: true },
            saturday: { open: "09:00", close: "15:00", enabled: false },
            sunday: { open: "10:00", close: "14:00", enabled: false }
          }
          // All other fields will be null/empty by default
        };
        
        const { data: newData, error: createError } = await supabase
          .from('company_settings')
          .insert(defaultSettings)
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating default company settings:', createError);
        } else if (newData) {
          setCompanySettings(newData);
        }
      }
    } catch (error) {
      console.error('Error in fetchCompanySettings:', error);
      toast.error('Failed to load company settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompanySettings = async (updates: Partial<CompanySettings>) => {
    if (!user?.id) return;

    try {
      // If timezone is being updated, validate it
      if (updates.company_timezone && !isValidTimezone(updates.company_timezone)) {
        toast.error('Invalid timezone selected');
        return;
      }

      const { data, error } = await supabase
        .from('company_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company settings:', error);
        toast.error('Failed to update company settings');
      } else if (data) {
        setCompanySettings(data);
        toast.success('Company settings updated successfully');
      }
    } catch (error) {
      console.error('Error in updateCompanySettings:', error);
      toast.error('Failed to update company settings');
    }
  };

  useEffect(() => {
    fetchCompanySettings();
  }, [user?.id]);

  return {
    companySettings,
    isLoading,
    updateCompanySettings,
    refetch: fetchCompanySettings
  };
};

// Helper function to validate timezone
const isValidTimezone = (tz: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (error) {
    return false;
  }
};

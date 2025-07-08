
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanySettings {
  id: string;
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  business_niche?: string;
  mailgun_api_key?: string;
  mailgun_domain?: string;
  email_from_address?: string;
  email_from_name?: string;
  settings?: any;
}

export const useCompanySettings = () => {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company settings:', error);
        return;
      }

      setCompanySettings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompanySettings = async (updates: Partial<CompanySettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCompanySettings(data);
      return data;
    } catch (error) {
      console.error('Error updating company settings:', error);
      throw error;
    }
  };

  return {
    companySettings,
    isLoading,
    updateCompanySettings
  };
};

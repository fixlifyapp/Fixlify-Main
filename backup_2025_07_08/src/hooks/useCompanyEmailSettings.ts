
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyEmailSettings {
  id?: string;
  custom_domain?: string;
  mailgun_domain?: string;
  email_from_name?: string;
  email_from_address?: string;
  domain_verification_status?: 'pending' | 'verified' | 'failed';
  mailgun_settings?: any;
}

export const useCompanyEmailSettings = () => {
  const [settings, setSettings] = useState<CompanyEmailSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('company_settings')
        .select('id, custom_domain, mailgun_domain, email_from_name, email_from_address, domain_verification_status, mailgun_settings')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email settings:', error);
        return;
      }

      if (data) {
        // Ensure domain_verification_status matches our type
        const verificationStatus = data.domain_verification_status as 'pending' | 'verified' | 'failed' || 'pending';
        
        setSettings({
          ...data,
          domain_verification_status: verificationStatus
        });
      }
    } catch (error) {
      console.error('Error fetching email settings:', error);
      toast.error('Failed to load email settings');
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async (domain: string) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-mailgun-domains', {
        body: { action: 'add', domain }
      });

      if (error) throw error;

      await fetchSettings();
      toast.success('Domain added successfully! Please verify DNS records.');
      return data;
    } catch (error) {
      console.error('Error adding domain:', error);
      toast.error('Failed to add domain');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const verifyDomain = async (domain: string) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-mailgun-domains', {
        body: { action: 'verify', domain }
      });

      if (error) throw error;

      await fetchSettings();
      
      if (data.verified) {
        toast.success('Domain verified successfully!');
      } else {
        toast.warning('Domain not yet verified. Please check DNS records.');
      }
      
      return data;
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast.error('Failed to verify domain');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateEmailSettings = async (updates: Partial<CompanyEmailSettings>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('company_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...updates }));
      toast.success('Email settings updated successfully');
    } catch (error) {
      console.error('Error updating email settings:', error);
      toast.error('Failed to update email settings');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    addDomain,
    verifyDomain,
    updateEmailSettings,
    refreshSettings: fetchSettings
  };
};

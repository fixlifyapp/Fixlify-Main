import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from './useAuthState';
import { toast } from 'sonner';

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  smtp_secure: boolean;
  is_configured: boolean;
}

export const useCompanyEmailSettings = () => {
  const { user } = useAuthState();
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    }
  }, [user?.id]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_communication_settings')
        .select('*')
        .eq('organization_id', user?.user_metadata?.organizationId || user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSettings(data || {
        smtp_host: '',
        smtp_port: 587,
        smtp_username: '',
        smtp_password: '',
        smtp_from_email: '',
        smtp_from_name: '',
        smtp_secure: true,
        is_configured: false
      });
    } catch (error) {
      console.error('Error fetching email settings:', error);
      toast.error('Failed to load email settings');
    } finally {
      setLoading(false);
    }
  };
  const saveSettings = async (newSettings: Partial<EmailSettings>) => {
    setSaving(true);
    try {
      const organizationId = user?.user_metadata?.organizationId || user?.id;
      
      const { error } = await supabase
        .from('organization_communication_settings')
        .upsert({
          organization_id: organizationId,
          ...newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev!, ...newSettings }));
      toast.success('Email settings saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Failed to save email settings');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!settings?.smtp_host || !settings?.smtp_username) {
      toast.error('Please configure SMTP settings first');
      return false;
    }

    try {
      // This would call an edge function to test the SMTP connection
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: settings
      });

      if (error) throw error;

      if (data.success) {
        toast.success('SMTP connection successful!');
        return true;
      } else {
        toast.error(data.message || 'SMTP connection failed');
        return false;
      }
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      toast.error('Failed to test SMTP connection');
      return false;
    }
  };

  return {
    settings,
    loading,
    saving,
    saveSettings,
    testConnection,
    refetch: fetchSettings
  };
};
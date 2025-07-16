
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserSettings {
  id?: string;
  user_id?: string;
  // Interface preferences
  dark_mode: boolean;
  compact_view: boolean;
  sound_effects: boolean;
  default_landing_page: string;
  date_format: string;
  // Notifications
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  job_reminders: boolean;
  invoice_alerts: boolean;
  marketing_updates: boolean;
  // System settings
  language: string;
  timezone: string;
  currency: string;
  // Tax configuration
  default_tax_rate: number;
  tax_region: string;
  tax_label: string;
  // Personal preferences
  notification_email?: string;
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: UserSettings = {
  dark_mode: false,
  compact_view: false,
  sound_effects: false,
  default_landing_page: 'dashboard',
  date_format: 'mm-dd-yyyy',
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  job_reminders: true,
  invoice_alerts: true,
  marketing_updates: false,
  language: 'en',
  timezone: 'utc-7',
  currency: 'usd',
  default_tax_rate: 13.00,
  tax_region: 'Ontario',
  tax_label: 'HST'
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('useUserSettings - Fetching settings for user:', user.id);

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        return;
      }

      if (data) {
        console.log('useUserSettings - Found settings:', data);
        setSettings({ ...defaultSettings, ...data });
      } else {
        console.log('useUserSettings - No settings found, creating default');
        // Create default settings if none exist
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            ...defaultSettings
          });
        
        if (!insertError) {
          setSettings(defaultSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
      toast.error('Failed to load user settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      console.log('useUserSettings - Updating settings with:', updates);
      
      const newSettings = { ...settings, ...updates };
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...newSettings
        });

      if (error) {
        console.error('useUserSettings - Database error:', error);
        throw error;
      }

      setSettings(newSettings);
      console.log('useUserSettings - Settings updated successfully:', newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings
  };
};

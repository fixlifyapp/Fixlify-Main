
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BusinessHours, DEFAULT_BUSINESS_HOURS } from '@/types/businessHours';

export interface CompanySettings {
  id?: string;
  user_id?: string;
  // Company information
  company_name: string;
  business_type: string;
  business_niche?: string; // Added business niche
  company_address: string;
  company_city: string;
  company_state: string;
  company_zip: string;
  company_country: string;
  // Contact information
  company_phone: string;
  company_email: string;
  company_website: string;
  tax_id: string;
  // Branding
  company_logo_url?: string;
  company_tagline: string;
  company_description: string;
  // Service areas
  service_radius: number;
  service_zip_codes: string;
  // Business hours
  business_hours: BusinessHours;
  // Email settings
  custom_domain_name?: string;
  mailgun_domain?: string;
  email_from_name?: string;
  email_from_address?: string;
  domain_verification_status?: string;
  mailgun_settings?: any;
  created_at?: string;
  updated_at?: string;
}

const defaultCompanySettings: CompanySettings = {
  company_name: '',
  business_type: 'HVAC & Plumbing Services',
  company_address: '123 Business Park, Suite 456',
  company_city: 'San Francisco',
  company_state: 'California',
  company_zip: '94103',
  company_country: 'United States',
  company_phone: '(555) 123-4567',
  company_email: 'contact@fixlyfy.com',
  company_website: 'https://www.fixlyfy.com',
  tax_id: 'XX-XXXXXXX',
  company_tagline: 'Smart Solutions for Field Service Businesses',
  company_description: 'Professional HVAC, plumbing and electrical services to residential and commercial customers throughout the Bay Area. Our team of skilled technicians is available 24/7 for all your service needs.',
  service_radius: 50,
  service_zip_codes: '94103, 94104, 94105, 94107, 94108, 94109, 94110, 94111, 94112, 94114, 94115, 94116, 94117, 94118, 94121, 94122, 94123, 94124, 94127, 94129, 94130, 94131, 94132, 94133, 94134, 94158',
  business_hours: DEFAULT_BUSINESS_HOURS,
  email_from_name: 'Support Team'
};

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        setLoading(false);
        return;
      }

      console.log('fetchSettings - Current user ID:', user.id);

      // Always fetch with explicit user_id filter and single() to ensure we get exactly one record
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company settings:', error);
        setLoading(false);
        return;
      }

      if (data) {
        const businessHours = data.business_hours ? 
          (typeof data.business_hours === 'string' ? JSON.parse(data.business_hours) : data.business_hours) :
          DEFAULT_BUSINESS_HOURS;
          
        console.log('fetchSettings - Found company settings for user:', user.id);
        console.log('fetchSettings - Company name from DB:', data.company_name);
        
        setSettings({ 
          ...defaultCompanySettings, 
          ...data,
          business_hours: businessHours
        });
      } else {
        console.log('fetchSettings - No settings found, creating default for user:', user.id);
        
        // Create default settings if none exist
        const newSettings = {
          ...defaultCompanySettings,
          company_name: ''
        };
        
        const { error: insertError } = await supabase
          .from('company_settings')
          .insert({
            user_id: user.id,
            ...newSettings,
            business_hours: JSON.stringify(DEFAULT_BUSINESS_HOURS)
          });
        
        if (!insertError) {
          console.log('fetchSettings - Created new company settings for user:', user.id);
          setSettings(newSettings);
        } else {
          console.error('Error creating company settings:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      toast.error('Failed to load company settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      console.log('updateSettings - User ID:', user.id);
      console.log('updateSettings - Updates:', updates);
      
      const newSettings = { ...settings, ...updates };
      
      // Prepare data for database with explicit user_id
      const dataToUpdate = {
        user_id: user.id, // Explicitly set user_id
        ...newSettings,
        business_hours: JSON.stringify(newSettings.business_hours)
      };
      
      console.log('updateSettings - Saving to database with user_id:', user.id);
      console.log('updateSettings - Company name being saved:', dataToUpdate.company_name);
      
      // Use upsert with explicit user_id conflict resolution
      const { data, error } = await supabase
        .from('company_settings')
        .upsert(dataToUpdate, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('updateSettings - Database update successful:', data);
      console.log('updateSettings - Saved company name:', data.company_name);

      // Sync business hours with AI agent config if it exists
      if (updates.business_hours) {
        await syncBusinessHoursWithAIAgent(user.id, updates.business_hours);
      }

      setSettings(newSettings);
      toast.success('Company settings updated successfully');
    } catch (error) {
      console.error('Error updating company settings:', error);
      toast.error('Failed to update company settings');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const syncBusinessHoursWithAIAgent = async (userId: string, businessHours: BusinessHours) => {
    try {
      const { data: aiConfig } = await supabase
        .from('ai_agent_configs')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (aiConfig) {
        await supabase
          .from('ai_agent_configs')
          .update({
            business_hours: businessHours,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        console.log('AI agent business hours synced with company settings');
      }
    } catch (error) {
      console.error('Error syncing business hours with AI agent:', error);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refetch: fetchSettings
  };
};

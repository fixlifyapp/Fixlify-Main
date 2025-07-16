
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIAgentConfig {
  id: string;
  user_id: string;
  company_name: string;
  business_niche: string;
  service_types: any; // Using any to match Json type from database
  service_areas: any[];
  diagnostic_price: number;
  emergency_surcharge: number;
  business_hours: any;
  custom_prompt_additions?: string;
  is_active: boolean;
  agent_name: string;
  voice_id: string;
  greeting_template: string;
  aws_region: string;
  connect_instance_arn?: string;
  created_at: string;
  updated_at: string;
}

export const useAIAgentConfig = () => {
  const [config, setConfig] = useState<AIAgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading AI agent config:', error);
        throw error;
      }

      // Transform the data to match our interface
      if (data) {
        setConfig({
          ...data,
          service_types: Array.isArray(data.service_types) ? data.service_types : []
        } as AIAgentConfig);
      } else {
        setConfig(null);
      }
    } catch (err: any) {
      console.error('Error in loadConfig:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: Partial<AIAgentConfig>) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('ai_agent_configs')
        .upsert({
          ...configData,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving AI agent config:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedData = {
        ...data,
        service_types: Array.isArray(data.service_types) ? data.service_types : []
      } as AIAgentConfig;

      setConfig(transformedData);
      toast.success('AI agent configuration saved successfully');
      return transformedData;
    } catch (err: any) {
      console.error('Error in saveConfig:', err);
      setError(err.message);
      toast.error('Failed to save AI agent configuration');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!config) return;

    try {
      const newActiveState = !config.is_active;
      
      const { error } = await supabase
        .from('ai_agent_configs')
        .update({ 
          is_active: newActiveState,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) {
        console.error('Error toggling AI agent status:', error);
        throw error;
      }

      setConfig(prev => prev ? { ...prev, is_active: newActiveState } : null);
      
      return newActiveState;
    } catch (err: any) {
      console.error('Error in toggleActive:', err);
      setError(err.message);
      toast.error('Failed to toggle AI agent status');
      throw err;
    }
  };

  const createDefaultConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get company settings to prefill some data
      const { data: companySettings } = await supabase
        .from('company_settings')
        .select('company_name, business_type')
        .eq('user_id', user.id)
        .single();

      const defaultConfig = {
        user_id: user.id,
        company_name: companySettings?.company_name || 'Your Company',
        business_niche: companySettings?.business_type || 'General Service',
        service_types: ['HVAC', 'Plumbing', 'Electrical'],
        service_areas: [],
        diagnostic_price: 75,
        emergency_surcharge: 50,
        business_hours: {
          monday: { enabled: true, open: '08:00', close: '17:00' },
          tuesday: { enabled: true, open: '08:00', close: '17:00' },
          wednesday: { enabled: true, open: '08:00', close: '17:00' },
          thursday: { enabled: true, open: '08:00', close: '17:00' },
          friday: { enabled: true, open: '08:00', close: '17:00' },
          saturday: { enabled: true, open: '09:00', close: '15:00' },
          sunday: { enabled: false, open: '10:00', close: '14:00' }
        },
        is_active: false,
        agent_name: 'AI Assistant',
        voice_id: 'alloy',
        greeting_template: 'Hello, my name is {agent_name}. I\'m an AI assistant for {company_name}. How can I help you today?',
        aws_region: 'us-east-1'
      };

      return await saveConfig(defaultConfig);
    } catch (err: any) {
      console.error('Error creating default config:', err);
      setError(err.message);
      toast.error('Failed to create default AI agent configuration');
      throw err;
    }
  };

  const saveAWSCredentials = async (credentials: any) => {
    try {
      // For now, just save to the config
      return await saveConfig(credentials);
    } catch (err: any) {
      console.error('Error saving AWS credentials:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    saving,
    error,
    saveConfig,
    toggleActive,
    createDefaultConfig,
    refreshConfig: loadConfig,
    saveAWSCredentials,
    awsCredentials: config // Alias for backward compatibility
  };
};

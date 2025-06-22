import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

export interface BusinessConfig {
  company_name: string;
  business_type: string;
  company_phone: string;
  company_address: string | null;
  company_city: string | null;
  company_state: string | null;
  service_zip_codes: string | null;
  agent_name: string;
  diagnostic_price: number;
  emergency_surcharge: number;
  service_areas: string[];
  service_types: string[];
  business_hours: any;
  custom_prompt_additions: string;
}

export const getBusinessConfig = async (supabaseClient: any): Promise<BusinessConfig> => {
  // First try to get company settings
  const { data: companySettings } = await supabaseClient
    .from('company_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  // Then get AI agent config
  const { data: aiConfigs } = await supabaseClient
    .from('ai_agent_configs')
    .select('*')
    .eq('is_active', true)
    .limit(1)

  let aiConfig = aiConfigs?.[0]
  
  // Create enhanced config with company data
  const businessConfig: BusinessConfig = {
    // Company info (prioritize company_settings, fallback to ai_agent_configs)
    company_name: companySettings?.company_name || aiConfig?.company_name || 'Fixlify Services',
    business_type: companySettings?.business_type || aiConfig?.business_niche || 'HVAC & Plumbing Services',
    company_phone: companySettings?.company_phone || '(555) 123-4567',
    company_address: companySettings?.company_address || null,
    company_city: companySettings?.company_city || null,
    company_state: companySettings?.company_state || null,
    service_zip_codes: companySettings?.service_zip_codes || null,
    
    // AI config
    agent_name: aiConfig?.agent_name || 'AI Assistant',
    diagnostic_price: aiConfig?.diagnostic_price || 75,
    emergency_surcharge: aiConfig?.emergency_surcharge || 50,
    service_areas: aiConfig?.service_areas || [],
    service_types: aiConfig?.service_types || ['HVAC', 'Plumbing', 'Electrical', 'General Repair'],
    business_hours: aiConfig?.business_hours || {},
    custom_prompt_additions: aiConfig?.custom_prompt_additions || ''
  }

  console.log('Business config loaded:', JSON.stringify(businessConfig, null, 2))
  return businessConfig
}

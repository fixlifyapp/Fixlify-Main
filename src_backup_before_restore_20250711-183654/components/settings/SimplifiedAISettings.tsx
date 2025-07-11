
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { parseStringArray, parseBusinessHours } from "./utils/aiSettingsUtils";
import { AIStatusCard } from "./components/AIStatusCard";
import { BusinessInfoCard } from "./components/BusinessInfoCard";
import { PricingCard } from "./components/PricingCard";
import { ServiceAreasCard } from "./components/ServiceAreasCard";
import { ApplianceTypesCard } from "./components/ApplianceTypesCard";
import { BusinessHoursEditor } from "../connect/BusinessHoursEditor";
import { CustomInstructionsCard } from "./components/CustomInstructionsCard";
import { AIAgentToggle } from "../connect/AIAgentToggle";
import { BusinessHours } from "@/types/businessHours";

export const SimplifiedAISettings = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    is_active: true,
    diagnostic_price: 75.00,
    emergency_surcharge: 50.00,
    service_areas: [] as string[],
    appliance_types: [] as string[],
    business_hours: {
      monday: { open: '08:00', close: '17:00', enabled: true },
      tuesday: { open: '08:00', close: '17:00', enabled: true },
      wednesday: { open: '08:00', close: '17:00', enabled: true },
      thursday: { open: '08:00', close: '17:00', enabled: true },
      friday: { open: '08:00', close: '17:00', enabled: true },
      saturday: { open: '09:00', close: '15:00', enabled: true },
      sunday: { open: '10:00', close: '14:00', enabled: false }
    } as BusinessHours,
    custom_instructions: '',
    company_name: 'Your Company',
    agent_name: 'AI Assistant'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [user]);

  const fetchConfig = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);

      // First, fetch company settings to get real company data
      const { data: companyData } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Then fetch AI agent config
      const { data, error } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching AI config:', error);
        return;
      }

      // Use company data as primary source, fallback to AI config, then defaults
      const companyName = companyData?.company_name || data?.company_name || 'Your Company';
      const businessType = companyData?.business_type || data?.business_niche || 'General Service';

      if (data) {
        setConfig({
          is_active: data.is_active ?? true,
          diagnostic_price: data.diagnostic_price || 75.00,
          emergency_surcharge: data.emergency_surcharge || 50.00,
          service_areas: parseStringArray(data.service_areas),
          appliance_types: parseStringArray(data.service_types),
          business_hours: parseBusinessHours(data.business_hours),
          custom_instructions: data.custom_prompt_additions || '',
          company_name: companyName,
          agent_name: data.agent_name || 'AI Assistant'
        });
      } else {
        // Create default config with company data if available
        setConfig({
          is_active: true,
          diagnostic_price: 75.00,
          emergency_surcharge: 50.00,
          service_areas: [],
          appliance_types: ['HVAC', 'Plumbing', 'Electrical', 'General Repair'],
          business_hours: parseBusinessHours(companyData?.business_hours) || config.business_hours,
          custom_instructions: '',
          company_name: companyName,
          agent_name: 'AI Assistant'
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const configData = {
        user_id: user.id,
        is_active: config.is_active,
        diagnostic_price: config.diagnostic_price,
        emergency_surcharge: config.emergency_surcharge,
        service_areas: config.service_areas,
        service_types: config.appliance_types,
        business_hours: config.business_hours,
        custom_prompt_additions: config.custom_instructions,
        company_name: config.company_name,
        agent_name: config.agent_name,
        business_niche: 'Service Business',
        voice_id: 'alloy',
        greeting_template: `Hello! This is ${config.agent_name} from ${config.company_name}. How can I help you today?`,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ai_agent_configs')
        .upsert(configData, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success('AI settings saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save AI settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Agent Control */}
      <AIAgentToggle />

      <AIStatusCard 
        isActive={config.is_active}
        onToggle={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
      />

      <BusinessInfoCard
        companyName={config.company_name}
        agentName={config.agent_name}
        onCompanyNameChange={(value) => setConfig(prev => ({ ...prev, company_name: value }))}
        onAgentNameChange={(value) => setConfig(prev => ({ ...prev, agent_name: value }))}
      />

      <PricingCard
        diagnosticPrice={config.diagnostic_price}
        emergencySurcharge={config.emergency_surcharge}
        onDiagnosticPriceChange={(value) => setConfig(prev => ({ ...prev, diagnostic_price: value }))}
        onEmergencySurchargeChange={(value) => setConfig(prev => ({ ...prev, emergency_surcharge: value }))}
      />

      <ServiceAreasCard
        serviceAreas={config.service_areas}
        onServiceAreasChange={(areas) => setConfig(prev => ({ ...prev, service_areas: areas }))}
      />

      <ApplianceTypesCard
        selectedTypes={config.appliance_types}
        onTypesChange={(types) => setConfig(prev => ({ ...prev, appliance_types: types }))}
      />

      <BusinessHoursEditor
        businessHours={config.business_hours}
        onBusinessHoursChange={(hours) => setConfig(prev => ({ ...prev, business_hours: hours }))}
      />

      <CustomInstructionsCard
        instructions={config.custom_instructions}
        onInstructionsChange={(instructions) => setConfig(prev => ({ ...prev, custom_instructions: instructions }))}
      />

      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save AI Settings'}
        </Button>
      </div>
    </div>
  );
};

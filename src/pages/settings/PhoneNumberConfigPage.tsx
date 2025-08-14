import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, Bot, MessageSquare, PhoneCall,
  ChevronLeft, Save, RefreshCw,
  CheckCircle, Loader2, TestTube
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { formatPhoneNumber } from "@/utils/phone-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { businessNiches } from "@/utils/business-niches";
import { nicheCapabilities, nicheServices, nicheGreetings, nichePersonalities } from "@/config/niche-capabilities";

const TELNYX_AI_ASSISTANT_ID = 'assistant-2a8a396c-e975-4ea5-90bf-3297f1350775';

interface PhoneConfig {
  id: string;
  phone_number: string;
  friendly_name?: string;
  status: string;
  is_primary: boolean;
  is_active: boolean;
  ai_dispatcher_enabled: boolean;
  capabilities?: {
    sms?: boolean;
    voice?: boolean;
    mms?: boolean;
  };
  ai_config?: {
    assistant_id?: string;
    company_name?: string;
    business_niche?: string;
    business_greeting?: string;
    agent_name?: string;
    agent_personality?: string;
    voice_id?: string;
    hours_of_operation?: string;
    services_offered?: string[];
    call_transfer_message?: string;
    voicemail_detection_message?: string;
    instructions?: string;
    current_date?: string;
    current_time?: string;
    greeting?: string;
  };
}
export default function PhoneNumberConfigPage() {
  const { phoneId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [config, setConfig] = useState<PhoneConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("ai-voice");
  // Business niches are imported from utils/business-niches.ts - no need for state

  useEffect(() => {
    if (phoneId && user?.id) {
      loadPhoneConfig();
      // No need to load business niches from database - we use the hardcoded list
    }
  }, [phoneId, user?.id]);

  // Removed loadBusinessNiches function - using hardcoded list from utils/business-niches.ts
  
  const loadPhoneConfig = async () => {
    if (!phoneId || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('id', phoneId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        let configData: PhoneConfig = data;
        
        // Load AI config
        if (data.ai_dispatcher_enabled) {
          const { data: aiConfig } = await supabase
            .from('ai_dispatcher_configs')
            .select('*')
            .eq('phone_number_id', phoneId)
            .single();
          
          if (aiConfig) {
            // Parse services_offered if it's a string representation of an array
            let services = aiConfig.services_offered;
            if (typeof services === 'string') {
              try {
                // If it's a JSON string like '["Service1", "Service2"]'
                services = JSON.parse(services);
              } catch {
                // If it's a comma-separated string
                services = services.split(',').map(s => s.trim());
              }
            }
            
            configData.ai_config = {
              ...aiConfig,
              assistant_id: TELNYX_AI_ASSISTANT_ID,
              // Ensure services_offered is always an array
              services_offered: Array.isArray(services) 
                ? services 
                : [],
              // Load new fields
              business_niche: aiConfig.business_niche || aiConfig.business_type || '',
              capabilities: aiConfig.capabilities || '',
              service_area: aiConfig.service_area || '',
              payment_methods: aiConfig.payment_methods || '',
              warranty_info: aiConfig.warranty_info || '',
              scheduling_rules: aiConfig.scheduling_rules || '',
              emergency_hours: aiConfig.emergency_hours || ''
            };
          }
        }

        // Load from profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('company_name, business_niche')
          .eq('id', user.id)
          .single();

        // Apply defaults from settings
        if (!configData.ai_config) {
          configData.ai_config = {};
        }
        
        configData.ai_config.company_name = configData.ai_config.company_name || profileData?.company_name || 'Fixlify Service';
        configData.ai_config.business_niche = configData.ai_config.business_niche || profileData?.business_niche || '';

        setConfig(configData);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Failed to load phone configuration');
      navigate('/settings/phone-numbers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNicheChange = (niche: string) => {
    if (config) {
      setConfig({
        ...config,
        ai_config: {
          ...config.ai_config,
          business_niche: niche,
          business_greeting: 'Thank you for calling ' + (config.ai_config?.company_name || 'our company') + '. I am ' + (config.ai_config?.agent_name || 'your assistant') + ', how can I help you today?'
        }
      });
    }
  };
  const generateInstructions = () => {
    if (!config?.ai_config) return '';
    
    const businessNiche = config.ai_config.business_niche || 'professional service';
    const personality = config.ai_config.agent_personality || 'Be professional, friendly, and helpful';
    const capabilities = config.ai_config.capabilities || `1. Check repair status
2. Book appointments
3. Provide repair quotes
4. Answer service questions
5. Transfer to human agent when needed`;
    
    let instructions = `You are {{agent_name}} for {{company_name}}, a professional ${businessNiche} AI assistant.

## Business Information
- Hours: {{hours_of_operation}}
- Services: {{services_offered}}
- Phone: {{business_phone}}
- Current Time: {{current_date}} {{current_time}} (Toronto/EST)

## Your Core Capabilities
${capabilities}

## Speech Characteristics
- Use clear, concise language with natural contractions
- Speak at a measured pace, especially when confirming dates and times
- Include occasional conversational elements like "Let me check that for you"
- Pronounce names and technical terms correctly and clearly

## Conversation Flow
1. Greet warmly and ask how you can help
2. Listen actively and confirm understanding
3. Provide helpful information or take action
4. Confirm next steps before ending call
5. Always offer additional assistance

## Important Guidelines
- If caller seems frustrated, remain calm and empathetic
- Always confirm appointment details before booking
- If unsure, offer to transfer to a human technician
- ${personality}`;
    
    return instructions;
  };

  const saveConfig = async () => {
    if (!config || !phoneId) return;

    setIsSaving(true);
    try {
      const { error: phoneError } = await supabase
        .from('phone_numbers')
        .update({
          friendly_name: config.friendly_name,
          ai_dispatcher_enabled: config.ai_dispatcher_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', phoneId);

      if (phoneError) throw phoneError;

      if (config.ai_dispatcher_enabled && config.ai_config) {
        const now = new Date();
        const dynamicVariables = {
          agent_name: config.ai_config.agent_name || 'Sarah',
          company_name: config.ai_config.company_name || 'Fixlify',
          hours_of_operation: config.ai_config.hours_of_operation || 'Monday-Friday 9am-6pm',
          services_offered: Array.isArray(config.ai_config.services_offered) 
            ? config.ai_config.services_offered.join(', ') 
            : config.ai_config.services_offered || '',
          current_date: now.toLocaleDateString(),
          current_time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          greeting: config.ai_config.business_greeting || 'Thank you for calling. How can I help you today?',
          business_phone: config.phone_number || ''
        };

        // Prepare AI config data
        const aiConfigData = {
          phone_number_id: phoneId,
          assistant_id: TELNYX_AI_ASSISTANT_ID,
          agent_name: config.ai_config.agent_name || 'Sarah',
          company_name: config.ai_config.company_name || 'Fixlify',
          hours_of_operation: config.ai_config.hours_of_operation || 'Monday-Friday 9am-6pm',
          services_offered: config.ai_config.services_offered || [],
          business_greeting: config.ai_config.business_greeting || '',
          agent_personality: config.ai_config.agent_personality || '',
          call_transfer_message: config.ai_config.call_transfer_message || '',
          voicemail_detection_message: config.ai_config.voicemail_detection_message || '',
          business_type: config.ai_config.business_niche || 'Professional Services',
          business_niche: config.ai_config.business_niche || '',
          capabilities: config.ai_config.capabilities || '',
          service_area: config.ai_config.service_area || 'Greater Toronto Area',
          payment_methods: config.ai_config.payment_methods || 'Credit Card, Cash, E-Transfer',
          warranty_info: config.ai_config.warranty_info || '90-day parts and labor warranty',
          scheduling_rules: config.ai_config.scheduling_rules || 'Same-day service available',
          emergency_hours: config.ai_config.emergency_hours || '24/7 emergency service',
          dynamic_variables: dynamicVariables,
          webhook_url: window.location.origin + '/api/ai-assistant-webhook',
          instructions: generateInstructions(),
          updated_at: new Date().toISOString()
        };

        // Delete existing config first if exists
        await supabase
          .from('ai_dispatcher_configs')
          .delete()
          .eq('phone_number_id', phoneId);

        // Insert new config
        const { error: aiConfigError } = await supabase
          .from('ai_dispatcher_configs')
          .insert(aiConfigData);

        if (aiConfigError) {
          console.error('Error saving AI config:', aiConfigError);
          toast.error('Failed to save AI configuration');
          return;
        }

        // Try to invoke edge function if it exists
        try {
          await supabase.functions.invoke('ai-dispatcher-handler', {
            body: {
              action: 'update_config',
              phoneNumberId: phoneId,
              config: aiConfigData
            }
          });
        } catch (funcError) {
          console.log('Edge function not available, config saved to database');
        }
      } else if (!config.ai_dispatcher_enabled) {
        // If AI is disabled, delete the config
        await supabase
          .from('ai_dispatcher_configs')
          .delete()
          .eq('phone_number_id', phoneId);
      }

      toast.success('Configuration saved successfully');
      await loadPhoneConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const testAIAssistant = async () => {
    toast.info('Test call feature coming soon');
  };
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!config) {
    return (
      <PageLayout>
        <div className="text-center">
          <p>Phone number not found</p>
          <Button onClick={() => navigate('/settings/phone-numbers')} className="mt-4">
            Go Back
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AnimatedContainer animation="fade-in">
          <PageHeader
          title="Configure Phone Number"
          subtitle={formatPhoneNumber(config.phone_number)}
          icon={Phone}
          badges={[
            config.is_primary && { text: "Primary", icon: CheckCircle, variant: "default" },
            config.ai_dispatcher_enabled && { text: "AI Voice", icon: Bot, variant: "success" },
            config.capabilities?.sms && { text: "SMS", icon: MessageSquare, variant: "info" }
          ].filter(Boolean)}
          actionButton={{
            text: "Back to Numbers",
            icon: ChevronLeft,
            onClick: () => navigate('/settings/phone-numbers'),
            variant: "outline"
          }}
        />
      </AnimatedContainer>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="ai-voice">AI Voice Configuration</TabsTrigger>
        </TabsList>        {/* Single AI Voice Tab with all settings */}
        <TabsContent value="ai-voice" className="space-y-4">
          {/* Basic Settings */}
          <ModernCard>
            <CardHeader>
              <CardTitle>Phone Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="friendly-name">Friendly Name</Label>
                <Input
                  id="friendly-name"
                  value={config.friendly_name || ''}
                  onChange={(e) => setConfig({...config, friendly_name: e.target.value})}
                  placeholder="e.g., Main Business Line"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is-active">Active Status</Label>
                <Switch
                  id="is-active"
                  checked={config.is_active}
                  onCheckedChange={(checked) => setConfig({...config, is_active: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is-primary">Set as Primary</Label>
                <Switch
                  id="is-primary"
                  checked={config.is_primary}
                  onCheckedChange={(checked) => setConfig({...config, is_primary: checked})}
                />
              </div>
            </CardContent>
          </ModernCard>

          {/* AI Configuration */}
          <ModernCard>
            <CardHeader>
              <CardTitle>AI Voice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-enabled">Enable AI Dispatcher</Label>
                  <p className="text-sm text-muted-foreground">
                    AI will answer calls and handle customer interactions
                  </p>
                </div>
                <Switch
                  id="ai-enabled"
                  checked={config.ai_dispatcher_enabled}
                  onCheckedChange={(checked) => setConfig({...config, ai_dispatcher_enabled: checked})}
                />
              </div>

              {config.ai_dispatcher_enabled && (
                <div className="pt-4 border-t space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-niche" className="text-base font-medium">Business Niche</Label>
                    <Select
                      value={config.ai_config?.business_niche || ''}
                      onValueChange={(value) => {
                        const niche = businessNiches.find(n => n.dbValue === value);
                        if (niche) {
                          const currentCompany = config.ai_config?.company_name || 'our company';
                          const currentAgent = config.ai_config?.agent_name || 'Sarah';
                          
                          setConfig({
                            ...config,
                            ai_config: {
                              ...config.ai_config,
                              business_niche: value,
                              capabilities: nicheCapabilities[niche.id] || '',
                              services_offered: nicheServices[niche.id]?.split(', ') || [],
                              business_greeting: nicheGreetings[niche.id]
                                ?.replace('{{company_name}}', currentCompany)
                                .replace('{{agent_name}}', currentAgent) || '',
                              agent_personality: nichePersonalities[niche.id] || ''
                            }
                          });
                          toast.success(`Applied ${niche.label} template`);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessNiches.map((niche) => {
                          const Icon = niche.icon;
                          return (
                            <SelectItem key={niche.id} value={niche.dbValue}>
                              <div className="flex items-center gap-2">
                                {Icon && <Icon className="h-4 w-4" />}
                                <span>{niche.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Selecting a niche will auto-populate capabilities and settings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-name" className="text-base font-medium">Agent Name</Label>
                    <Input
                      id="agent-name"
                      className="text-base"
                      value={config.ai_config?.agent_name || 'Sarah'}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, agent_name: e.target.value}
                      })}
                      placeholder="e.g., Sarah"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="text-base font-medium">Company Name</Label>
                    <Input
                      id="company-name"
                      className="text-base"
                      value={config.ai_config?.company_name || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, company_name: e.target.value}
                      })}
                      placeholder="e.g., Fixlify Service"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hours" className="text-base font-medium">Hours of Operation</Label>
                    <Input
                      id="hours"
                      className="text-base"
                      value={config.ai_config?.hours_of_operation || 'Monday-Friday 9am-6pm, Saturday 10am-4pm'}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, hours_of_operation: e.target.value}
                      })}
                      placeholder="e.g., Monday-Friday 9am-6pm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Services Offered</Label>
                    <Textarea
                      className="text-base min-h-[100px] leading-relaxed"
                      value={Array.isArray(config.ai_config?.services_offered) 
                        ? config.ai_config.services_offered.join(', ') 
                        : config.ai_config?.services_offered || ''}
                      onChange={(e) => {
                        // If the value contains commas, split by comma
                        // Otherwise, keep it as a single item with spaces preserved
                        const value = e.target.value;
                        const services = value.includes(',') 
                          ? value.split(',').map(s => s.trim()).filter(s => s)
                          : value.trim() ? [value.trim()] : [];
                        
                        setConfig({
                          ...config,
                          ai_config: {...config.ai_config, services_offered: services}
                        });
                      }}
                      placeholder="e.g., Phone repair, Computer repair, Tablet repair"
                      rows={2}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Separate multiple services with commas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capabilities" className="text-base font-medium">AI Capabilities</Label>
                    <Textarea
                      id="capabilities"
                      className="text-base min-h-[150px] font-mono leading-relaxed"
                      value={config.ai_config?.capabilities || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, capabilities: e.target.value}
                      })}
                      placeholder="List the key capabilities of your AI assistant..."
                      rows={5}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      These capabilities tell the AI what it can help customers with
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="greeting" className="text-base font-medium">Greeting Message (Telnyx Variable)</Label>
                    <Textarea
                      id="greeting"
                      className="text-base min-h-[100px] leading-relaxed"
                      value={config.ai_config?.business_greeting || 'Thank you for calling. How can I help you today?'}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, business_greeting: e.target.value}
                      })}
                      placeholder="Thank you for calling. How can I help you today?"
                      rows={3}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Available Telnyx variables: {`{{agent_name}}, {{company_name}}, {{hours_of_operation}}, {{services_offered}}, {{business_phone}}, {{current_date}}, {{current_time}}, {{greeting}}`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personality" className="text-base font-medium">Agent Personality</Label>
                    <Textarea
                      id="personality"
                      className="text-base min-h-[120px] leading-relaxed"
                      value={config.ai_config?.agent_personality || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, agent_personality: e.target.value}
                      })}
                      placeholder="Describe the personality traits of your AI agent..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="transfer-msg">Call Transfer Message</Label>
                    <Input
                      id="transfer-msg"
                      value={config.ai_config?.call_transfer_message || 'Let me transfer you to a team member who can better assist you. Please hold.'}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, call_transfer_message: e.target.value}
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="voicemail-msg">Voicemail Detection Message</Label>
                    <Input
                      id="voicemail-msg"
                      value={config.ai_config?.voicemail_detection_message || 'Please leave a message after the tone and we will get back to you as soon as possible.'}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, voicemail_detection_message: e.target.value}
                      })}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={testAIAssistant} className="w-full px-6 py-3 text-base font-medium bg-primary hover:bg-primary/90">
                      <TestTube className="h-5 w-5 mr-2" />
                      Test AI Assistant
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </ModernCard>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="mt-8 pb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/settings/phone-numbers')}
            className="flex-1 sm:flex-none px-6 py-3 text-base font-medium"
          >
            Cancel
          </Button>
          
          <Button
            variant="outline"
            onClick={loadPhoneConfig}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-6 py-3 text-base font-medium"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
        </div>
        
        <Button
          onClick={saveConfig}
          disabled={isSaving}
          className="w-full px-6 py-4 text-lg font-semibold bg-primary hover:bg-primary/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
    </PageLayout>
  );
}
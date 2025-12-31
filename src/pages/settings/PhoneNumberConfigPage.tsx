import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Phone, Bot, MessageSquare, PhoneCall, Sparkles,
  ChevronLeft, Save, RefreshCw, Settings2, Zap,
  CheckCircle, Loader2, Users, Clock, PhoneForwarded,
  Voicemail, Star, Building2, User, Mic, FileText,
  Shield, Volume2, Timer, AlignLeft
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
import { cn } from "@/lib/utils";

const ASSISTANT_ID = 'assistant-2a8a396c-e975-4ea5-90bf-3297f1350775';

import { AIAgentTestWidget } from "@/components/settings/ai/AIAgentTestWidget";

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
  call_routing?: {
    ring_timeout_seconds?: number;
    forwarding_number?: string;
    voicemail_enabled?: boolean;
    voicemail_greeting?: string;
    voicemail_voice?: string;
    voicemail_max_length?: number;
    voicemail_transcription?: boolean;
    allowed_roles?: string[];
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
    capabilities?: string;
    additional_info?: string;
  };
}

// Section Header Component
function SectionHeader({
  icon: Icon,
  title,
  description,
  badge,
  action
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  badge?: { text: string; variant?: "default" | "secondary" | "success" | "warning" };
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {badge && (
              <Badge variant={badge.variant || "secondary"} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// Setting Row Component
function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  className
}: {
  icon?: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-4 border-b border-border/50 last:border-0", className)}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && (
          <div className="p-1.5 rounded-lg bg-muted/50 mt-0.5">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// Card Component
function ConfigCard({
  children,
  className,
  highlight
}: {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-2xl border bg-card p-6 transition-all duration-200",
      highlight && "ring-2 ring-primary/20 border-primary/30 bg-gradient-to-br from-primary/[0.02] to-transparent",
      className
    )}>
      {children}
    </div>
  );
}

export default function PhoneNumberConfigPage() {
  const { phoneId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [config, setConfig] = useState<PhoneConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showTestWidget, setShowTestWidget] = useState(false);

  useEffect(() => {
    if (phoneId && user?.id) {
      loadPhoneConfig();
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@telnyx/ai-agent-widget';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [phoneId, user?.id]);

  const loadPhoneConfig = async () => {
    if (!phoneId || !user?.id) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User must belong to an organization');
      }

      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('id', phoneId)
        .eq('organization_id', profile.organization_id)
        .single();

      if (error) throw error;

      if (data) {
        let configData: PhoneConfig = data;

        if (data.ai_dispatcher_enabled) {
          const { data: aiConfig } = await supabase
            .from('ai_dispatcher_configs')
            .select('*')
            .eq('phone_number_id', phoneId)
            .single();

          if (aiConfig) {
            let services = aiConfig.services_offered;
            if (typeof services === 'string') {
              try {
                services = JSON.parse(services);
              } catch {
                services = services.split(',').map(s => s.trim());
              }
            }

            configData.ai_config = {
              ...aiConfig,
              assistant_id: ASSISTANT_ID,
              services_offered: Array.isArray(services) ? services : [],
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

        const { data: profileData } = await supabase
          .from('profiles')
          .select('company_name, business_niche')
          .eq('id', user.id)
          .single();

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

  const generateInstructions = () => {
    if (!config?.ai_config) return '';

    const capabilities = config.ai_config.capabilities || `1. Check repair status
2. Book appointments
3. Provide repair quotes
4. Answer service questions
5. Transfer to human agent when needed
6. Look up client information
7. Review service history`;

    const instructions = `You are {{agent_name}} for {{company_name}}, a professional AI assistant and booking specialist.

## Business Context
- Company: {{company_name}}
- Type: {{business_niche}}
- Hours: {{hours_of_operation}}
- Services: {{services_offered}}
- Phone: {{business_phone}}
- Current: {{current_date}} {{current_time}} {{day_of_week}}

## Your Primary Goal
Convert calls into booked appointments using proven sales techniques:
- Create urgency ("We have one slot left today")
- Use social proof ("Many neighbors in your area use us")
- Highlight pain points ("This issue often gets worse if not addressed")
- Offer limited-time incentives ("I can offer 10% off if you book now")
- Use scarcity ("Our schedule fills up quickly")
- Build trust through expertise and empathy

## Your Capabilities
${capabilities}

## Additional Information
{{additional_info}}

## Client Handling
Check caller status: {{customer_status}}

If existing client ({{is_existing_customer}} = 'true'):
- Name: {{customer_name}}
- History: {{customer_history}}
- Last visit: {{last_service_date}}
- Balance: {{outstanding_balance}}
- Greet by name and reference their positive history
- Use their past satisfaction as social proof
- Remind them why they chose us before

If new client:
- Welcome warmly and build rapport quickly
- Emphasize first-time customer benefits
- Create FOMO about introductory offers
- Collect name and contact information
- Explain our unique value proposition

## Conversion Tactics
- Always assume they want to book
- Offer specific appointment times ("I have 2pm or 4pm today")
- Handle objections by focusing on benefits
- Use "yes ladder" technique (small agreements leading to booking)
- Apply assumptive close ("I'll put you down for 2pm")
- If hesitant, offer to "hold a spot" while they decide

## Communication Style
- Confident and solution-focused
- Create emotional connection to their problem
- Professional yet persuasive
- Show expertise without being pushy
- Transfer only if absolutely necessary`;

    return instructions;
  };

  const saveConfig = async () => {
    if (!config || !phoneId) return;

    setIsSaving(true);
    try {
      const finalInstructions = config.ai_config?.instructions || generateInstructions();
      const isActive = true;

      const { error: phoneError } = await supabase
        .from('phone_numbers')
        .update({
          friendly_name: config.friendly_name,
          is_active: isActive,
          is_primary: config.is_primary,
          ai_dispatcher_enabled: config.ai_dispatcher_enabled,
          call_routing: {
            ring_timeout_seconds: config.call_routing?.ring_timeout_seconds || 30,
            forwarding_number: config.call_routing?.forwarding_number || null,
            voicemail_enabled: config.call_routing?.voicemail_enabled ?? true,
            voicemail_greeting: config.call_routing?.voicemail_greeting ||
              'Sorry, we cannot take your call right now. Please leave a message after the beep and we will get back to you as soon as possible.',
            voicemail_voice: config.call_routing?.voicemail_voice || 'Telnyx.NaturalHD.andersen_johan',
            voicemail_max_length: config.call_routing?.voicemail_max_length || 120,
            voicemail_transcription: config.call_routing?.voicemail_transcription ?? true,
            allowed_roles: config.call_routing?.allowed_roles || ['admin', 'owner', 'dispatcher']
          },
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

        const aiConfigData = {
          phone_number_id: phoneId,
          assistant_id: ASSISTANT_ID,
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
          additional_info: config.ai_config.additional_info || '',
          service_area: config.ai_config.service_area || 'Greater Toronto Area',
          payment_methods: config.ai_config.payment_methods || 'Credit Card, Cash, E-Transfer',
          warranty_info: config.ai_config.warranty_info || '90-day parts and labor warranty',
          scheduling_rules: config.ai_config.scheduling_rules || 'Same-day service available',
          emergency_hours: config.ai_config.emergency_hours || '24/7 emergency service',
          dynamic_variables: dynamicVariables,
          webhook_url: window.location.origin + '/api/ai-assistant-webhook',
          instructions: finalInstructions,
          updated_at: new Date().toISOString()
        };

        await supabase
          .from('ai_dispatcher_configs')
          .delete()
          .eq('phone_number_id', phoneId);

        const { error: aiConfigError } = await supabase
          .from('ai_dispatcher_configs')
          .insert(aiConfigData);

        if (aiConfigError) {
          console.error('Error saving AI config:', aiConfigError);
          toast.error('Failed to save AI configuration');
          return;
        }

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

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Phone className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-muted-foreground">Loading configuration...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!config) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <Phone className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Phone Number Not Found</h2>
          <p className="text-muted-foreground">The phone number you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/settings/phone-numbers')} className="mt-2">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Phone Numbers
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/settings/phone-numbers')}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Phone Numbers
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Phone className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {formatPhoneNumber(config.phone_number)}
                </h1>
                <div className="flex items-center gap-2">
                  {config.is_primary && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </Badge>
                  )}
                  {config.ai_dispatcher_enabled && (
                    <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Voice
                    </Badge>
                  )}
                  {config.capabilities?.sms && (
                    <Badge variant="outline" className="text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      SMS
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground mt-1">
                {config.friendly_name || 'Configure your phone number settings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPhoneConfig}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Configuration */}
        <ConfigCard>
          <SectionHeader
            icon={Settings2}
            title="Phone Configuration"
            description="Basic settings for this phone number"
          />

          <div className="space-y-1">
            <SettingRow
              icon={AlignLeft}
              label="Friendly Name"
              description="A memorable name for this number"
            >
              <Input
                value={config.friendly_name || ''}
                onChange={(e) => setConfig({...config, friendly_name: e.target.value})}
                placeholder="Main Business Line"
                className="w-[240px]"
              />
            </SettingRow>

            <SettingRow
              icon={Star}
              label="Primary Number"
              description="Use as default for outgoing calls"
            >
              <Switch
                checked={config.is_primary}
                onCheckedChange={(checked) => setConfig({...config, is_primary: checked})}
              />
            </SettingRow>
          </div>
        </ConfigCard>

        {/* AI Voice Mode Toggle */}
        <ConfigCard highlight={config.ai_dispatcher_enabled}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2.5 rounded-xl transition-colors",
                config.ai_dispatcher_enabled
                  ? "bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20"
                  : "bg-muted/50 border border-border"
              )}>
                <Bot className={cn(
                  "h-5 w-5",
                  config.ai_dispatcher_enabled ? "text-violet-600" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">AI Voice Assistant</h3>
                  {config.ai_dispatcher_enabled && (
                    <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  AI will automatically answer and handle customer calls
                </p>
              </div>
            </div>
            <Switch
              checked={config.ai_dispatcher_enabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  setConfig({...config, ai_dispatcher_enabled: true, is_active: true});
                } else {
                  setConfig({...config, ai_dispatcher_enabled: false});
                }
              }}
            />
          </div>
        </ConfigCard>

        {/* AI Configuration (when enabled) */}
        {config.ai_dispatcher_enabled && (
          <>
            {/* Business Profile */}
            <ConfigCard>
              <SectionHeader
                icon={Building2}
                title="Business Profile"
                description="Tell your AI assistant about your business"
              />

              <div className="grid gap-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      Business Type
                    </Label>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessNiches.map((niche) => {
                          const Icon = niche.icon;
                          return (
                            <SelectItem key={niche.id} value={niche.dbValue}>
                              <div className="flex items-center gap-2">
                                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                <span>{niche.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Auto-fills settings based on your industry
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Company Name</Label>
                    <Input
                      value={config.ai_config?.company_name || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, company_name: e.target.value}
                      })}
                      placeholder="Fixlify Service"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-blue-500" />
                      AI Agent Name
                    </Label>
                    <Input
                      value={config.ai_config?.agent_name || 'Sarah'}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, agent_name: e.target.value}
                      })}
                      placeholder="Sarah"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-emerald-500" />
                      Hours of Operation
                    </Label>
                    <Input
                      value={config.ai_config?.hours_of_operation || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, hours_of_operation: e.target.value}
                      })}
                      placeholder="Mon-Fri 9am-6pm, Sat 10am-4pm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Services Offered</Label>
                  <Textarea
                    value={Array.isArray(config.ai_config?.services_offered)
                      ? config.ai_config.services_offered.join(', ')
                      : config.ai_config?.services_offered || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const services = value.includes(',')
                        ? value.split(',').map(s => s.trim()).filter(s => s)
                        : value.trim() ? [value.trim()] : [];

                      setConfig({
                        ...config,
                        ai_config: {...config.ai_config, services_offered: services}
                      });
                    }}
                    placeholder="Phone repair, Screen replacement, Battery service"
                    className="resize-none"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple services with commas
                  </p>
                </div>
              </div>
            </ConfigCard>

            {/* AI Behavior */}
            <ConfigCard>
              <SectionHeader
                icon={Sparkles}
                title="AI Behavior"
                description="Customize how your AI assistant interacts with callers"
              />

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Mic className="h-3.5 w-3.5 text-rose-500" />
                    Greeting Message
                  </Label>
                  <Textarea
                    value={config.ai_config?.business_greeting || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      ai_config: {...config.ai_config, business_greeting: e.target.value}
                    })}
                    placeholder="Thank you for calling {{company_name}}. This is {{agent_name}}, how can I help you today?"
                    className="resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables: {`{{agent_name}}, {{company_name}}, {{hours_of_operation}}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">AI Capabilities</Label>
                  <Textarea
                    value={config.ai_config?.capabilities || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      ai_config: {...config.ai_config, capabilities: e.target.value}
                    })}
                    placeholder="List what your AI can help with..."
                    className="resize-none font-mono text-sm"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-cyan-500" />
                    Additional Information
                  </Label>
                  <Textarea
                    value={config.ai_config?.additional_info || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      ai_config: {...config.ai_config, additional_info: e.target.value}
                    })}
                    placeholder="Pricing, policies, warranties, promotions..."
                    className="resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    e.g., Service call $89 • Senior discount 10% • 90-day warranty
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Agent Personality</Label>
                  <Textarea
                    value={config.ai_config?.agent_personality || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      ai_config: {...config.ai_config, agent_personality: e.target.value}
                    })}
                    placeholder="Describe the tone and personality..."
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <input
                  type="hidden"
                  value={config.ai_config?.instructions || generateInstructions()}
                />

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Call Transfer Message</Label>
                    <Input
                      value={config.ai_config?.call_transfer_message || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, call_transfer_message: e.target.value}
                      })}
                      placeholder="Let me transfer you to a team member..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Voicemail Detection</Label>
                    <Input
                      value={config.ai_config?.voicemail_detection_message || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        ai_config: {...config.ai_config, voicemail_detection_message: e.target.value}
                      })}
                      placeholder="Please leave a message..."
                    />
                  </div>
                </div>
              </div>
            </ConfigCard>

            {/* Test AI */}
            <ConfigCard className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200/50 dark:border-violet-800/30">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                    <PhoneCall className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Test Your AI Assistant</h3>
                    <p className="text-sm text-muted-foreground">
                      Make a test call to hear how your AI sounds
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowTestWidget(true)}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Start Test Call
                </Button>
              </div>
            </ConfigCard>
          </>
        )}

        {/* Live Call Routing (when AI is OFF) */}
        {!config.ai_dispatcher_enabled && (
          <>
            {/* Call Routing */}
            <ConfigCard>
              <SectionHeader
                icon={PhoneCall}
                title="Call Routing"
                description="How incoming calls are handled without AI"
              />

              <div className="space-y-1">
                <SettingRow
                  icon={Timer}
                  label="Ring Timeout"
                  description="Seconds before going to voicemail"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={10}
                      max={120}
                      value={config.call_routing?.ring_timeout_seconds || 30}
                      onChange={(e) => setConfig({
                        ...config,
                        call_routing: {
                          ...config.call_routing,
                          ring_timeout_seconds: parseInt(e.target.value) || 30
                        }
                      })}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-muted-foreground">sec</span>
                  </div>
                </SettingRow>

                <SettingRow
                  icon={PhoneForwarded}
                  label="Forwarding Number"
                  description="Forward if no one answers in browser"
                >
                  <Input
                    type="tel"
                    value={config.call_routing?.forwarding_number || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      call_routing: {
                        ...config.call_routing,
                        forwarding_number: e.target.value
                      }
                    })}
                    placeholder="+1 (555) 123-4567"
                    className="w-[200px]"
                  />
                </SettingRow>
              </div>
            </ConfigCard>

            {/* Voicemail Settings */}
            <ConfigCard>
              <SectionHeader
                icon={Voicemail}
                title="Voicemail"
                description="Configure voicemail for missed calls"
                action={
                  <Switch
                    checked={config.call_routing?.voicemail_enabled ?? true}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      call_routing: {
                        ...config.call_routing,
                        voicemail_enabled: checked
                      }
                    })}
                  />
                }
              />

              {(config.call_routing?.voicemail_enabled ?? true) && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Volume2 className="h-3.5 w-3.5 text-blue-500" />
                      Voice Selection
                    </Label>
                    <Select
                      value={config.call_routing?.voicemail_voice || 'Telnyx.NaturalHD.andersen_johan'}
                      onValueChange={(value) => setConfig({
                        ...config,
                        call_routing: {
                          ...config.call_routing,
                          voicemail_voice: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Telnyx.NaturalHD.andersen_johan">
                          Johan (Telnyx NaturalHD) - Best Quality
                        </SelectItem>
                        <SelectItem value="Telnyx.Natural.abbie">
                          Abbie (Telnyx Natural)
                        </SelectItem>
                        <SelectItem value="Polly.Matthew-Neural">
                          Matthew (AWS Neural - Male)
                        </SelectItem>
                        <SelectItem value="Polly.Joanna-Neural">
                          Joanna (AWS Neural - Female)
                        </SelectItem>
                        <SelectItem value="Polly.Amy-Neural">
                          Amy (AWS Neural - British Female)
                        </SelectItem>
                        <SelectItem value="Polly.Brian-Neural">
                          Brian (AWS Neural - British Male)
                        </SelectItem>
                        <SelectItem value="Azure.en-US-JennyNeural">
                          Jenny (Azure Neural - Female)
                        </SelectItem>
                        <SelectItem value="Azure.en-US-GuyNeural">
                          Guy (Azure Neural - Male)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Greeting Message</Label>
                    <Textarea
                      value={config.call_routing?.voicemail_greeting || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        call_routing: {
                          ...config.call_routing,
                          voicemail_greeting: e.target.value
                        }
                      })}
                      placeholder="Sorry, we cannot take your call right now..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Max Recording Length</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={30}
                          max={300}
                          value={config.call_routing?.voicemail_max_length || 120}
                          onChange={(e) => setConfig({
                            ...config,
                            call_routing: {
                              ...config.call_routing,
                              voicemail_max_length: parseInt(e.target.value) || 120
                            }
                          })}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">seconds</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                      <div>
                        <Label className="text-sm font-medium">Transcription</Label>
                        <p className="text-xs text-muted-foreground">Convert to text</p>
                      </div>
                      <Switch
                        checked={config.call_routing?.voicemail_transcription ?? true}
                        onCheckedChange={(checked) => setConfig({
                          ...config,
                          call_routing: {
                            ...config.call_routing,
                            voicemail_transcription: checked
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </ConfigCard>

            {/* Who Can Answer */}
            <ConfigCard>
              <SectionHeader
                icon={Users}
                title="Call Permissions"
                description="Who can receive and answer incoming calls"
              />

              <div className="space-y-3">
                {[
                  { value: 'admin', label: 'Admin', icon: Shield, description: 'Full system access', color: 'text-red-500' },
                  { value: 'owner', label: 'Owner', icon: Building2, description: 'Business management', color: 'text-amber-500' },
                  { value: 'dispatcher', label: 'Dispatcher', icon: PhoneCall, description: 'Calls & scheduling', color: 'text-blue-500' }
                ].map((role) => (
                  <div
                    key={role.value}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-colors",
                      config.call_routing?.allowed_roles?.includes(role.value)
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background">
                        <role.icon className={cn("h-4 w-4", role.color)} />
                      </div>
                      <div>
                        <p className="font-medium">{role.label}</p>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.call_routing?.allowed_roles?.includes(role.value) ??
                        ['admin', 'owner', 'dispatcher'].includes(role.value)}
                      onCheckedChange={(checked) => {
                        const currentRoles = config.call_routing?.allowed_roles || ['admin', 'owner', 'dispatcher'];
                        const newRoles = checked
                          ? [...currentRoles, role.value]
                          : currentRoles.filter(r => r !== role.value);
                        setConfig({
                          ...config,
                          call_routing: {
                            ...config.call_routing,
                            allowed_roles: newRoles
                          }
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </ConfigCard>

            {/* Info Box */}
            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <PhoneCall className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">How Live Calls Work</h4>
                  <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Incoming calls ring to all eligible users in browser
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      First person to answer takes the call
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Transfer to AI or another team member anytime
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      Full call controls: mute, hold, record, transfer
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-4 pb-6 -mx-4 px-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/settings/phone-numbers')}
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={saveConfig}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
              size="lg"
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
      </div>

      <AIAgentTestWidget
        open={showTestWidget}
        onClose={() => setShowTestWidget(false)}
      />
    </PageLayout>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Phone, 
  Settings,
  ArrowLeft,
  Bot,
  Mic,
  Save,
  Loader2,
  Volume2,
  MessageSquare,
  PhoneCall,
  AlertCircle,
  CheckCircle,
  Wifi
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { formatPhoneNumber } from "@/utils/phone-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PhoneNumberConfig {
  id: string;
  phone_number: string;
  friendly_name?: string;
  ai_dispatcher_enabled: boolean;
  ai_voice_settings?: {
    voice: string;
    language: string;
    speed: number;
    pitch: number;
    greeting_message?: string;
    voicemail_message?: string;
    call_transfer_message?: string;
    hold_music_url?: string;
    max_call_duration?: number;
    record_calls?: boolean;
    transcribe_calls?: boolean;
  };
  sms_settings?: {
    auto_reply_enabled: boolean;
    auto_reply_message?: string;
    forward_to_email?: boolean;
    forward_email?: string;
  };
  webhook_settings?: {
    webhook_url?: string;
    webhook_events?: string[];
  };
  telnyx_settings?: {
    telnyx_app_id?: string;
    voice_profile_id?: string;
    messaging_profile_id?: string;
    connection_id?: string;
  };
}

const AVAILABLE_VOICES = [
  { id: 'alloy', name: 'Alloy', gender: 'neutral', description: 'Balanced and versatile' },
  { id: 'echo', name: 'Echo', gender: 'male', description: 'Warm and conversational' },
  { id: 'fable', name: 'Fable', gender: 'neutral', description: 'Expressive and dynamic' },
  { id: 'onyx', name: 'Onyx', gender: 'male', description: 'Deep and authoritative' },
  { id: 'nova', name: 'Nova', gender: 'female', description: 'Energetic and bright' },
  { id: 'shimmer', name: 'Shimmer', gender: 'female', description: 'Soft and pleasant' }
];

const AVAILABLE_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)' },
  { code: 'ja-JP', name: 'Japanese' }
];

export default function PhoneNumberConfigPage() {
  const { phoneId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [config, setConfig] = useState<PhoneNumberConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Load phone number configuration
  useEffect(() => {
    loadPhoneConfig();
  }, [phoneId, user]);

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

      setConfig({
        ...data,
        ai_voice_settings: data.ai_voice_settings || {
          voice: 'alloy',
          language: 'en-US',
          speed: 1.0,
          pitch: 1.0,
          greeting_message: 'Hello, how can I help you today?',
          voicemail_message: 'Please leave a message after the tone.',
          call_transfer_message: 'Please hold while I transfer your call.',
          max_call_duration: 3600,
          record_calls: false,
          transcribe_calls: true
        },
        sms_settings: data.sms_settings || {
          auto_reply_enabled: false,
          auto_reply_message: '',
          forward_to_email: false,
          forward_email: ''
        },
        webhook_settings: data.webhook_settings || {
          webhook_url: '',
          webhook_events: []
        },
        telnyx_settings: data.telnyx_settings || {
          messaging_profile_id: '400197fa-ac3b-4052-8c14-6da54bf7e800',
          connection_id: '2709100729850660858'
        }
      });
    } catch (error) {
      console.error('Error loading phone config:', error);
      toast.error('Failed to load phone number configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config || !phoneId || !user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('phone_numbers')
        .update({
          friendly_name: config.friendly_name,
          ai_dispatcher_enabled: config.ai_dispatcher_enabled,
          ai_voice_settings: config.ai_voice_settings,
          sms_settings: config.sms_settings,
          webhook_settings: config.webhook_settings,
          telnyx_settings: config.telnyx_settings
        })
        .eq('id', phoneId)
        .eq('user_id', user.id);

      if (error) throw error;

      // If AI is enabled, try to assign to TeXML voice app
      if (config.ai_dispatcher_enabled) {
        await assignToVoiceApp();
      }

      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const assignToVoiceApp = async () => {
    if (!config) return;

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'telnyx-voice-config',
        {
          body: {
            action: 'assign_to_voice_app',
            phoneNumber: config.phone_number,
            settings: config.ai_voice_settings
          }
        }
      );

      if (functionError) throw functionError;
      
      if (functionData?.success) {
        toast.success('Phone number assigned to AI voice app');
      } else {
        toast.warning('Could not assign to voice app. Number may be assigned to another profile.');
      }
    } catch (error) {
      console.error('Error assigning to voice app:', error);
    }
  };

  const testVoice = async () => {
    if (!config) return;

    setIsTestingVoice(true);
    try {
      // Play a sample of the selected voice
      const utterance = new SpeechSynthesisUtterance(
        config.ai_voice_settings?.greeting_message || 'Hello, this is a test of the AI voice.'
      );
      utterance.rate = config.ai_voice_settings?.speed || 1.0;
      utterance.pitch = config.ai_voice_settings?.pitch || 1.0;
      
      window.speechSynthesis.speak(utterance);
      toast.success('Playing voice sample');
    } catch (error) {
      console.error('Error testing voice:', error);
      toast.error('Failed to play voice sample');
    } finally {
      setIsTestingVoice(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!config) {
    return (
      <PageLayout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Phone number not found or you don't have permission to configure it.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Configure Phone Number"
          subtitle={`Settings for ${formatPhoneNumber(config.phone_number)}`}
          icon={Settings}
          badges={[
            { text: "AI Voice", icon: Bot, variant: "fixlyfy" },
            { text: "SMS", icon: MessageSquare, variant: "success" },
            { text: "Telnyx", icon: Wifi, variant: "info" }
          ]}
          actionButton={{
            text: "Back to Numbers",
            icon: ArrowLeft,
            onClick: () => navigate('/settings/phone-numbers')
          }}
        />
      </AnimatedContainer>

      <AnimatedContainer animation="slide-up" delay={200}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="ai-voice">AI Voice</TabsTrigger>
            <TabsTrigger value="sms">SMS Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <ModernCard>
              <CardContent className="p-6 space-y-4">
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
                  <div>
                    <Label htmlFor="ai-enabled">AI Dispatcher</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI to handle calls and messages
                    </p>
                  </div>
                  <Switch
                    id="ai-enabled"
                    checked={config.ai_dispatcher_enabled}
                    onCheckedChange={(checked) => 
                      setConfig({...config, ai_dispatcher_enabled: checked})
                    }
                  />
                </div>

                {config.ai_dispatcher_enabled && (
                  <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertDescription>
                      AI Dispatcher will answer calls, transcribe conversations, and can transfer calls to team members.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </ModernCard>
          </TabsContent>

          <TabsContent value="ai-voice" className="space-y-6">
            <ModernCard>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voice">AI Voice</Label>
                    <Select
                      value={config.ai_voice_settings?.voice}
                      onValueChange={(value) => 
                        setConfig({
                          ...config,
                          ai_voice_settings: {...config.ai_voice_settings!, voice: value}
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_VOICES.map(voice => (
                          <SelectItem key={voice.id} value={voice.id}>
                            <div>
                              <div className="font-medium">{voice.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {voice.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={config.ai_voice_settings?.language}
                      onValueChange={(value) => 
                        setConfig({
                          ...config,
                          ai_voice_settings: {...config.ai_voice_settings!, language: value}
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_LANGUAGES.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="speed">Speed ({config.ai_voice_settings?.speed}x)</Label>
                    <Input
                      id="speed"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={config.ai_voice_settings?.speed}
                      onChange={(e) => 
                        setConfig({
                          ...config,
                          ai_voice_settings: {
                            ...config.ai_voice_settings!, 
                            speed: parseFloat(e.target.value)
                          }
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="pitch">Pitch ({config.ai_voice_settings?.pitch})</Label>
                    <Input
                      id="pitch"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={config.ai_voice_settings?.pitch}
                      onChange={(e) => 
                        setConfig({
                          ...config,
                          ai_voice_settings: {
                            ...config.ai_voice_settings!, 
                            pitch: parseFloat(e.target.value)
                          }
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="greeting">Greeting Message</Label>
                  <Textarea
                    id="greeting"
                    value={config.ai_voice_settings?.greeting_message}
                    onChange={(e) => 
                      setConfig({
                        ...config,
                        ai_voice_settings: {
                          ...config.ai_voice_settings!, 
                          greeting_message: e.target.value
                        }
                      })
                    }
                    placeholder="Hello, thank you for calling..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="voicemail">Voicemail Message</Label>
                  <Textarea
                    id="voicemail"
                    value={config.ai_voice_settings?.voicemail_message}
                    onChange={(e) => 
                      setConfig({
                        ...config,
                        ai_voice_settings: {
                          ...config.ai_voice_settings!, 
                          voicemail_message: e.target.value
                        }
                      })
                    }
                    placeholder="We're unable to take your call..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={testVoice}
                    disabled={isTestingVoice}
                  >
                    {isTestingVoice ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Volume2 className="h-4 w-4 mr-2" />
                    )}
                    Test Voice
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="record-calls"
                      checked={config.ai_voice_settings?.record_calls}
                      onCheckedChange={(checked) => 
                        setConfig({
                          ...config,
                          ai_voice_settings: {
                            ...config.ai_voice_settings!, 
                            record_calls: checked
                          }
                        })
                      }
                    />
                    <Label htmlFor="record-calls">Record Calls</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="transcribe-calls"
                      checked={config.ai_voice_settings?.transcribe_calls}
                      onCheckedChange={(checked) => 
                        setConfig({
                          ...config,
                          ai_voice_settings: {
                            ...config.ai_voice_settings!, 
                            transcribe_calls: checked
                          }
                        })
                      }
                    />
                    <Label htmlFor="transcribe-calls">Transcribe Calls</Label>
                  </div>
                </div>
              </CardContent>
            </ModernCard>
          </TabsContent>

          <TabsContent value="sms" className="space-y-6">
            <ModernCard>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-reply">Auto Reply</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically reply to incoming SMS
                    </p>
                  </div>
                  <Switch
                    id="auto-reply"
                    checked={config.sms_settings?.auto_reply_enabled}
                    onCheckedChange={(checked) => 
                      setConfig({
                        ...config,
                        sms_settings: {
                          ...config.sms_settings!, 
                          auto_reply_enabled: checked
                        }
                      })
                    }
                  />
                </div>

                {config.sms_settings?.auto_reply_enabled && (
                  <div>
                    <Label htmlFor="auto-reply-message">Auto Reply Message</Label>
                    <Textarea
                      id="auto-reply-message"
                      value={config.sms_settings?.auto_reply_message}
                      onChange={(e) => 
                        setConfig({
                          ...config,
                          sms_settings: {
                            ...config.sms_settings!, 
                            auto_reply_message: e.target.value
                          }
                        })
                      }
                      placeholder="Thanks for your message. We'll get back to you soon!"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="forward-email">Forward to Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Forward SMS messages to email
                    </p>
                  </div>
                  <Switch
                    id="forward-email"
                    checked={config.sms_settings?.forward_to_email}
                    onCheckedChange={(checked) => 
                      setConfig({
                        ...config,
                        sms_settings: {
                          ...config.sms_settings!, 
                          forward_to_email: checked
                        }
                      })
                    }
                  />
                </div>

                {config.sms_settings?.forward_to_email && (
                  <div>
                    <Label htmlFor="forward-email-address">Forward Email Address</Label>
                    <Input
                      id="forward-email-address"
                      type="email"
                      value={config.sms_settings?.forward_email}
                      onChange={(e) => 
                        setConfig({
                          ...config,
                          sms_settings: {
                            ...config.sms_settings!, 
                            forward_email: e.target.value
                          }
                        })
                      }
                      placeholder="admin@example.com"
                    />
                  </div>
                )}
              </CardContent>
            </ModernCard>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <ModernCard>
              <CardContent className="p-6 space-y-4">
                <Alert>
                  <Wifi className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Telnyx Integration</strong><br/>
                    This number is connected to Telnyx messaging profile: {config.telnyx_settings?.messaging_profile_id}
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    value={config.webhook_settings?.webhook_url}
                    onChange={(e) => 
                      setConfig({
                        ...config,
                        webhook_settings: {
                          ...config.webhook_settings!, 
                          webhook_url: e.target.value
                        }
                      })
                    }
                    placeholder="https://your-domain.com/webhook"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Receive real-time events for calls and messages
                  </p>
                </div>

                <div>
                  <Label>Webhook Events</Label>
                  <div className="space-y-2 mt-2">
                    {['call.initiated', 'call.answered', 'call.ended', 'sms.received', 'sms.sent'].map(event => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch
                          id={event}
                          checked={config.webhook_settings?.webhook_events?.includes(event)}
                          onCheckedChange={(checked) => {
                            const events = config.webhook_settings?.webhook_events || [];
                            if (checked) {
                              setConfig({
                                ...config,
                                webhook_settings: {
                                  ...config.webhook_settings!,
                                  webhook_events: [...events, event]
                                }
                              });
                            } else {
                              setConfig({
                                ...config,
                                webhook_settings: {
                                  ...config.webhook_settings!,
                                  webhook_events: events.filter(e => e !== event)
                                }
                              });
                            }
                          }}
                        />
                        <Label htmlFor={event}>{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="max-duration">Max Call Duration (seconds)</Label>
                  <Input
                    id="max-duration"
                    type="number"
                    value={config.ai_voice_settings?.max_call_duration}
                    onChange={(e) => 
                      setConfig({
                        ...config,
                        ai_voice_settings: {
                          ...config.ai_voice_settings!, 
                          max_call_duration: parseInt(e.target.value)
                        }
                      })
                    }
                    placeholder="3600"
                  />
                </div>
              </CardContent>
            </ModernCard>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/settings/phone-numbers')}
          >
            Cancel
          </Button>
          <Button
            onClick={saveConfig}
            disabled={isSaving}
            className="bg-fixlyfy hover:bg-fixlyfy/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </AnimatedContainer>
    </PageLayout>
  );
}
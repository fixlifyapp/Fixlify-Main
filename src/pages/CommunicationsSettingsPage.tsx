import React, { useState, useEffect } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, Bot, Settings, Zap, MessageSquare, Save, TestTube, 
  Plus, Trash2, Calendar, User, Volume2, Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, useSearchParams } from 'react-router-dom';
import { UnifiedCallManager } from '@/components/calling/UnifiedCallManager';
import { CallHistory } from '@/components/calling/CallHistory';

interface PhoneNumber {
  id: string;
  phone_number: string;
  status: string;
  ai_dispatcher_enabled: boolean;
  connection_id: string;
  webhook_url: string;
}

interface AISettings {
  greeting_message: string;
  business_name: string;
  business_hours: string;
  appointment_booking_enabled: boolean;
  custom_prompt: string;
  voice_settings: {
    voice_id: string;
    language: string;
    speaking_rate: number;
  };
  sms_auto_response_enabled: boolean;
  sms_response_template: string;
}

const CommunicationsSettingsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("phone-numbers");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber | null>(null);
  const [defaultToNumber, setDefaultToNumber] = useState<string>('');
  const [defaultClientId, setDefaultClientId] = useState<string>('');
  const [defaultClientName, setDefaultClientName] = useState<string>('');
  const [aiSettings, setAiSettings] = useState<AISettings>({
    greeting_message: "Hello, thank you for calling {business_name}. How can I help you today?",
    business_name: "",
    business_hours: "Monday-Friday 9AM-5PM",
    appointment_booking_enabled: true,
    custom_prompt: "",
    voice_settings: {
      voice_id: "rachel",
      language: "en-US",
      speaking_rate: 1.0
    },
    sms_auto_response_enabled: true,
    sms_response_template: "Thanks for your message! We'll get back to you shortly."
  });

  // Handle URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    const phoneNumber = searchParams.get('phoneNumber');
    const clientId = searchParams.get('clientId');
    const clientName = searchParams.get('clientName');

    if (tab && ['phone-numbers', 'ai-settings', 'dialer', 'call-history'].includes(tab)) {
      setActiveTab(tab);
    }

    if (phoneNumber) {
      setDefaultToNumber(phoneNumber);
    }

    if (clientId) {
      setDefaultClientId(clientId);
    }

    if (clientName) {
      setDefaultClientName(clientName);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load phone numbers
      const { data: numbersData, error: numbersError } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('status', 'owned')
        .order('created_at', { ascending: false });

      if (numbersError) throw numbersError;
      
      setPhoneNumbers(numbersData || []);
      if (numbersData && numbersData.length > 0) {
        setSelectedPhoneNumber(numbersData[0]);
      }

      // Load AI settings
      const { data: aiData, error: aiError } = await supabase
        .from('ai_dispatcher_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (aiError && aiError.code !== 'PGRST116') {
        throw aiError;
      }

      if (aiData) {
        setAiSettings(aiData.settings);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleAiDispatcher = async (phoneNumber: PhoneNumber) => {
    const newStatus = !phoneNumber.ai_dispatcher_enabled;
    
    try {
      const { data, error } = await supabase.functions.invoke('manage-ai-dispatcher', {
        body: {
          action: newStatus ? 'enable' : 'disable',
          phoneNumber: phoneNumber.phone_number
        }
      });

      if (error) throw error;

      // Update local state
      setPhoneNumbers(prev => prev.map(num => 
        num.id === phoneNumber.id 
          ? { ...num, ai_dispatcher_enabled: newStatus }
          : num
      ));

      toast.success(
        newStatus 
          ? 'AI Dispatcher enabled for ' + formatPhoneNumber(phoneNumber.phone_number)
          : 'AI Dispatcher disabled for ' + formatPhoneNumber(phoneNumber.phone_number)
      );
    } catch (error) {
      console.error('Error toggling AI dispatcher:', error);
      toast.error('Failed to update AI dispatcher settings');
    }
  };

  const saveAiSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_dispatcher_configs')
        .upsert({
          user_id: user.id,
          settings: aiSettings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('AI settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      toast.info('Testing Telnyx connection...');
      
      const { data, error } = await supabase.functions.invoke('test-telnyx-connection');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(data.message);
      } else {
        throw new Error(data?.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error(error instanceof Error ? error.message : 'Connection test failed');
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return 'Unknown';
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phoneNumber;
  };

  const updateAiSetting = (key: keyof AISettings, value: any) => {
    setAiSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateVoiceSetting = (key: keyof typeof aiSettings.voice_settings, value: any) => {
    setAiSettings(prev => ({
      ...prev,
      voice_settings: {
        ...prev.voice_settings,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading communications settings...</p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Communications Settings"
        subtitle="Manage phone numbers, AI dispatcher, and calling preferences"
        icon={Phone}
        badges={[
          { text: "Telnyx Integration", icon: Zap, variant: "fixlyfy" },
          { text: "AI Dispatcher", icon: Bot, variant: "success" },
          { text: "Voice & SMS", icon: MessageSquare, variant: "info" }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phone-numbers">Phone Numbers</TabsTrigger>
          <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
          <TabsTrigger value="dialer">Dialer</TabsTrigger>
          <TabsTrigger value="call-history">Call History</TabsTrigger>
        </TabsList>

        <TabsContent value="phone-numbers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Numbers
                </span>
                <Button onClick={testConnection} variant="outline" size="sm" className="gap-2">
                  <TestTube className="h-4 w-4" />
                  Test Connection
                </Button>
              </CardTitle>
              <CardDescription>
                Manage your Telnyx phone numbers and AI dispatcher settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {phoneNumbers.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No phone numbers configured</p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Phone Number
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {phoneNumbers.map((number) => (
                    <div key={number.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">
                              {formatPhoneNumber(number.phone_number)}
                            </h3>
                            <Badge variant={number.status === 'owned' ? 'default' : 'secondary'}>
                              {number.status}
                            </Badge>
                            {number.ai_dispatcher_enabled && (
                              <Badge variant="outline" className="text-green-600">
                                <Bot className="h-3 w-3 mr-1" />
                                AI Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Connection ID: {number.connection_id || 'Not configured'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`ai-${number.id}`} className="cursor-pointer">
                              AI Dispatcher
                            </Label>
                            <Switch
                              id={`ai-${number.id}`}
                              checked={number.ai_dispatcher_enabled}
                              onCheckedChange={() => toggleAiDispatcher(number)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Dispatcher Configuration
              </CardTitle>
              <CardDescription>
                Configure how your AI assistant handles calls and messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Business Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      value={aiSettings.business_name}
                      onChange={(e) => updateAiSetting('business_name', e.target.value)}
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="business_hours">Business Hours</Label>
                    <Input
                      id="business_hours"
                      value={aiSettings.business_hours}
                      onChange={(e) => updateAiSetting('business_hours', e.target.value)}
                      placeholder="Monday-Friday 9AM-5PM"
                    />
                  </div>
                </div>
              </div>

              {/* Voice Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Voice Settings
                </h3>
                
                <div>
                  <Label htmlFor="greeting">Greeting Message</Label>
                  <Textarea
                    id="greeting"
                    value={aiSettings.greeting_message}
                    onChange={(e) => updateAiSetting('greeting_message', e.target.value)}
                    placeholder="Hello, thank you for calling..."
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Use {'{business_name}'} to insert your business name
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voice">AI Voice</Label>
                    <Select 
                      value={aiSettings.voice_settings.voice_id}
                      onValueChange={(value) => updateVoiceSetting('voice_id', value)}
                    >
                      <SelectTrigger id="voice">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rachel">Rachel (Female, Professional)</SelectItem>
                        <SelectItem value="john">John (Male, Professional)</SelectItem>
                        <SelectItem value="sarah">Sarah (Female, Friendly)</SelectItem>
                        <SelectItem value="mike">Mike (Male, Friendly)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={aiSettings.voice_settings.language}
                      onValueChange={(value) => updateVoiceSetting('language', value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <Label htmlFor="appointments">Enable Appointment Booking</Label>
                  </div>
                  <Switch
                    id="appointments"
                    checked={aiSettings.appointment_booking_enabled}
                    onCheckedChange={(checked) => updateAiSetting('appointment_booking_enabled', checked)}
                  />
                </div>
              </div>

              {/* SMS Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS Auto-Response
                </h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms_auto">Enable SMS Auto-Response</Label>
                  <Switch
                    id="sms_auto"
                    checked={aiSettings.sms_auto_response_enabled}
                    onCheckedChange={(checked) => updateAiSetting('sms_auto_response_enabled', checked)}
                  />
                </div>

                {aiSettings.sms_auto_response_enabled && (
                  <div>
                    <Label htmlFor="sms_template">Auto-Response Message</Label>
                    <Textarea
                      id="sms_template"
                      value={aiSettings.sms_response_template}
                      onChange={(e) => updateAiSetting('sms_response_template', e.target.value)}
                      placeholder="Thanks for your message! We'll get back to you shortly."
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Custom Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Custom AI Instructions
                </h3>
                
                <div>
                  <Label htmlFor="custom_prompt">Additional Instructions</Label>
                  <Textarea
                    id="custom_prompt"
                    value={aiSettings.custom_prompt}
                    onChange={(e) => updateAiSetting('custom_prompt', e.target.value)}
                    placeholder="Add any specific instructions for how your AI should behave..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Provide specific instructions about your services, pricing, policies, etc.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={saveAiSettings} 
                  disabled={saving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save AI Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dialer" className="space-y-6">
          <UnifiedCallManager 
            defaultToNumber={defaultToNumber}
            defaultClientId={defaultClientId}
          />
        </TabsContent>

        <TabsContent value="call-history" className="space-y-6">
          <CallHistory />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default CommunicationsSettingsPage; 
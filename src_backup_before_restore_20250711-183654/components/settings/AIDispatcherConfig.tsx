import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Save, Phone, Settings, MessageSquare, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface AIDispatcherSettings {
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

export const AIDispatcherConfig: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AIDispatcherSettings>({
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

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_dispatcher_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading AI dispatcher settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_dispatcher_configs')
        .upsert({
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('AI Dispatcher settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof AIDispatcherSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateVoiceSetting = (key: keyof typeof settings.voice_settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      voice_settings: {
        ...prev.voice_settings,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading AI dispatcher settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
            
            <div>
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={settings.business_name}
                onChange={(e) => updateSetting('business_name', e.target.value)}
                placeholder="Your Business Name"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This will be used in greetings and conversations
              </p>
            </div>

            <div>
              <Label htmlFor="business_hours">Business Hours</Label>
              <Input
                id="business_hours"
                value={settings.business_hours}
                onChange={(e) => updateSetting('business_hours', e.target.value)}
                placeholder="Monday-Friday 9AM-5PM"
              />
            </div>
          </div>

          {/* Voice Call Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Voice Call Settings
            </h3>
            
            <div>
              <Label htmlFor="greeting">Greeting Message</Label>
              <Textarea
                id="greeting"
                value={settings.greeting_message}
                onChange={(e) => updateSetting('greeting_message', e.target.value)}
                placeholder="Hello, thank you for calling..."
                rows={3}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use {'{business_name}'} to insert your business name
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voice">AI Voice</Label>
                <Select 
                  value={settings.voice_settings.voice_id}
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
                  value={settings.voice_settings.language}
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
                checked={settings.appointment_booking_enabled}
                onCheckedChange={(checked) => updateSetting('appointment_booking_enabled', checked)}
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
                checked={settings.sms_auto_response_enabled}
                onCheckedChange={(checked) => updateSetting('sms_auto_response_enabled', checked)}
              />
            </div>

            {settings.sms_auto_response_enabled && (
              <div>
                <Label htmlFor="sms_template">Auto-Response Message</Label>
                <Textarea
                  id="sms_template"
                  value={settings.sms_response_template}
                  onChange={(e) => updateSetting('sms_response_template', e.target.value)}
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
                value={settings.custom_prompt}
                onChange={(e) => updateSetting('custom_prompt', e.target.value)}
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
              onClick={saveSettings} 
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Your AI Card */}
      <Card>
        <CardHeader>
          <CardTitle>Test Your AI Dispatcher</CardTitle>
          <CardDescription>
            Make sure AI Dispatcher is enabled for your phone number, then call to test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Phone className="h-4 w-4 mr-2" />
                +1-437-524-9932
              </Badge>
              <span className="text-sm text-muted-foreground">
                Your configured phone number
              </span>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Quick Test Guide:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Enable AI Dispatcher in the Calls page</li>
                <li>Call your phone number from another phone</li>
                <li>Listen to your AI greeting and interact with it</li>
                <li>Check call logs to see the conversation</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
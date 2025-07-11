import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Phone, Save, Zap, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const TelnyxSettings = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Get Telnyx configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ['telnyx-config'],
    queryFn: async () => {
      console.log('Fetching Telnyx config...');
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'get_config' }
      });

      if (error) {
        console.error('Error fetching config:', error);
        throw error;
      }
      console.log('Config received:', data);
      return data.config;
    }
  });

  // Get user's phone numbers
  const { data: phoneNumbers = [], refetch: refetchPhoneNumbers } = useQuery({
    queryKey: ['user-phone-numbers-ai-settings'],
    queryFn: async () => {
      console.log('Fetching phone numbers for AI settings...');
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('Error fetching phone numbers:', error);
        throw error;
      }
      console.log('Phone numbers for AI settings:', data);
      return data.phone_numbers || [];
    }
  });

  const [formData, setFormData] = useState({
    voice: 'alloy',
    language: 'en-US',
    greeting: 'Hello, this is an AI assistant for our company. How can I help you today?',
    ai_enabled: true,
    business_hours: {
      monday: { open: '08:00', close: '17:00', enabled: true },
      tuesday: { open: '08:00', close: '17:00', enabled: true },
      wednesday: { open: '08:00', close: '17:00', enabled: true },
      thursday: { open: '08:00', close: '17:00', enabled: true },
      friday: { open: '08:00', close: '17:00', enabled: true },
      saturday: { open: '09:00', close: '15:00', enabled: false },
      sunday: { open: '10:00', close: '14:00', enabled: false }
    }
  });

  React.useEffect(() => {
    if (config) {
      setFormData({
        voice: config.voice_settings?.voice || 'alloy',
        language: config.voice_settings?.language || 'en-US',
        greeting: config.ai_settings?.greeting || 'Hello, this is an AI assistant for our company. How can I help you today?',
        ai_enabled: config.ai_settings?.enabled !== false,
        business_hours: config.business_settings?.hours || formData.business_hours
      });
    }
  }, [config]);

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      console.log('Updating config:', newConfig);
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'update_config',
          config: {
            voice_settings: {
              voice: newConfig.voice,
              language: newConfig.language
            },
            ai_settings: {
              enabled: newConfig.ai_enabled,
              greeting: newConfig.greeting
            },
            business_settings: {
              hours: newConfig.business_hours
            }
          }
        }
      });

      if (error) {
        console.error('Update config error:', error);
        throw error;
      }
      console.log('Config updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Settings updated successfully');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['telnyx-config'] });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Failed to update settings');
    }
  });

  const handleSave = () => {
    updateConfigMutation.mutate(formData);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['telnyx-config'] });
    queryClient.invalidateQueries({ queryKey: ['user-phone-numbers-ai-settings'] });
    refetchPhoneNumbers();
    toast.success('Data refreshed');
  };

  const configuredNumbers = phoneNumbers.filter(num => 
    num.ai_dispatcher_enabled || num.configured_for_ai || num.configured_at
  );

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  if (isLoading) {
    return <div>Loading Telnyx settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Settings</h2>
          <p className="text-muted-foreground">
            Configure your AI voice assistant and phone system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Badge variant={config?.api_key_configured ? 'default' : 'destructive'}>
            <Zap className="h-3 w-3 mr-1" />
            {config?.api_key_configured ? 'Telnyx Connected' : 'Telnyx Not Connected'}
          </Badge>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              Edit Settings
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateConfigMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateConfigMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Connected Numbers ({configuredNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {configuredNumbers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                No numbers configured for AI yet. Go to the Numbers tab to configure your phone numbers.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {configuredNumbers.map((number: any) => (
                <div key={number.id || number.phone_number} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">
                      {formatPhoneNumber(number.phone_number)}
                    </span>
                    {number.source === 'telnyx_table' && (
                      <Badge variant="outline" className="ml-2 text-blue-600">
                        <Zap className="h-3 w-3 mr-1" />
                        Telnyx
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Active
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Voice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>AI Assistant Enabled</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable the AI voice assistant
              </p>
            </div>
            <Switch
              checked={formData.ai_enabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, ai_enabled: checked }))
              }
              disabled={!isEditing}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="voice">Voice</Label>
              <Select
                value={formData.voice}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, voice: value }))
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                  <SelectItem value="echo">Echo (Male)</SelectItem>
                  <SelectItem value="fable">Fable (British)</SelectItem>
                  <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                  <SelectItem value="nova">Nova (Female)</SelectItem>
                  <SelectItem value="shimmer">Shimmer (Soft)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, language: value }))
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="de-DE">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="greeting">AI Greeting Message</Label>
            <Textarea
              id="greeting"
              value={formData.greeting}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, greeting: e.target.value }))
              }
              placeholder="Enter the greeting message for your AI assistant"
              rows={3}
              disabled={!isEditing}
            />
            <p className="text-sm text-muted-foreground mt-1">
              This message will be spoken when someone calls your phone number
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(formData.business_hours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={hours.enabled}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        business_hours: {
                          ...prev.business_hours,
                          [day]: { ...hours, enabled: checked }
                        }
                      }))
                    }
                    disabled={!isEditing}
                  />
                  <span className="w-20 capitalize">{day}</span>
                </div>
                {hours.enabled && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          business_hours: {
                            ...prev.business_hours,
                            [day]: { ...hours, open: e.target.value }
                          }
                        }))
                      }
                      disabled={!isEditing}
                      className="w-24"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          business_hours: {
                            ...prev.business_hours,
                            [day]: { ...hours, close: e.target.value }
                          }
                        }))
                      }
                      disabled={!isEditing}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

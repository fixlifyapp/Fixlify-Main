import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Phone, Zap, Settings, Save, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const TelnyxSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState({
    apiKey: '',
    connectionId: '',
    defaultFromNumber: '',
    webhookUrl: '',
    aiDispatcherEnabled: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load from user metadata or settings table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // You might want to store these in a settings table instead
        const metadata = user.user_metadata;
        setSettings({
          apiKey: metadata.telnyx_api_key || '',
          connectionId: metadata.telnyx_connection_id || '',
          defaultFromNumber: metadata.telnyx_default_from || '',
          webhookUrl: `${window.location.origin}/api/telnyx/webhook`,
          aiDispatcherEnabled: metadata.telnyx_ai_enabled || false,
        });
      }
    } catch (error) {
      console.error('Error loading Telnyx settings:', error);
      toast.error('Failed to load Telnyx settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          telnyx_api_key: settings.apiKey,
          telnyx_connection_id: settings.connectionId,
          telnyx_default_from: settings.defaultFromNumber,
          telnyx_ai_enabled: settings.aiDispatcherEnabled,
        }
      });

      if (error) throw error;
      toast.success('Telnyx settings saved successfully');
    } catch (error) {
      console.error('Error saving Telnyx settings:', error);
      toast.error('Failed to save Telnyx settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      // Test the Telnyx API connection
      const { data, error } = await supabase.functions.invoke('test-telnyx-connection', {
        body: { apiKey: settings.apiKey }
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success('Telnyx connection successful!');
      } else {
        throw new Error(data.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing Telnyx connection:', error);
      toast.error('Failed to connect to Telnyx');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading Telnyx settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Telnyx Integration
            </CardTitle>
            <CardDescription>
              Configure your Telnyx phone system for calls and SMS
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            <Phone className="h-3 w-3 mr-1" />
            Voice & SMS
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="KEY0123456789..."
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Telnyx API key from the Mission Control Portal
            </p>
          </div>

          <div>
            <Label htmlFor="connectionId">Connection ID</Label>
            <Input
              id="connectionId"
              value={settings.connectionId}
              onChange={(e) => setSettings({ ...settings, connectionId: e.target.value })}
              placeholder="1234567890"
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Telnyx connection ID for making calls
            </p>
          </div>

          <div>
            <Label htmlFor="defaultFromNumber">Default From Number</Label>
            <Input
              id="defaultFromNumber"
              value={settings.defaultFromNumber}
              onChange={(e) => setSettings({ ...settings, defaultFromNumber: e.target.value })}
              placeholder="+1234567890"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default phone number to use for outbound calls
            </p>
          </div>

          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhookUrl"
                value={settings.webhookUrl}
                readOnly
                className="bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(settings.webhookUrl);
                  toast.success('Webhook URL copied to clipboard');
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Configure this URL in your Telnyx portal for webhooks
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="aiDispatcher">AI Call Dispatcher</Label>
              <p className="text-xs text-gray-500">
                Enable AI to handle incoming calls automatically
              </p>
            </div>
            <Switch
              id="aiDispatcher"
              checked={settings.aiDispatcherEnabled}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, aiDispatcherEnabled: checked })
              }
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={!settings.apiKey || testing}
          >
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="ml-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TelnyxAIConfigurationProps {
  phoneNumberId: string;
  phoneNumber: string;
}

export default function TelnyxAIConfiguration({ phoneNumberId, phoneNumber }: TelnyxAIConfigurationProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [config, setConfig] = useState({
    agent_name: '',
    company_name: '',
    hours_of_operation: '',
    services_offered: '',
    greeting_message: '',
    agent_personality: '',
    call_transfer_message: '',
    voicemail_detection_message: ''
  });

  useEffect(() => {
    loadConfiguration();
  }, [phoneNumberId]);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('ai_dispatcher_config')
        .eq('id', phoneNumberId)
        .single();

      if (error) throw error;

      if (data?.ai_dispatcher_config) {
        setConfig(data.ai_dispatcher_config);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .update({ ai_dispatcher_config: config })
        .eq('id', phoneNumberId);

      if (error) throw error;
      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/test-ai-dispatcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumberId, config })
      });

      if (!response.ok) throw new Error('Test failed');
      toast.success('Test call initiated');
    } catch (error) {
      console.error('Error testing configuration:', error);
      toast.error('Failed to test configuration');
    } finally {
      setTesting(false);
    }
  };

  const handleChange = (field: keyof typeof config, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Dispatcher Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="agent_name">Agent Name</Label>
            <Input
              id="agent_name"
              value={config.agent_name}
              onChange={(e) => handleChange('agent_name', e.target.value)}
              placeholder="Enter agent name"
            />
          </div>
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={config.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="hours_of_operation">Hours of Operation</Label>
          <Input
            id="hours_of_operation"
            value={config.hours_of_operation}
            onChange={(e) => handleChange('hours_of_operation', e.target.value)}
            placeholder="e.g., Mon-Fri 9AM-6PM"
          />
        </div>

        <div>
          <Label htmlFor="services_offered">Services Offered</Label>
          <Textarea
            id="services_offered"
            value={config.services_offered}
            onChange={(e) => handleChange('services_offered', e.target.value)}
            placeholder="List services offered"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="greeting_message">Greeting Message</Label>
          <Textarea
            id="greeting_message"
            value={config.greeting_message}
            onChange={(e) => handleChange('greeting_message', e.target.value)}
            placeholder="Enter greeting message"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="agent_personality">Agent Personality</Label>
          <Textarea
            id="agent_personality"
            value={config.agent_personality}
            onChange={(e) => handleChange('agent_personality', e.target.value)}
            placeholder="Describe the AI agent personality"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="call_transfer_message">Call Transfer Message</Label>
          <Textarea
            id="call_transfer_message"
            value={config.call_transfer_message}
            onChange={(e) => handleChange('call_transfer_message', e.target.value)}
            placeholder="Message before transferring to human"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="voicemail_detection_message">Voicemail Detection Message</Label>
          <Textarea
            id="voicemail_detection_message"
            value={config.voicemail_detection_message}
            onChange={(e) => handleChange('voicemail_detection_message', e.target.value)}
            placeholder="Message for voicemail detection"
            rows={2}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Configuration
          </Button>
          <Button
            onClick={handleTest}
            disabled={testing}
            variant="outline"
            className="flex-1"
          >
            {testing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <TestTube className="w-4 h-4 mr-2" />
            Test Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

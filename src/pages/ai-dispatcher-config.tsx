import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from 'sonner';
import { ArrowLeft, Save, TestTube } from 'lucide-react';

export default function AIDispatcherConfigPage() {
  const router = useRouter();
  const { phoneNumber, phoneNumberId } = router.query;
  const { supabase, user } = useSupabase();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [config, setConfig] = useState({
    agent_name: 'Sarah',
    company_name: '',
    hours_of_operation: 'Monday-Friday 9am-6pm, Saturday 10am-4pm',
    services_offered: '',
    greeting_message: 'Thank you for calling. How can I help you today?',
    agent_personality: '',
    call_transfer_message: 'Let me transfer you to a team member who can better assist you.',
    voicemail_detection_message: 'Please leave a message after the tone and we will get back to you as soon as possible.',
    business_name: '',
    business_type: 'repair_shop',
    business_greeting: '',
    diagnostic_fee: 50,
    emergency_surcharge: 100,
    hourly_rate: 75,
    voice_selection: 'rachel',
    emergency_detection_enabled: true,
  });

  useEffect(() => {
    if (phoneNumberId) {
      loadConfiguration();
    }
  }, [phoneNumberId]);

  const loadConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_dispatcher_configs')
        .select('*')
        .eq('phone_number_id', phoneNumberId)
        .single();

      if (data) {
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };
  const saveConfiguration = async () => {
    setSaving(true);
    try {
      // Prepare data matching the database schema
      const configData = {
        phone_number_id: phoneNumberId,
        user_id: user?.id,
        phone_number: phoneNumber || '',
        agent_name: config.agent_name,
        company_name: config.company_name || config.business_name,
        hours_of_operation: config.hours_of_operation,
        services_offered: config.services_offered,
        greeting_message: config.greeting_message,
        agent_personality: config.agent_personality,
        call_transfer_message: config.call_transfer_message,
        voicemail_detection_message: config.voicemail_detection_message,
        business_name: config.company_name || config.business_name,
        business_type: config.business_type,
        business_greeting: config.greeting_message,
        diagnostic_fee: config.diagnostic_fee,
        emergency_surcharge: config.emergency_surcharge,
        hourly_rate: config.hourly_rate,
        voice_selection: config.voice_selection,
        emergency_detection_enabled: config.emergency_detection_enabled,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('ai_dispatcher_configs')
        .upsert(configData, {
          onConflict: 'phone_number_id',
        });

      if (error) throw error;

      // Also update Telnyx webhook variables if configured
      await updateTelnyxVariables();

      toast.success('AI Dispatcher configuration saved successfully!');
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      toast.error(`Failed to save configuration: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateTelnyxVariables = async () => {
    try {
      const response = await fetch('/api/telnyx/update-ai-variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          variables: {
            agent_name: config.agent_name,
            company_name: config.company_name,
            hours_of_operation: config.hours_of_operation,
            services_offered: config.services_offered,
            greeting: config.greeting_message,
          },
        }),
      });

      if (!response.ok) {
        console.warn('Failed to update Telnyx variables');
      }
    } catch (error) {
      console.warn('Could not update Telnyx variables:', error);
    }
  };

  const testAIAssistant = async () => {
    try {
      const response = await fetch('/api/telnyx/test-ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          testNumber: user?.phone || prompt('Enter phone number to test:'),
        }),
      });

      if (response.ok) {
        toast.success('Test call initiated! You should receive a call shortly.');
      } else {
        toast.error('Failed to initiate test call');
      }
    } catch (error) {
      toast.error('Error initiating test call');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">AI Dispatcher Configuration</h1>
        <p className="text-muted-foreground">Configure AI assistant for {phoneNumber}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Configure your AI assistant's identity and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="agent_name">Agent Name</Label>
              <Input
                id="agent_name"
                value={config.agent_name}
                onChange={(e) => setConfig({ ...config, agent_name: e.target.value })}
                placeholder="Sarah"
              />
            </div>
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={config.company_name}
                onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                placeholder="Your Business Name"
              />
            </div>

            <div>
              <Label htmlFor="hours">Hours of Operation</Label>
              <Input
                id="hours"
                value={config.hours_of_operation}
                onChange={(e) => setConfig({ ...config, hours_of_operation: e.target.value })}
                placeholder="Monday-Friday 9am-6pm, Saturday 10am-4pm"
              />
            </div>

            <div>
              <Label htmlFor="services">Services Offered</Label>
              <Textarea
                id="services"
                value={config.services_offered}
                onChange={(e) => setConfig({ ...config, services_offered: e.target.value })}
                placeholder="appliances, electronics, computers, phones"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Messages</CardTitle>
            <CardDescription>Customize what your AI assistant says</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="greeting">Greeting Message (Telnyx Variable)</Label>
              <Textarea
                id="greeting"
                value={config.greeting_message}
                onChange={(e) => setConfig({ ...config, greeting_message: e.target.value })}
                placeholder="Thank you for calling. How can I help you today?"
                rows={3}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Available Telnyx variables: {`{{agent_name}}, {{company_name}}, {{hours_of_operation}}, {{services_offered}}, {{business_phone}}, {{current_date}}, {{current_time}}, {{greeting}}`}
              </p>
            </div>

            <div>
              <Label htmlFor="personality">Agent Personality</Label>
              <Textarea
                id="personality"
                value={config.agent_personality}
                onChange={(e) => setConfig({ ...config, agent_personality: e.target.value })}
                placeholder="Describe the personality traits of your AI agent..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="transfer">Call Transfer Message</Label>
              <Textarea
                id="transfer"
                value={config.call_transfer_message}
                onChange={(e) => setConfig({ ...config, call_transfer_message: e.target.value })}
                placeholder="Let me transfer you to a team member who can better assist you."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="voicemail">Voicemail Detection Message</Label>
              <Textarea
                id="voicemail"
                value={config.voicemail_detection_message}
                onChange={(e) => setConfig({ ...config, voicemail_detection_message: e.target.value })}
                placeholder="Please leave a message after the tone..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={testAIAssistant}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Test AI Assistant
          </Button>
          <Button
            onClick={saveConfiguration}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
}

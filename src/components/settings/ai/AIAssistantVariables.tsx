import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const AIAssistantVariables = ({ phoneNumber }: { phoneNumber: string }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState<string | null>(null);
  const [config, setConfig] = useState({
    agent_name: '',
    business_name: '',
    hours_of_operation: '',
    services_offered: '',
    business_phone: '',
    greeting: '',
    current_date: new Date().toLocaleDateString(),
    current_time: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    loadConfig();
  }, [phoneNumber]);

  const loadConfig = async () => {
    try {
      // Get phone number ID first
      const { data: phoneData } = await supabase
        .from('phone_numbers')
        .select('id')
        .eq('phone_number', phoneNumber)
        .single();

      if (phoneData) {
        setPhoneNumberId(phoneData.id);
        
        // Load config using edge function
        const { data: configResponse } = await supabase.functions.invoke('ai-dispatcher-configs', {
          body: { 
            action: 'get', 
            phoneNumberId: phoneData.id 
          }
        });

        if (configResponse?.data) {
          const data = configResponse.data;
          setConfig({
            agent_name: data.agent_name || data.business_name || '',
            business_name: data.business_name || '',
            hours_of_operation: data.hours_of_operation || 'Monday-Friday 9am-6pm',
            services_offered: Array.isArray(data.services_offered) 
              ? data.services_offered.join(', ') 
              : data.services_offered || '',
            business_phone: phoneNumber,
            greeting: data.business_greeting || '',
            current_date: new Date().toLocaleDateString(),
            current_time: new Date().toLocaleTimeString()
          });
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const saveConfig = async () => {
    if (!phoneNumberId) {
      toast.error('Phone number not found');
      return;
    }

    setLoading(true);
    try {
      // Use edge function to save configuration with all fields
      const { data, error } = await supabase.functions.invoke('ai-dispatcher-configs', {
        body: {
          action: 'save',
          phoneNumberId: phoneNumberId,
          phoneNumber: phoneNumber,
          config: {
            agent_name: config.agent_name,
            business_name: config.business_name,
            business_type: 'repair_shop',
            business_greeting: config.greeting || 'Thank you for calling. How can I help you today?',
            hours_of_operation: config.hours_of_operation,
            services_offered: config.services_offered.split(',').map(s => s.trim()).filter(s => s),
            agent_personality: 'professional',
            call_transfer_message: 'Let me transfer you to a team member who can better assist you.',
            voicemail_detection_message: 'Please leave a message after the tone.',
            diagnostic_fee: 0,
            emergency_surcharge: 0,
            hourly_rate: 0,
            voice_selection: 'rachel',
            emergency_detection_enabled: false
          }
        }
      });

      if (error) throw error;
      toast.success('AI Assistant variables saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant Dynamic Variables</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Agent Name</Label>
            <Input
              value={config.agent_name}
              onChange={(e) => setConfig({...config, agent_name: e.target.value})}
              placeholder="e.g., Sarah"
            />
          </div>
          <div>
            <Label>Business Name</Label>
            <Input
              value={config.business_name}
              onChange={(e) => setConfig({...config, business_name: e.target.value})}
              placeholder="e.g., Fixlify Repair Shop"
            />
          </div>
        </div>

        <div>
          <Label>Hours of Operation</Label>
          <Input
            value={config.hours_of_operation}
            onChange={(e) => setConfig({...config, hours_of_operation: e.target.value})}
            placeholder="e.g., Monday-Friday 9am-6pm"
          />
        </div>

        <div>
          <Label>Services Offered</Label>
          <Input
            value={config.services_offered}
            onChange={(e) => setConfig({...config, services_offered: e.target.value})}
            placeholder="Phone repair, Computer repair, Tablet repair"
          />
        </div>

        <div>
          <Label>Business Phone</Label>
          <Input
            value={config.business_phone}
            disabled
            className="bg-muted"
          />
        </div>

        <div>
          <Label>Greeting Message</Label>
          <Textarea
            value={config.greeting}
            onChange={(e) => setConfig({...config, greeting: e.target.value})}
            placeholder="Thank you for calling. How can I help you today?"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Current Date (Auto)</Label>
            <Input value={config.current_date} disabled className="bg-muted" />
          </div>
          <div>
            <Label>Current Time (Auto)</Label>
            <Input value={config.current_time} disabled className="bg-muted" />
          </div>
        </div>

        <Button 
          onClick={saveConfig}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Save Variables'}
        </Button>
      </CardContent>
    </Card>
  );
};

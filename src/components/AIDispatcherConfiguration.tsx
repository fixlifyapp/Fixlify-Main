// AI Dispatcher Configuration Component (Simplified)
// This component allows businesses to configure their AI voice assistant settings

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save, TestTube, Phone, DollarSign, Settings, Mic } from 'lucide-react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from 'sonner';

interface AIDispatcherConfig {
  id?: string;
  user_id?: string;
  phone_number_id: string;
  business_name: string;
  business_type: string;
  business_greeting: string;
  diagnostic_fee: number;
  emergency_surcharge: number;
  hourly_rate: number;
  voice_selection: string;
  emergency_detection_enabled: boolean;
}

export default function AIDispatcherConfiguration({ phoneNumber, phoneNumberId }: { phoneNumber: string; phoneNumberId: string }) {
  const { supabase, user } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [config, setConfig] = useState<AIDispatcherConfig>({
    phone_number_id: phoneNumberId,
    business_name: '',
    business_type: 'repair_shop',
    business_greeting: 'Thank you for calling. How can I help you today?',
    diagnostic_fee: 50,
    emergency_surcharge: 100,
    hourly_rate: 75,
    voice_selection: 'rachel',
    emergency_detection_enabled: true,
  });

  // Extended configuration for Telnyx variables
  const [extendedConfig, setExtendedConfig] = useState({
    agent_name: 'Assistant',
    agent_personality: 'professional',
    hours_of_operation: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '14:00', closed: false },
      sunday: { open: '', close: '', closed: true },
    },
    timezone: 'America/New_York',
    services_offered: [] as string[],
    specialties: [] as string[],
    service_areas: [] as string[],
    price_range: '$$',
    payment_methods: ['Cash', 'Credit Card', 'Debit Card'],
  });

  useEffect(() => {
    loadConfiguration();
  }, [phoneNumberId]);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_dispatcher_configs')
        .select('*')
        .eq('phone_number_id', phoneNumberId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading configuration:', error);
        toast.error('Failed to load AI configuration');
      }

      if (data) {
        setConfig({
          ...config,
          ...data,
        });
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const configData = {
        ...config,
        user_id: user?.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('ai_dispatcher_configs')
        .upsert(configData, {
          onConflict: 'phone_number_id',
        });

      if (error) throw error;

      toast.success('AI Dispatcher configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };
  const testConfiguration = async () => {
    setTesting(true);
    try {
      // Call your edge function to test the configuration
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/test-ai-dispatcher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          test_scenario: 'greeting',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Test call initiated! Your phone will ring shortly.');
      } else {
        toast.error('Test failed: ' + result.message);
      }
    } catch (error) {
      console.error('Error testing configuration:', error);
      toast.error('Failed to initiate test call');
    } finally {
      setTesting(false);
    }
  };

  const addService = () => {
    setExtendedConfig({
      ...extendedConfig,
      services_offered: [...extendedConfig.services_offered, ''],
    });
  };

  const updateService = (index: number, value: string) => {
    const updated = [...extendedConfig.services_offered];
    updated[index] = value;
    setExtendedConfig({ ...extendedConfig, services_offered: updated });
  };

  const removeService = (index: number) => {
    const updated = extendedConfig.services_offered.filter((_, i) => i !== index);
    setExtendedConfig({ ...extendedConfig, services_offered: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Dispatcher Configuration</h2>
          <p className="text-muted-foreground">Configure your AI voice assistant for {phoneNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={testConfiguration}
            disabled={testing}
          >
            <TestTube className="mr-2 h-4 w-4" />
            {testing ? 'Testing...' : 'Test Call'}
          </Button>
          <Button
            onClick={saveConfiguration}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="voice">Voice & AI</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
        </TabsList>
        {/* Business Information Tab */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Basic information about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={config.business_name}
                    onChange={(e) => setConfig({ ...config, business_name: e.target.value })}
                    placeholder="QuickFix Electronics"
                  />
                </div>
                <div>
                  <Label>Business Type</Label>
                  <Select
                    value={config.business_type}
                    onValueChange={(value) => setConfig({ ...config, business_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repair_shop">Repair Shop</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="salon">Salon</SelectItem>
                      <SelectItem value="retail">Retail Store</SelectItem>
                      <SelectItem value="service">Service Business</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Business Greeting</Label>
                <Textarea
                  value={config.business_greeting}
                  onChange={(e) => setConfig({ ...config, business_greeting: e.target.value })}
                  placeholder="Thank you for calling. How can I help you today?"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This is what callers will hear when they reach your AI assistant
                </p>
              </div>

              <div>
                <Label>Services Offered</Label>
                <div className="space-y-2">
                  {extendedConfig.services_offered.map((service, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={service}
                        onChange={(e) => updateService(index, e.target.value)}
                        placeholder="Enter service"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addService}
                  >
                    Add Service
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice & AI Tab */}
        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice & AI Settings</CardTitle>
              <CardDescription>Configure the voice and behavior of your AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Voice Selection</Label>
                  <Select
                    value={config.voice_selection}
                    onValueChange={(value) => setConfig({ ...config, voice_selection: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rachel">Rachel (Female, Professional)</SelectItem>
                      <SelectItem value="jenny">Jenny (Female, Friendly)</SelectItem>
                      <SelectItem value="dave">Dave (Male, Professional)</SelectItem>
                      <SelectItem value="brian">Brian (Male, Casual)</SelectItem>
                      <SelectItem value="amy">Amy (Female, Energetic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Agent Personality</Label>
                  <Select
                    value={extendedConfig.agent_personality}
                    onValueChange={(value) => setExtendedConfig({ ...extendedConfig, agent_personality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Agent Name</Label>
                <Input
                  value={extendedConfig.agent_name}
                  onChange={(e) => setExtendedConfig({ ...extendedConfig, agent_name: e.target.value })}
                  placeholder="Assistant"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="emergency-detection"
                  checked={config.emergency_detection_enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, emergency_detection_enabled: checked })}
                />
                <Label htmlFor="emergency-detection">
                  Enable Emergency Detection
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
              <CardDescription>Set your pricing and payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Diagnostic Fee</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={config.diagnostic_fee}
                      onChange={(e) => setConfig({ ...config, diagnostic_fee: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                      placeholder="50.00"
                    />
                  </div>
                </div>
                <div>
                  <Label>Hourly Rate</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={config.hourly_rate}
                      onChange={(e) => setConfig({ ...config, hourly_rate: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                      placeholder="75.00"
                    />
                  </div>
                </div>
                <div>
                  <Label>Emergency Surcharge</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={config.emergency_surcharge}
                      onChange={(e) => setConfig({ ...config, emergency_surcharge: parseFloat(e.target.value) || 0 })}
                      className="pl-10"
                      placeholder="100.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price Range</Label>
                  <Select
                    value={extendedConfig.price_range}
                    onValueChange={(value) => setExtendedConfig({ ...extendedConfig, price_range: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$">$ (Budget)</SelectItem>
                      <SelectItem value="$$">$$ (Moderate)</SelectItem>
                      <SelectItem value="$$$">$$$ (Premium)</SelectItem>
                      <SelectItem value="$$$$">$$$$ (Luxury)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Methods</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Cash', 'Credit Card', 'Debit Card', 'Check', 'PayPal', 'Venmo'].map((method) => (
                      <Badge
                        key={method}
                        variant={extendedConfig.payment_methods.includes(method) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const methods = extendedConfig.payment_methods.includes(method)
                            ? extendedConfig.payment_methods.filter(m => m !== method)
                            : [...extendedConfig.payment_methods, method];
                          setExtendedConfig({ ...extendedConfig, payment_methods: methods });
                        }}
                      >
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hours Tab */}
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>Set your business hours for each day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Timezone</Label>
                <Select
                  value={extendedConfig.timezone}
                  onValueChange={(value) => setExtendedConfig({ ...extendedConfig, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="America/Phoenix">Arizona Time</SelectItem>
                    <SelectItem value="Pacific/Honolulu">Hawaii Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {Object.entries(extendedConfig.hours_of_operation).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-2 border rounded">
                    <div className="w-24 capitalize">{day}</div>
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) => {
                        setExtendedConfig({
                          ...extendedConfig,
                          hours_of_operation: {
                            ...extendedConfig.hours_of_operation,
                            [day]: { ...hours, closed: !checked }
                          }
                        });
                      }}
                    />
                    {!hours.closed && (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => {
                            setExtendedConfig({
                              ...extendedConfig,
                              hours_of_operation: {
                                ...extendedConfig.hours_of_operation,
                                [day]: { ...hours, open: e.target.value }
                              }
                            });
                          }}
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => {
                            setExtendedConfig({
                              ...extendedConfig,
                              hours_of_operation: {
                                ...extendedConfig.hours_of_operation,
                                [day]: { ...hours, close: e.target.value }
                              }
                            });
                          }}
                          className="w-32"
                        />
                      </>
                    )}
                    {hours.closed && <span className="text-muted-foreground">Closed</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

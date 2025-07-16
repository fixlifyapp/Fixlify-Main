
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Bot, DollarSign, Brain, User, MessageSquare, Clock, MapPin } from "lucide-react";
import { useAIAgentConfig } from "@/hooks/useAIAgentConfig";
import { VoiceSelector } from "./VoiceSelector";
import { GreetingTemplateEditor } from "./GreetingTemplateEditor";
import { BusinessHoursEditor } from "./BusinessHoursEditor";
import { toast } from "sonner";
import { BusinessHours, DEFAULT_BUSINESS_HOURS } from "@/types/businessHours";

const BUSINESS_NICHES = [
  'General Service',
  'HVAC',
  'Plumbing',
  'Electrical',
  'Appliance Repair',
  'Landscaping',
  'Cleaning Services',
  'Home Maintenance'
];

const SERVICE_TYPES = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'General Repair',
  'Appliance Repair',
  'Landscaping',
  'Cleaning',
  'Maintenance',
  'Emergency Services'
];

export const EnhancedAIAgentSettings = () => {
  const { 
    config, 
    loading, 
    saving, 
    saveConfig,
    toggleActive
  } = useAIAgentConfig();

  const [agentForm, setAgentForm] = useState({
    business_niche: 'General Service',
    diagnostic_price: 75.00,
    emergency_surcharge: 50.00,
    custom_prompt_additions: '',
    is_active: true,
    agent_name: 'AI Assistant',
    voice_id: 'alloy',
    greeting_template: 'Hello, my name is {agent_name}. I\'m an AI assistant for {company_name}. How can I help you today?',
    company_name: 'our company',
    service_areas: [] as string[],
    business_hours: DEFAULT_BUSINESS_HOURS,
    service_types: ['HVAC', 'Plumbing', 'Electrical', 'General Repair'] as string[]
  });

  const [newServiceArea, setNewServiceArea] = useState('');

  useEffect(() => {
    if (config) {
      setAgentForm({
        business_niche: config.business_niche,
        diagnostic_price: config.diagnostic_price,
        emergency_surcharge: config.emergency_surcharge,
        custom_prompt_additions: config.custom_prompt_additions || '',
        is_active: config.is_active,
        agent_name: config.agent_name,
        voice_id: config.voice_id,
        greeting_template: config.greeting_template,
        company_name: config.company_name,
        service_areas: config.service_areas,
        business_hours: config.business_hours,
        service_types: config.service_types
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveConfig(agentForm);
    if (success) {
      toast.success('AI Agent configuration saved successfully');
    }
  };

  const addServiceArea = () => {
    if (newServiceArea.trim() && !agentForm.service_areas.includes(newServiceArea.trim())) {
      setAgentForm(prev => ({
        ...prev,
        service_areas: [...prev.service_areas, newServiceArea.trim()]
      }));
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (area: string) => {
    setAgentForm(prev => ({
      ...prev,
      service_areas: prev.service_areas.filter(a => a !== area)
    }));
  };

  const toggleServiceType = (serviceType: string) => {
    setAgentForm(prev => ({
      ...prev,
      service_types: prev.service_types.includes(serviceType)
        ? prev.service_types.filter(st => st !== serviceType)
        : [...prev.service_types, serviceType]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Agent Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Enhanced AI Agent Status
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant={config?.is_active ? "success" : "info"}>
                {config?.is_active ? "Active" : "Inactive"}
              </Badge>
              <Switch
                checked={config?.is_active || false}
                onCheckedChange={toggleActive}
                disabled={saving}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your enhanced AI agent is {config?.is_active ? 'currently active with' : 'currently inactive. When active, it will have'} voice 
            selection, custom greetings, business hours awareness, and intelligent conversation capabilities.
          </p>
        </CardContent>
      </Card>

      {/* Enhanced Configuration Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Enhanced AI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="identity">Identity</TabsTrigger>
                <TabsTrigger value="voice">Voice</TabsTrigger>
                <TabsTrigger value="greeting">Greeting</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TabsList>

              {/* Identity Tab */}
              <TabsContent value="identity" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agent_name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      AI Agent Name
                    </Label>
                    <Input
                      id="agent_name"
                      value={agentForm.agent_name}
                      onChange={(e) => setAgentForm(prev => ({ ...prev, agent_name: e.target.value }))}
                      placeholder="e.g., Julia, Alex, Sarah"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      The name your AI agent will use when introducing itself
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={agentForm.company_name}
                      onChange={(e) => setAgentForm(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Your Company Name"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used in greetings and conversations
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="business_niche">Business Type</Label>
                  <Select 
                    value={agentForm.business_niche} 
                    onValueChange={(value) => setAgentForm(prev => ({ ...prev, business_niche: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_NICHES.map(niche => (
                        <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diagnostic_price" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Diagnostic Price ($)
                    </Label>
                    <Input
                      id="diagnostic_price"
                      type="number"
                      step="0.01"
                      value={agentForm.diagnostic_price}
                      onChange={(e) => setAgentForm(prev => ({ 
                        ...prev, 
                        diagnostic_price: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergency_surcharge">Emergency Surcharge ($)</Label>
                    <Input
                      id="emergency_surcharge"
                      type="number"
                      step="0.01"
                      value={agentForm.emergency_surcharge}
                      onChange={(e) => setAgentForm(prev => ({ 
                        ...prev, 
                        emergency_surcharge: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Voice Tab */}
              <TabsContent value="voice">
                <VoiceSelector
                  selectedVoice={agentForm.voice_id}
                  onVoiceChange={(voice) => setAgentForm(prev => ({ ...prev, voice_id: voice }))}
                />
              </TabsContent>

              {/* Greeting Tab */}
              <TabsContent value="greeting">
                <GreetingTemplateEditor
                  greetingTemplate={agentForm.greeting_template}
                  onTemplateChange={(template) => setAgentForm(prev => ({ ...prev, greeting_template: template }))}
                  agentName={agentForm.agent_name}
                  companyName={agentForm.company_name}
                  businessType={agentForm.business_niche}
                />
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule">
                <BusinessHoursEditor
                  businessHours={agentForm.business_hours}
                  onBusinessHoursChange={(hours) => setAgentForm(prev => ({ ...prev, business_hours: hours }))}
                />
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-6">
                {/* Service Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Service Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {SERVICE_TYPES.map((serviceType) => (
                        <div
                          key={serviceType}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            agentForm.service_types.includes(serviceType)
                              ? 'bg-blue-50 border-blue-200 text-blue-800'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => toggleServiceType(serviceType)}
                        >
                          <div className="font-medium text-sm">{serviceType}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Service Areas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Service Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newServiceArea}
                        onChange={(e) => setNewServiceArea(e.target.value)}
                        placeholder="Enter zip code or area name"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
                      />
                      <Button type="button" onClick={addServiceArea}>Add</Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {agentForm.service_areas.map((area) => (
                        <Badge
                          key={area}
                          variant="info"
                          className="cursor-pointer"
                          onClick={() => removeServiceArea(area)}
                        >
                          {area} ×
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={agentForm.custom_prompt_additions}
                      onChange={(e) => setAgentForm(prev => ({ 
                        ...prev, 
                        custom_prompt_additions: e.target.value 
                      }))}
                      placeholder="Add specific instructions for how your AI agent should handle calls..."
                      rows={4}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button type="submit" disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Enhanced Configuration'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

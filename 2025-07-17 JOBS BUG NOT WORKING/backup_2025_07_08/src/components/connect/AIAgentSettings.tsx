
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Bot, DollarSign, Brain } from "lucide-react";
import { useAIAgentConfig } from "@/hooks/useAIAgentConfig";
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

export const AIAgentSettings = () => {
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

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveConfig(agentForm);
    if (success) {
      toast.success('AI Agent configuration saved successfully');
    }
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
              AI Agent Status
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
            Your AI agent is {config?.is_active ? 'currently active and' : 'currently inactive. When active, it will'} automatically handle incoming calls, 
            understand customer needs, and schedule appointments based on your business configuration.
          </p>
        </CardContent>
      </Card>

      {/* Business Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Business Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAgentSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-xs text-muted-foreground mt-1">
                  Helps the AI understand your service industry
                </p>
              </div>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Standard fee the AI will quote for diagnostic visits
                </p>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Additional fee for emergency or after-hours calls
                </p>
              </div>
            </div>

            {/* Business Hours Section */}
            <div>
              <Label className="text-base font-medium">Business Hours</Label>
              <p className="text-xs text-muted-foreground mb-4">
                Set your business hours for AI agent scheduling
              </p>
              <BusinessHoursEditor
                businessHours={agentForm.business_hours}
                onBusinessHoursChange={(hours) => setAgentForm(prev => ({ ...prev, business_hours: hours }))}
              />
            </div>

            <div>
              <Label htmlFor="custom_prompt_additions">Custom Instructions</Label>
              <Textarea
                id="custom_prompt_additions"
                value={agentForm.custom_prompt_additions}
                onChange={(e) => setAgentForm(prev => ({ 
                  ...prev, 
                  custom_prompt_additions: e.target.value 
                }))}
                placeholder="Add specific instructions for how your AI agent should handle calls..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Customize how your AI agent communicates with customers
              </p>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Your AI Agent Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Answers Calls</h4>
                <p className="text-sm text-muted-foreground">
                  Your AI agent automatically answers incoming customer calls with a professional greeting
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Understands Needs</h4>
                <p className="text-sm text-muted-foreground">
                  Uses natural language processing to understand customer service requests and issues
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Provides Quotes</h4>
                <p className="text-sm text-muted-foreground">
                  Gives accurate pricing based on your configured rates and service type
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                4
              </div>
              <div>
                <h4 className="font-medium">Schedules Appointments</h4>
                <p className="text-sm text-muted-foreground">
                  Books appointments directly into your calendar based on availability
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

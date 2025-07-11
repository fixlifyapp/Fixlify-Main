
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAIAgentConfig } from "@/hooks/useAIAgentConfig";
import { Loader2, Cloud, MessageSquare, Settings, Brain, DollarSign, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionRequired } from "@/components/auth/RBACProvider";

const BUSINESS_NICHES = [
  'General Service',
  'HVAC',
  'Plumbing', 
  'Electrical',
  'Appliance Repair',
  'Roofing',
  'Landscaping',
  'Pest Control',
  'Home Security',
  'Cleaning Services'
];

export const AmazonConnectSettings = () => {
  const { config, awsCredentials, loading, saving, saveConfig, saveAWSCredentials, toggleActive } = useAIAgentConfig();
  const { isAdminOrManager } = usePermissions();
  
  const [formData, setFormData] = useState({
    business_niche: config?.business_niche || 'General Service',
    diagnostic_price: config?.diagnostic_price || 75,
    emergency_surcharge: config?.emergency_surcharge || 50,
    custom_prompt_additions: config?.custom_prompt_additions || '',
    connect_instance_arn: config?.connect_instance_arn || '',
    aws_region: config?.aws_region || 'us-east-1',
    is_active: config?.is_active || false,
    agent_name: config?.agent_name || 'AI Assistant',
    voice_id: config?.voice_id || 'alloy',
    greeting_template: config?.greeting_template || 'Hello, my name is {agent_name}. I\'m an AI assistant for {company_name}. How can I help you today?',
    company_name: config?.company_name || 'our company',
    service_areas: config?.service_areas || [],
    business_hours: config?.business_hours || {
      monday: { open: '08:00', close: '17:00', enabled: true },
      tuesday: { open: '08:00', close: '17:00', enabled: true },
      wednesday: { open: '08:00', close: '17:00', enabled: true },
      thursday: { open: '08:00', close: '17:00', enabled: true },
      friday: { open: '08:00', close: '17:00', enabled: true },
      saturday: { open: '09:00', close: '15:00', enabled: true },
      sunday: { open: '10:00', close: '14:00', enabled: false }
    },
    service_types: config?.service_types || ['HVAC', 'Plumbing', 'Electrical', 'General Repair']
  });

  const [awsForm, setAwsForm] = useState({
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_region: awsCredentials?.aws_region || 'us-east-1'
  });

  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  React.useEffect(() => {
    if (config) {
      setFormData({
        business_niche: config.business_niche,
        diagnostic_price: config.diagnostic_price,
        emergency_surcharge: config.emergency_surcharge,
        custom_prompt_additions: config.custom_prompt_additions || '',
        connect_instance_arn: config.connect_instance_arn || '',
        aws_region: config.aws_region || 'us-east-1',
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

  const handleSaveConfig = async () => {
    if (!isAdminOrManager()) {
      toast.error("You don't have permission to modify AI agent settings");
      return;
    }

    const success = await saveConfig(formData);
    if (success) {
      toast.success('Amazon Connect AI configuration saved successfully');
    }
  };

  const handleSaveCredentials = async () => {
    if (!isAdminOrManager()) {
      toast.error("You don't have permission to modify AWS credentials");
      return;
    }

    if (!awsForm.aws_access_key_id || !awsForm.aws_secret_access_key) {
      toast.error('Please provide both AWS Access Key ID and Secret Access Key');
      return;
    }

    const success = await saveAWSCredentials(awsForm);
    if (success) {
      setAwsForm({
        aws_access_key_id: '',
        aws_secret_access_key: '',
        aws_region: awsForm.aws_region
      });
      setShowCredentialsForm(false);
    }
  };

  const handleToggleActive = async () => {
    if (!isAdminOrManager()) {
      toast.error("You don't have permission to toggle AI agent status");
      return;
    }
    
    await toggleActive();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading Amazon Connect AI configuration...</span>
        </CardContent>
      </Card>
    );
  }

  // Show permission denied for non-admin/manager users
  if (!isAdminOrManager()) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <ShieldX className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
          <p className="text-gray-600 mb-4">
            Amazon Connect AI configuration is restricted to administrators and managers only.
          </p>
          <p className="text-sm text-gray-500">
            Contact your system administrator if you need access to these settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Amazon Connect AI Agent</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Configure your intelligent phone assistant with Amazon Connect, Lambda, and OpenAI TTS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={config?.is_active ? "success" : "info"}>
                {config?.is_active ? "Active" : "Inactive"}
              </Badge>
              <Switch
                checked={config?.is_active || false}
                onCheckedChange={handleToggleActive}
                disabled={saving}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AWS Credentials */}
      <PermissionRequired permission="settings.edit">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AWS Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AWS Credentials</p>
                <p className="text-sm text-gray-600">
                  {awsCredentials ? 'Credentials configured for Amazon Connect' : 'No credentials configured'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCredentialsForm(!showCredentialsForm)}
              >
                {awsCredentials ? 'Update Credentials' : 'Add Credentials'}
              </Button>
            </div>

            {showCredentialsForm && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="access_key">AWS Access Key ID</Label>
                    <Input
                      id="access_key"
                      type="password"
                      placeholder="AKIA..."
                      value={awsForm.aws_access_key_id}
                      onChange={(e) => setAwsForm(prev => ({ ...prev, aws_access_key_id: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secret_key">AWS Secret Access Key</Label>
                    <Input
                      id="secret_key"
                      type="password"
                      placeholder="Secret key..."
                      value={awsForm.aws_secret_access_key}
                      onChange={(e) => setAwsForm(prev => ({ ...prev, aws_secret_access_key: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="aws_region">AWS Region</Label>
                  <Select value={awsForm.aws_region} onValueChange={(value) => setAwsForm(prev => ({ ...prev, aws_region: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                      <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveCredentials} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Credentials
                  </Button>
                  <Button variant="outline" onClick={() => setShowCredentialsForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PermissionRequired>

      {/* AI Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Amazon Connect AI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="business_niche">Business Niche</Label>
                <Select 
                  value={formData.business_niche} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, business_niche: value }))}
                  disabled={!isAdminOrManager()}
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
                <p className="text-xs text-gray-600 mt-1">
                  Helps AI customize conversations for your industry
                </p>
              </div>

              <div>
                <Label htmlFor="connect_instance">Amazon Connect Instance ARN</Label>
                <Input
                  id="connect_instance"
                  placeholder="arn:aws:connect:region:account-id:instance/instance-id"
                  value={formData.connect_instance_arn}
                  onChange={(e) => setFormData(prev => ({ ...prev, connect_instance_arn: e.target.value }))}
                  disabled={!isAdminOrManager()}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Your Amazon Connect instance identifier
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diagnostic_price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Diagnostic Price
                  </Label>
                  <Input
                    id="diagnostic_price"
                    type="number"
                    step="0.01"
                    value={formData.diagnostic_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnostic_price: parseFloat(e.target.value) || 0 }))}
                    disabled={!isAdminOrManager()}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_surcharge">Emergency Surcharge</Label>
                  <Input
                    id="emergency_surcharge"
                    type="number"
                    step="0.01"
                    value={formData.emergency_surcharge}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_surcharge: parseFloat(e.target.value) || 0 }))}
                    disabled={!isAdminOrManager()}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="aws_region">AWS Region</Label>
                <Select 
                  value={formData.aws_region} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, aws_region: value }))}
                  disabled={!isAdminOrManager()}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label htmlFor="custom_prompts">Custom AI Instructions</Label>
            <Textarea
              id="custom_prompts"
              placeholder="Add specific instructions for your AI agent..."
              rows={4}
              value={formData.custom_prompt_additions}
              onChange={(e) => setFormData(prev => ({ ...prev, custom_prompt_additions: e.target.value }))}
              disabled={!isAdminOrManager()}
            />
            <p className="text-xs text-gray-600 mt-1">
              Additional instructions to customize how the AI agent handles calls via Amazon Connect
            </p>
          </div>

          <PermissionRequired permission="settings.edit">
            <div className="flex gap-3">
              <Button onClick={handleSaveConfig} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Configuration
              </Button>
            </div>
          </PermissionRequired>
        </CardContent>
      </Card>
    </div>
  );
};

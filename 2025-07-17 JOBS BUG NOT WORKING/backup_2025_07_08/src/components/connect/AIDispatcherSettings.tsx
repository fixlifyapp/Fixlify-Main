import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Loader2, 
  Save, 
  Bot, 
  Building, 
  DollarSign, 
  Volume2, 
  Shield,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface AIDispatcherSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumberId: string;
  phoneNumber: string;
}

interface AIConfig {
  business_name: string;
  business_type: string;
  business_greeting: string;
  diagnostic_fee: number;
  emergency_surcharge: number;
  hourly_rate: number;
  voice_selection: string;
  emergency_detection_enabled: boolean;
}

const businessTypes = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'General Contractor',
  'Appliance Repair',
  'Handyman',
  'Roofing',
  'Flooring',
  'Painting',
  'General Service'
];

const voiceOptions = [
  { value: 'alloy', label: 'Alloy (Balanced)' },
  { value: 'echo', label: 'Echo (Professional)' },
  { value: 'fable', label: 'Fable (Warm)' },
  { value: 'onyx', label: 'Onyx (Deep)' },
  { value: 'nova', label: 'Nova (Energetic)' },
  { value: 'shimmer', label: 'Shimmer (Friendly)' }
];

export const AIDispatcherSettings = ({ open, onOpenChange, phoneNumberId, phoneNumber }: AIDispatcherSettingsProps) => {
  const [config, setConfig] = useState<AIConfig>({
    business_name: '',
    business_type: 'General Service',
    business_greeting: '',
    diagnostic_fee: 75,
    emergency_surcharge: 50,
    hourly_rate: 100,
    voice_selection: 'alloy',
    emergency_detection_enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && phoneNumberId) {
      loadConfig();
    }
  }, [open, phoneNumberId]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_dispatcher_configs')
        .select('*')
        .eq('phone_number_id', phoneNumberId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({
          business_name: data.business_name || '',
          business_type: data.business_type || 'General Service',
          business_greeting: data.business_greeting || '',
          diagnostic_fee: data.diagnostic_fee || 75,
          emergency_surcharge: data.emergency_surcharge || 50,
          hourly_rate: data.hourly_rate || 100,
          voice_selection: data.voice_selection || 'alloy',
          emergency_detection_enabled: data.emergency_detection_enabled ?? true
        });
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
      toast.error("Failed to load AI configuration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_dispatcher_configs')
        .upsert({
          phone_number_id: phoneNumberId,
          ...config
        });

      if (error) {
        throw error;
      }

      toast.success(`AI Dispatcher configuration updated for ${phoneNumber}`);

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving AI config:', error);
      toast.error("Failed to save AI configuration. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field: keyof AIConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center p-12">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Loading AI Configuration</p>
            <p className="text-sm text-gray-500">Please wait while we fetch your settings...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Dispatcher Settings
                </span>
                <div className="text-sm font-normal text-gray-500 mt-1">
                  Configure AI for {phoneNumber}
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-blue-400" />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Business Information */}
            <Card className="border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Business Information
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Configure how your AI represents your business to customers</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_name" className="text-sm font-medium">Business Name</Label>
                    <Input
                      id="business_name"
                      value={config.business_name}
                      onChange={(e) => updateConfig('business_name', e.target.value)}
                      placeholder="Your Business Name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_type" className="text-sm font-medium">Business Type</Label>
                    <Select value={config.business_type} onValueChange={(value) => updateConfig('business_type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="business_greeting" className="text-sm font-medium">AI Greeting Message</Label>
                  <Textarea
                    id="business_greeting"
                    value={config.business_greeting}
                    onChange={(e) => updateConfig('business_greeting', e.target.value)}
                    placeholder="Thank you for calling [Business Name]. How can I help you today?"
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Use [Business Name] as a placeholder for your business name
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Configuration */}
            <Card className="border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Pricing Configuration
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Set pricing that your AI will communicate to customers</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="diagnostic_fee" className="text-sm font-medium">Diagnostic Fee</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="diagnostic_fee"
                        type="number"
                        value={config.diagnostic_fee}
                        onChange={(e) => updateConfig('diagnostic_fee', parseFloat(e.target.value) || 0)}
                        className="pl-7"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="emergency_surcharge" className="text-sm font-medium">Emergency Surcharge</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="emergency_surcharge"
                        type="number"
                        value={config.emergency_surcharge}
                        onChange={(e) => updateConfig('emergency_surcharge', parseFloat(e.target.value) || 0)}
                        className="pl-7"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate" className="text-sm font-medium">Hourly Rate</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="hourly_rate"
                        type="number"
                        value={config.hourly_rate}
                        onChange={(e) => updateConfig('hourly_rate', parseFloat(e.target.value) || 0)}
                        className="pl-7"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Behavior */}
            <Card className="border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-purple-600" />
                  AI Behavior
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Customize how your AI sounds and behaves during calls</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label htmlFor="voice_selection" className="text-sm font-medium">Voice Selection</Label>
                  <Select value={config.voice_selection} onValueChange={(value) => updateConfig('voice_selection', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map(voice => (
                        <SelectItem key={voice.value} value={voice.value}>{voice.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <Label htmlFor="emergency_detection" className="text-sm font-medium">Emergency Detection</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Automatically detect emergency situations and prioritize calls
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="emergency_detection"
                    checked={config.emergency_detection_enabled}
                    onCheckedChange={(checked) => updateConfig('emergency_detection_enabled', checked)}
                    className="data-[state=checked]:bg-red-600"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6" />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveConfig} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving Configuration...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

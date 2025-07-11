
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Brain, Save, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface AIConfig {
  id?: string;
  business_niche: string;
  diagnostic_price: number;
  emergency_surcharge: number;
  custom_prompt_additions: string;
  is_active: boolean;
}

export const AISettings = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<AIConfig>({
    business_niche: 'General Service',
    diagnostic_price: 75.00,
    emergency_surcharge: 50.00,
    custom_prompt_additions: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchAIConfig();
  }, [user]);

  const fetchAIConfig = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching AI config:', error);
        toast.error('Failed to load AI configuration');
        return;
      }

      if (data) {
        setConfig({
          id: data.id,
          business_niche: data.business_niche || 'General Service',
          diagnostic_price: data.diagnostic_price || 75.00,
          emergency_surcharge: data.emergency_surcharge || 50.00,
          custom_prompt_additions: data.custom_prompt_additions || '',
          is_active: data.is_active ?? true
        });
        console.log('Loaded AI config:', data);
      }
    } catch (error) {
      console.error('Error fetching AI config:', error);
      toast.error('Failed to load AI configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAIConfig = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsSaving(true);
    console.log('Saving AI config:', config);
    
    try {
      const configData = {
        user_id: user.id,
        business_niche: config.business_niche,
        diagnostic_price: Number(config.diagnostic_price),
        emergency_surcharge: Number(config.emergency_surcharge),
        custom_prompt_additions: config.custom_prompt_additions || null,
        is_active: config.is_active,
        updated_at: new Date().toISOString()
      };

      console.log('Config data to save:', configData);

      if (config.id) {
        // Update existing config
        const { data, error } = await supabase
          .from('ai_agent_configs')
          .update(configData)
          .eq('id', config.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        console.log('Updated config:', data);
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('ai_agent_configs')
          .insert(configData)
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        console.log('Created config:', data);
        setConfig(prev => ({ ...prev, id: data.id }));
      }

      setLastSaved(new Date());
      toast.success('AI configuration saved successfully');
      
      // Refresh the data to ensure consistency
      await fetchAIConfig();
      
    } catch (error) {
      console.error('Error saving AI config:', error);
      toast.error(`Failed to save AI configuration: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof AIConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI Dispatcher Settings</h2>
        <p className="text-gray-600">
          Configure your AI dispatcher that will handle incoming calls and schedule appointments automatically.
        </p>
        {lastSaved && (
          <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Last saved: {lastSaved.toLocaleString()}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-fixlyfy" />
            AI Dispatcher Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agent Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">AI Dispatcher Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable the AI dispatcher for automatic call handling
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Badge variant={config.is_active ? 'success' : 'secondary'}>
                {config.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Business Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_niche">Business Type/Niche</Label>
              <Input
                id="business_niche"
                value={config.business_niche}
                onChange={(e) => handleInputChange('business_niche', e.target.value)}
                placeholder="e.g., HVAC, Plumbing, Electrical, General Repair"
              />
              <p className="text-xs text-muted-foreground">
                This helps the AI understand your business context
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnostic_price">Diagnostic Fee ($)</Label>
              <Input
                id="diagnostic_price"
                type="number"
                step="0.01"
                min="0"
                value={config.diagnostic_price}
                onChange={(e) => handleInputChange('diagnostic_price', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Standard diagnostic fee the AI will quote to customers
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="emergency_surcharge">Emergency Service Surcharge ($)</Label>
              <Input
                id="emergency_surcharge"
                type="number"
                step="0.01"
                min="0"
                value={config.emergency_surcharge}
                onChange={(e) => handleInputChange('emergency_surcharge', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Additional fee for emergency or after-hours service calls
              </p>
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="custom_prompt">Custom Instructions for AI Dispatcher</Label>
            <Textarea
              id="custom_prompt"
              value={config.custom_prompt_additions}
              onChange={(e) => handleInputChange('custom_prompt_additions', e.target.value)}
              placeholder="Add specific instructions for how your AI dispatcher should handle calls..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Example: "Always ask about warranty status", "Mention our 24/7 emergency service", "Ask about previous service history"
            </p>
          </div>

          {/* Phone Number Info */}
          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Test Phone Number: +1 833-574-3145</p>
              <ul className="mt-1 text-blue-700 list-disc list-inside space-y-1">
                <li>Call this number to test your AI dispatcher</li>
                <li>Make sure to save your configuration first</li>
                <li>The AI will use the settings configured above</li>
                <li>Check the edge function logs if you encounter issues</li>
              </ul>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveAIConfig} 
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Receipt, DollarSign, Loader2, Save, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface NumberingConfig {
  entity_type: string;
  prefix: string;
  current_value: number;
  start_value: number;
}

const DEFAULT_CONFIGS: NumberingConfig[] = [
  { entity_type: 'invoice', prefix: 'INV', current_value: 1000, start_value: 1000 },
  { entity_type: 'estimate', prefix: '', current_value: 100, start_value: 100 },
  { entity_type: 'payment', prefix: 'PAY', current_value: 1000, start_value: 1000 },
];

export const DocumentNumberingConfig = () => {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<NumberingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('id_counters')
        .select('*')
        .in('entity_type', ['invoice', 'estimate', 'payment'])
        .order('entity_type');

      if (error) throw error;

      // Merge with defaults to ensure all types are present
      const mergedConfigs = DEFAULT_CONFIGS.map(defaultConfig => {
        const existing = data?.find(d => d.entity_type === defaultConfig.entity_type);
        return existing || defaultConfig;
      });

      setConfigs(mergedConfigs);
    } catch (error) {
      console.error('Error fetching numbering configs:', error);
      toast.error('Failed to load numbering configuration');
      setConfigs(DEFAULT_CONFIGS);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (entityType: string, field: 'prefix' | 'start_value', value: string | number) => {
    setConfigs(prev => prev.map(config => {
      if (config.entity_type === entityType) {
        if (field === 'start_value') {
          const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
          
          // Validate that new number is higher than current counter
          if (numValue <= config.current_value) {
            setValidationErrors(prev => ({
              ...prev,
              [entityType]: `Number must be higher than current counter (${config.current_value})`
            }));
          } else {
            setValidationErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[entityType];
              return newErrors;
            });
          }
          
          return { 
            ...config, 
            [field]: numValue
          };
        }
        return { ...config, [field]: value as string };
      }
      return config;
    }));
  };

  const handleSave = async () => {
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      // Update each config using the new simple function
      for (const config of configs) {
        if (config.start_value > config.current_value) {
          const { data, error } = await supabase.rpc(
            'update_document_counter_higher_only',
            {
              p_user_id: user?.id,
              p_document_type: config.entity_type,
              p_new_number: config.start_value
            }
          );

          if (error) throw error;
          
          const result = data as any;
          if (!result.success) {
            toast.error(result.error);
            return;
          }
        } else {
          // Just update prefix if no number change
          const { error } = await supabase
            .from('id_counters')
            .update({
              prefix: config.prefix,
              updated_at: new Date().toISOString()
            })
            .eq('entity_type', config.entity_type)
            .eq('user_id', user?.id);

          if (error) throw error;
        }
      }

      await fetchConfigs(); // Refresh to show updated values
      toast.success('Document numbering configuration saved successfully');
    } catch (error) {
      console.error('Error saving numbering configs:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (entityType: string) => {
    const config = configs.find(c => c.entity_type === entityType);
    if (!config) return;

    // Check if there's a validation error
    if (validationErrors[entityType]) {
      toast.error(validationErrors[entityType]);
      return;
    }

    if (config.start_value <= config.current_value) {
      toast.error(`New number must be higher than current counter (${config.current_value})`);
      return;
    }

    try {
      const { data, error } = await supabase.rpc(
        'update_document_counter_higher_only',
        {
          p_user_id: user?.id,
          p_document_type: entityType,
          p_new_number: config.start_value
        }
      );

      if (error) throw error;
      
      const result = data as any;
      if (result.success) {
        toast.success(result.message);
        await fetchConfigs();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error updating counter:', error);
      toast.error('Failed to update counter');
    }
  };

  const getIcon = (entityType: string) => {
    switch (entityType) {
      case 'invoice':
        return <Receipt className="h-5 w-5" />;
      case 'estimate':
        return <FileText className="h-5 w-5" />;
      case 'payment':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTitle = (entityType: string) => {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1) + 's';
  };

  const getExample = (config: NumberingConfig) => {
    const nextNumber = config.current_value + 1;
    if (config.prefix) {
      return `${config.prefix}-${nextNumber}`;
    }
    return nextNumber.toString();
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Document Numbering</h3>
        <p className="text-sm text-muted-foreground">
          Configure how invoices, estimates, and payments are numbered
        </p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Higher Numbers Only</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>✅ <strong>Simple & Safe:</strong> You can only set numbers higher than your current counter to prevent duplicates.</p>
          <p>🔢 <strong>Current Counter:</strong> Shows your current counter value - new numbers must be higher than this.</p>
          <p>⚡ <strong>Instant Validation:</strong> The system validates your input immediately and prevents invalid changes.</p>
          <p><strong>Example:</strong> If your current counter is 1005, you can set it to 1100, 1200, etc., but not 1000.</p>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {configs.map((config) => (
          <Card key={config.entity_type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getIcon(config.entity_type)}
                {getTitle(config.entity_type)}
              </CardTitle>
              <CardDescription>
                Configure numbering for {config.entity_type}s
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${config.entity_type}-prefix`}>
                    Prefix (optional)
                  </Label>
                  <Input
                    id={`${config.entity_type}-prefix`}
                    value={config.prefix}
                    onChange={(e) => handleConfigChange(config.entity_type, 'prefix', e.target.value)}
                    placeholder="e.g., INV"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${config.entity_type}-start`}>
                    Starting Number
                  </Label>
                  <div className="space-y-1">
                    <Input
                      id={`${config.entity_type}-start`}
                      type="number"
                      value={config.start_value}
                      onChange={(e) => handleConfigChange(config.entity_type, 'start_value', e.target.value)}
                      min={config.current_value + 1}
                      className={validationErrors[config.entity_type] ? 'border-red-500' : ''}
                    />
                    {validationErrors[config.entity_type] && (
                      <p className="text-sm text-red-500">{validationErrors[config.entity_type]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Next Number Preview</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={getExample(config)}
                      readOnly
                      className="bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdate(config.entity_type)}
                      disabled={config.start_value <= config.current_value || !!validationErrors[config.entity_type]}
                      className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div>Current counter value: {config.current_value}</div>
                <div className="text-xs text-blue-600 font-medium">
                  💡 Enter a number higher than {config.current_value} to update the counter
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
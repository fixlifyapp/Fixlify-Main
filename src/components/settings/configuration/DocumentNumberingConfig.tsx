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
          return { 
            ...config, 
            [field]: numValue,
            // If changing start value and current is less, update current too
            current_value: Math.max(config.current_value, numValue - 1)
          };
        }
        // Don't modify the prefix - preserve the case as entered
        return { ...config, [field]: value as string };
      }
      return config;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update each config
      for (const config of configs) {
        const { error } = await supabase
          .from('id_counters')
          .upsert({
            entity_type: config.entity_type,
            prefix: config.prefix,
            start_value: config.start_value,
            current_value: Math.max(config.current_value, config.start_value - 1),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'entity_type'
          });

        if (error) throw error;
      }

      toast.success('Document numbering configuration saved successfully');
    } catch (error) {
      console.error('Error saving numbering configs:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (entityType: string) => {
    const config = configs.find(c => c.entity_type === entityType);
    if (!config) return;

    try {
      // Get suggestions for safe reset
      const { data: safeValue, error: suggestionError } = await supabase.rpc(
        'suggest_safe_reset_value',
        { 
          p_user_id: user?.id,
          p_document_type: entityType
        }
      );

      if (suggestionError) throw suggestionError;

      // Enhanced confirmation with smart suggestions
      const confirmMessage = `⚠️ DUPLICATE PREVENTION SYSTEM

Current situation:
- Current counter: ${config.current_value}
- Suggested safe value: ${safeValue}

The system has analyzed your existing ${entityType}s and suggests starting from ${safeValue} to avoid duplicates.

Options:
1. Use suggested safe value (${safeValue}) - RECOMMENDED
2. Cancel and set a custom value manually

Choose "OK" to use the safe value (${safeValue}) or "Cancel" to abort.`;

      if (!confirm(confirmMessage)) {
        return;
      }

      // Use the smart reset function
      const { data: result, error: resetError } = await supabase.rpc(
        'safe_reset_document_counter',
        { 
          p_user_id: user?.id,
          p_document_type: entityType,
          p_new_start_value: safeValue
        }
      );

      if (resetError) throw resetError;

      const resultData = result as any;
      if (resultData?.success) {
        toast.success(`✅ ${resultData.message}. Next ${entityType} will be #${resultData.next_number}.`);
        await fetchConfigs();
      } else {
        toast.error(resultData?.error || 'Reset failed');
      }
    } catch (error) {
      console.error('Error resetting counter:', error);
      toast.error('Failed to reset counter');
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

  const getDuplicateStatus = async (entityType: string) => {
    try {
      const { data: highest, error } = await supabase.rpc(
        'get_highest_document_number',
        { 
          p_user_id: user?.id,
          p_document_type: entityType
        }
      );

      if (error) return null;
      
      const config = configs.find(c => c.entity_type === entityType);
      const nextNumber = config ? config.current_value + 1 : 0;
      
      return {
        highest,
        nextNumber,
        wouldDuplicate: nextNumber <= highest
      };
    } catch {
      return null;
    }
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
        <AlertTitle>Smart Duplicate Prevention System</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>✅ <strong>Automatic Protection:</strong> The system analyzes your existing documents and suggests safe reset values to prevent duplicates.</p>
          <p>🔍 <strong>Smart Analysis:</strong> Before any reset, the system checks your highest document numbers and recommends safe starting points.</p>
          <p>⚡ <strong>One-Click Safety:</strong> The reset function automatically calculates safe values - no manual checking needed!</p>
          <p><strong>Best Practice:</strong> Always use the system's suggested values for guaranteed duplicate prevention.</p>
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
                  <Input
                    id={`${config.entity_type}-start`}
                    type="number"
                    value={config.start_value}
                    onChange={(e) => handleConfigChange(config.entity_type, 'start_value', e.target.value)}
                    min="1"
                  />
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
                      size="icon"
                      onClick={() => handleReset(config.entity_type)}
                      title={`Smart Reset - Automatically calculates safe value`}
                      className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div>Current counter value: {config.current_value}</div>
                <div className="text-xs text-green-600 font-medium">
                  ✅ Smart reset available - automatically prevents duplicates
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
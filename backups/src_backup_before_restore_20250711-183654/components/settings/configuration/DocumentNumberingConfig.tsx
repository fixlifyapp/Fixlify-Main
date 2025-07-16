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
        return { ...config, [field]: value };
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

    if (!confirm(`Are you sure you want to reset the ${entityType} counter to ${config.start_value}? This will affect all future ${entityType} numbers.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('id_counters')
        .update({
          current_value: config.start_value - 1,
          updated_at: new Date().toISOString()
        })
        .eq('entity_type', entityType);

      if (error) throw error;

      toast.success(`${entityType} counter reset successfully`);
      await fetchConfigs();
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
        <AlertTitle>How Document Numbering Works</AlertTitle>
        <AlertDescription>
          Each document type can have a prefix and a starting number. The system will automatically increment 
          the number for each new document. You can reset the counter to the starting value if needed.
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
                      title={`Reset ${config.entity_type} counter`}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Current counter value: {config.current_value}
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
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Globe, Zap, Calendar } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';

interface SmartTimingOptionsProps {
  config: any;
  onConfigChange: (config: any) => void;
  stepId?: string; // Add stepId to track which step this timing belongs to
}

export const SmartTimingOptions: React.FC<SmartTimingOptionsProps> = ({ 
  config, 
  onConfigChange,
  stepId 
}) => {
  const { companySettings, isLoading } = useCompanySettings();
  
  // Initialize with config from props if available, otherwise use defaults
  const [timingConfig, setTimingConfig] = useState({
    businessHours: config?.businessHours ?? true,
    businessStart: config?.businessStart ?? '09:00',
    businessEnd: config?.businessEnd ?? '17:00',
    timezone: config?.timezone ?? 'customer_local',
    quietHours: config?.quietHours ?? true,
    quietStart: config?.quietStart ?? '21:00',
    quietEnd: config?.quietEnd ?? '08:00',
    optimalSend: config?.optimalSend ?? false,
    recurring: config?.recurring ?? false,
    recurringType: config?.recurringType ?? 'none'
  });

  // Update timing config when company settings change
  useEffect(() => {
    if (companySettings?.business_hours && !config?.businessStart) {
      const businessHours = companySettings.business_hours;
      // Find the first enabled day to get default business hours
      const enabledDay = Object.keys(businessHours).find(day => 
        businessHours[day]?.enabled && businessHours[day]?.open && businessHours[day]?.close
      );
      
      if (enabledDay) {
        const defaultStart = businessHours[enabledDay].open || '09:00';
        const defaultEnd = businessHours[enabledDay].close || '17:00';
        
        setTimingConfig(prev => ({
          ...prev,
          businessStart: defaultStart,
          businessEnd: defaultEnd
        }));
        
        // Also update parent immediately with company defaults
        onConfigChange({
          ...timingConfig,
          businessStart: defaultStart,
          businessEnd: defaultEnd
        });
      }
    }
  }, [companySettings, config?.businessStart]);

  // Update local state when config prop changes
  useEffect(() => {
    if (config) {
      setTimingConfig({
        businessHours: config.businessHours ?? true,
        businessStart: config.businessStart ?? '09:00',
        businessEnd: config.businessEnd ?? '17:00',
        timezone: config.timezone ?? 'customer_local',
        quietHours: config.quietHours ?? true,
        quietStart: config.quietStart ?? '21:00',
        quietEnd: config.quietEnd ?? '08:00',
        optimalSend: config.optimalSend ?? false,
        recurring: config.recurring ?? false,
        recurringType: config.recurringType ?? 'none'
      });
    }
  }, [config]);

  // Handler for updating timing config and notifying parent
  const updateTimingConfig = (updates: Partial<typeof timingConfig>) => {
    const newConfig = { ...timingConfig, ...updates };
    setTimingConfig(newConfig);
    // Immediately notify parent of changes
    onConfigChange(newConfig);
  };

  // Format time for display (convert 24h to 12h format)
  const formatTimeDisplay = (time24: string): string => {
    try {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time24;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Timing Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Business Hours */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Label>Send during business hours only</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={timingConfig.businessHours}
                onCheckedChange={(checked) =>
                  updateTimingConfig({ businessHours: checked })
                }
              />
              {timingConfig.businessHours && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={timingConfig.businessStart}
                    onChange={(e) =>
                      updateTimingConfig({ businessStart: e.target.value })
                    }
                    className="w-24 h-8"
                  />
                  <span className="text-sm">to</span>
                  <Input
                    type="time"
                    value={timingConfig.businessEnd}
                    onChange={(e) =>
                      updateTimingConfig({ businessEnd: e.target.value })
                    }
                    className="w-24 h-8"
                  />
                </div>
              )}
            </div>
          </div>
          
          {timingConfig.businessHours && (
            <div className="text-xs text-muted-foreground pl-6">
              Messages will only be sent between {formatTimeDisplay(timingConfig.businessStart)} and {formatTimeDisplay(timingConfig.businessEnd)}
            </div>
          )}

          {/* Quiet Hours */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <Label>Respect quiet hours</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={timingConfig.quietHours}
                onCheckedChange={(checked) =>
                  updateTimingConfig({ quietHours: checked })
                }
              />
              {timingConfig.quietHours && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={timingConfig.quietStart}
                    onChange={(e) =>
                      updateTimingConfig({ quietStart: e.target.value })
                    }
                    className="w-24 h-8"
                  />
                  <span className="text-sm">to</span>
                  <Input
                    type="time"
                    value={timingConfig.quietEnd}
                    onChange={(e) =>
                      updateTimingConfig({ quietEnd: e.target.value })
                    }
                    className="w-24 h-8"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Label>Timezone</Label>
            </div>
            <Select
              value={timingConfig.timezone}
              onValueChange={(value) =>
                updateTimingConfig({ timezone: value })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_local">Customer's Local Time</SelectItem>
                <SelectItem value="business">
                  Business Time {(companySettings as any)?.company_timezone && 
                    `(${(companySettings as any).company_timezone})`}
                </SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optimal Send Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label>AI Optimal Send Time</Label>
                <p className="text-xs text-muted-foreground">
                  AI learns the best time to reach each customer
                </p>
              </div>
            </div>
            <Switch
              checked={timingConfig.optimalSend}
              onCheckedChange={(checked) =>
                updateTimingConfig({ optimalSend: checked })
              }
            />
          </div>

          {/* Recurring Schedule */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Label>Recurring Schedule</Label>
            </div>
            <Select
              value={timingConfig.recurringType}
              onValueChange={(value) =>
                updateTimingConfig({ 
                  recurringType: value, 
                  recurring: value !== 'none' 
                })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                <SelectItem value="6months">Semi-annually (6 months)</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="2years">Every 2 years</SelectItem>
                <SelectItem value="3years">Every 3 years</SelectItem>
                <SelectItem value="4years">Every 4 years</SelectItem>
                <SelectItem value="5years">Every 5 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

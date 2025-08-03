import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, UserPlus, AlertCircle, DollarSign, MessageSquare, 
  Mail, Phone, Package, Clock, Calendar, ArrowRight
} from 'lucide-react';
import { TRIGGER_DEFINITIONS, TriggerTypes } from '@/types/automationFramework';
import { TriggerStatusChangeConfig } from './TriggerStatusChangeConfig';
import { useJobTypes } from '@/hooks/useConfigItems';

interface EnhancedTriggerSelectorProps {
  onTriggerSelect: (trigger: { type: keyof TriggerTypes; config: any; name: string }) => void;
  initialTrigger?: { type: keyof TriggerTypes; config: any; name: string };
}

export const EnhancedTriggerSelector: React.FC<EnhancedTriggerSelectorProps> = ({
  onTriggerSelect,
  initialTrigger
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTrigger, setSelectedTrigger] = useState<keyof TriggerTypes | null>(
    initialTrigger?.type || null
  );
  const [triggerConfig, setTriggerConfig] = useState<any>(initialTrigger?.config || {});

  const triggerCategories = {
    all: 'All Triggers',
    job_management: 'Job Management',
    client_management: 'Client Management', 
    financial: 'Financial',
    communication: 'Communication',
    inventory: 'Inventory',
    time_based: 'Time-Based'
  };

  const triggerIcons = {
    job_created: Briefcase,
    job_status_changed: Briefcase,
    job_scheduled: Calendar,
    job_completed: Briefcase,
    client_created: UserPlus,
    client_updated: UserPlus,
    estimate_sent: DollarSign,
    estimate_accepted: DollarSign,
    invoice_sent: DollarSign,
    invoice_overdue: AlertCircle,
    payment_received: DollarSign,
    sms_received: MessageSquare,
    email_received: Mail,
    call_missed: Phone,
    product_low_stock: Package,
    scheduled_time: Clock,
    relative_time: Clock
  };

  const triggers = [
    {
      key: 'job_created' as keyof TriggerTypes,
      name: 'Job Created',
      description: 'Triggered when a new job is created',
      category: 'job_management',
      icon: Briefcase
    },
    {
      key: 'job_status_changed' as keyof TriggerTypes,
      name: 'Job Status Changed',
      description: 'Triggered when job status changes',
      category: 'job_management',
      icon: Briefcase
    },
    {
      key: 'job_completed' as keyof TriggerTypes,
      name: 'Job Completed',
      description: 'Triggered when a job is marked as completed',
      category: 'job_management',
      icon: Briefcase
    },
    {
      key: 'client_created' as keyof TriggerTypes,
      name: 'New Client Added',
      description: 'Triggered when a new client is added',
      category: 'client_management',
      icon: UserPlus
    },
    {
      key: 'invoice_overdue' as keyof TriggerTypes,
      name: 'Invoice Overdue',
      description: 'Triggered when an invoice becomes overdue',
      category: 'financial',
      icon: AlertCircle
    },
    {
      key: 'payment_received' as keyof TriggerTypes,
      name: 'Payment Received',
      description: 'Triggered when payment is received',
      category: 'financial',
      icon: DollarSign
    },
    {
      key: 'sms_received' as keyof TriggerTypes,
      name: 'SMS Received',
      description: 'Triggered when SMS is received from client',
      category: 'communication',
      icon: MessageSquare
    },
    {
      key: 'scheduled_time' as keyof TriggerTypes,
      name: 'Scheduled Time',
      description: 'Triggered at scheduled intervals',
      category: 'time_based',
      icon: Clock
    }
  ];

  const filteredTriggers = triggers.filter(trigger => 
    selectedCategory === 'all' || trigger.category === selectedCategory
  );

  const handleTriggerSelect = (triggerKey: keyof TriggerTypes) => {
    setSelectedTrigger(triggerKey);
    setTriggerConfig({});
  };

  const handleConfigChange = (field: string, value: any) => {
    const newConfig = { ...triggerConfig, [field]: value };
    setTriggerConfig(newConfig);
  };

  const handleConfirmTrigger = () => {
    if (selectedTrigger) {
      const trigger = triggers.find(t => t.key === selectedTrigger);
      onTriggerSelect({
        type: selectedTrigger,
        config: triggerConfig,
        name: trigger?.name || selectedTrigger
      });
    }
  };

  const renderConfigFields = () => {
    if (!selectedTrigger) return null;

    switch (selectedTrigger) {
      case 'job_created':
        return (
          <div className="space-y-4">
            <div>
              <Label>Job Types (Optional)</Label>
              <Select onValueChange={(value) => handleConfigChange('job_type', [value])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority (Optional)</Label>
              <Select onValueChange={(value) => handleConfigChange('priority', [value])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'invoice_overdue':
        return (
          <div className="space-y-4">
            <div>
              <Label>Days Overdue</Label>
              <Input
                type="number"
                placeholder="1"
                value={triggerConfig.days_overdue || ''}
                onChange={(e) => handleConfigChange('days_overdue', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label>Minimum Amount ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={triggerConfig.amount_range?.min || ''}
                onChange={(e) => handleConfigChange('amount_range', {
                  ...triggerConfig.amount_range,
                  min: parseFloat(e.target.value)
                })}
              />
            </div>
          </div>
        );

      case 'scheduled_time':
        return (
          <div className="space-y-4">
            <div>
              <Label>Frequency</Label>
              <Select onValueChange={(value) => handleConfigChange('frequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={triggerConfig.time || ''}
                onChange={(e) => handleConfigChange('time', e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            This trigger will activate whenever the event occurs. No additional configuration needed.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {!selectedTrigger ? (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(triggerCategories).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Trigger Selection Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTriggers.map((trigger) => {
              const IconComponent = trigger.icon;
              return (
                <Card 
                  key={trigger.key}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => handleTriggerSelect(trigger.key)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-8 h-8 text-primary" />
                      <div>
                        <CardTitle className="text-base">{trigger.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {triggerCategories[trigger.category as keyof typeof triggerCategories]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{trigger.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        /* Configuration Panel */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const IconComponent = triggerIcons[selectedTrigger];
                  return <IconComponent className="w-8 h-8 text-primary" />;
                })()}
                <div>
                  <CardTitle>
                    {triggers.find(t => t.key === selectedTrigger)?.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {triggers.find(t => t.key === selectedTrigger)?.description}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedTrigger(null)}
              >
                Change
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderConfigFields()}
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleConfirmTrigger} className="gap-2">
                <ArrowRight className="w-4 h-4" />
                Confirm Trigger
              </Button>
              <Button variant="outline" onClick={() => setSelectedTrigger(null)}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
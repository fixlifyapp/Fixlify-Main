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
  Mail, Phone, Package, Clock, Calendar, ArrowRight, Settings
} from 'lucide-react';
import { useEnhancedWorkflowData } from '@/hooks/useEnhancedWorkflowData';

interface SmartTriggerSelectorProps {
  onTriggerSelect: (trigger: { type: string; config: any; name: string }) => void;
  initialTrigger?: { type: string; config: any; name: string };
}

export const SmartTriggerSelector: React.FC<SmartTriggerSelectorProps> = ({
  onTriggerSelect,
  initialTrigger
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(
    initialTrigger?.type || null
  );
  const [triggerConfig, setTriggerConfig] = useState<any>(initialTrigger?.config || {});
  
  const { 
    contextData, 
    getJobStatusOptions, 
    getJobTypeOptions, 
    getTeamMemberOptions,
    getBusinessType,
    getCompanyName 
  } = useEnhancedWorkflowData();

  const triggerCategories = {
    all: 'All Triggers',
    job_management: 'Job Management',
    client_management: 'Client Management', 
    financial: 'Financial',
    time_based: 'Time-Based'
  };

  const triggers = [
    {
      key: 'job_created',
      name: 'Job Created',
      description: `Triggered when a new ${getBusinessType().toLowerCase()} job is created`,
      category: 'job_management',
      icon: Briefcase,
      contextFields: ['job_type', 'priority', 'assigned_technician']
    },
    {
      key: 'job_status_changed',
      name: 'Job Status Changed',
      description: 'Triggered when job status changes to specific values',
      category: 'job_management',
      icon: Briefcase,
      contextFields: ['from_status', 'to_status', 'job_type']
    },
    {
      key: 'job_completed',
      name: 'Job Completed',
      description: 'Triggered when a job is marked as completed',
      category: 'job_management',
      icon: Briefcase,
      contextFields: ['completion_time', 'technician']
    },
    {
      key: 'client_created',
      name: 'New Client Added',
      description: `Triggered when a new client is added to ${getCompanyName()}`,
      category: 'client_management',
      icon: UserPlus,
      contextFields: ['lead_source', 'client_type']
    },
    {
      key: 'invoice_overdue',
      name: 'Invoice Overdue',
      description: 'Triggered when an invoice becomes overdue',
      category: 'financial',
      icon: AlertCircle,
      contextFields: ['days_overdue', 'amount_range', 'client_segment']
    },
    {
      key: 'payment_received',
      name: 'Payment Received',
      description: 'Triggered when payment is received',
      category: 'financial',
      icon: DollarSign,
      contextFields: ['payment_method', 'amount_range']
    },
    {
      key: 'scheduled_time',
      name: 'Scheduled Time',
      description: 'Triggered at scheduled intervals during business hours',
      category: 'time_based',
      icon: Clock,
      contextFields: ['frequency', 'time', 'business_hours_only']
    }
  ];

  const filteredTriggers = triggers.filter(trigger => 
    selectedCategory === 'all' || trigger.category === selectedCategory
  );

  const handleTriggerSelect = (triggerKey: string) => {
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

  const renderSmartConfigFields = () => {
    if (!selectedTrigger) return null;

    const jobStatusOptions = getJobStatusOptions();
    const jobTypeOptions = getJobTypeOptions();
    const teamMemberOptions = getTeamMemberOptions();

    switch (selectedTrigger) {
      case 'job_created':
        return (
          <div className="space-y-4">
            <div>
              <Label>Job Types (Optional)</Label>
              <Select onValueChange={(value) => handleConfigChange('job_type', [value])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job types from your business" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.color && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
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
            <div>
              <Label>Assigned Technician (Optional)</Label>
              <Select onValueChange={(value) => handleConfigChange('assigned_technician', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMemberOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'job_status_changed':
        return (
          <div className="space-y-4">
            <div>
              <Label>From Status (Optional)</Label>
              <Select onValueChange={(value) => handleConfigChange('from_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select starting status" />
                </SelectTrigger>
                <SelectContent>
                  {jobStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>To Status *</Label>
              <Select onValueChange={(value) => handleConfigChange('to_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target status" />
                </SelectTrigger>
                <SelectContent>
                  {jobStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job Type (Optional)</Label>
              <Select onValueChange={(value) => handleConfigChange('job_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
            <div>
              <Label>Maximum Amount ($)</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={triggerConfig.amount_range?.max || ''}
                onChange={(e) => handleConfigChange('amount_range', {
                  ...triggerConfig.amount_range,
                  max: parseFloat(e.target.value)
                })}
              />
            </div>
          </div>
        );

      case 'payment_received':
        return (
          <div className="space-y-4">
            <div>
              <Label>Payment Method (Optional)</Label>
              <Select onValueChange={(value) => handleConfigChange('payment_method', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any payment method" />
                </SelectTrigger>
                <SelectContent>
                  {contextData.paymentMethods.map(method => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center gap-2">
                        {method.color && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: method.color }}
                          />
                        )}
                        {method.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="quarterly">Quarterly</SelectItem>
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="business_hours_only"
                checked={triggerConfig.business_hours_only || false}
                onChange={(e) => handleConfigChange('business_hours_only', e.target.checked)}
              />
              <Label htmlFor="business_hours_only">Only during business hours</Label>
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
          {/* Business Context Info */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Business Context</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Company: {getCompanyName()}</p>
              <p>Business Type: {getBusinessType()}</p>
              <p>Available Job Types: {contextData.jobTypes.length}</p>
              <p>Team Members: {contextData.teamMembers.length}</p>
            </div>
          </div>

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

          {/* Smart Trigger Selection Grid */}
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
                    {trigger.contextFields && (
                      <div className="mt-2">
                        <p className="text-xs text-primary font-medium">Smart Options:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {trigger.contextFields.slice(0, 3).map(field => (
                            <Badge key={field} variant="secondary" className="text-xs">
                              {field.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        /* Smart Configuration Panel */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const trigger = triggers.find(t => t.key === selectedTrigger);
                  const IconComponent = trigger?.icon || Clock;
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
            {renderSmartConfigFields()}
            
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
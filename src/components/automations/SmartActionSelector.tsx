import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, Mail, Phone, CheckSquare, Briefcase, 
  User, DollarSign, Bell, ArrowRight, Bot, Settings
} from 'lucide-react';
import { useEnhancedWorkflowData } from '@/hooks/useEnhancedWorkflowData';
import { automationVariables } from '@/utils/automation-variables';

interface SmartActionSelectorProps {
  onActionSelect: (action: { type: string; config: any; name: string }) => void;
  initialAction?: { type: string; config: any; name: string };
}

export const SmartActionSelector: React.FC<SmartActionSelectorProps> = ({
  onActionSelect,
  initialAction
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string | null>(
    initialAction?.type || null
  );
  const [actionConfig, setActionConfig] = useState<any>(initialAction?.config || {});
  
  const { 
    contextData, 
    getJobStatusOptions, 
    getJobTypeOptions, 
    getTeamMemberOptions,
    getBusinessType,
    getCompanyName 
  } = useEnhancedWorkflowData();

  const actionCategories = {
    all: 'All Actions',
    communication: 'Communication',
    business_process: 'Business Process',
    ai_powered: 'AI-Powered'
  };

  const actions = [
    {
      key: 'send_sms',
      name: 'Send SMS',
      description: `Send SMS to clients using your ${getCompanyName()} messaging`,
      category: 'communication',
      icon: MessageSquare,
      smartFeatures: ['template_variables', 'client_context', 'business_hours']
    },
    {
      key: 'send_email',
      name: 'Send Email',
      description: `Send branded email from ${getCompanyName()}`,
      category: 'communication',
      icon: Mail,
      smartFeatures: ['template_variables', 'client_context', 'attachments']
    },
    {
      key: 'make_call',
      name: 'Make Call',
      description: 'Initiate AI-powered phone call',
      category: 'communication',
      icon: Phone,
      smartFeatures: ['ai_script', 'call_routing', 'call_recording']
    },
    {
      key: 'send_push_notification',
      name: 'Push Notification',
      description: 'Send notification to team members',
      category: 'communication',
      icon: Bell,
      smartFeatures: ['team_filtering', 'priority_levels']
    },
    {
      key: 'create_task',
      name: 'Create Task',
      description: 'Create task and assign to team members',
      category: 'business_process',
      icon: CheckSquare,
      smartFeatures: ['smart_assignment', 'due_date_calculation', 'priority_auto']
    },
    {
      key: 'create_job',
      name: 'Create Job',
      description: `Create new ${getBusinessType().toLowerCase()} job`,
      category: 'business_process',
      icon: Briefcase,
      smartFeatures: ['job_type_selection', 'auto_scheduling', 'technician_assignment']
    },
    {
      key: 'update_job_status',
      name: 'Update Job Status',
      description: 'Change job status in your workflow',
      category: 'business_process',
      icon: Briefcase,
      smartFeatures: ['status_progression', 'notification_triggers', 'client_updates']
    },
    {
      key: 'assign_technician',
      name: 'Assign Technician',
      description: 'Assign available team member to job',
      category: 'business_process',
      icon: User,
      smartFeatures: ['availability_check', 'skill_matching', 'workload_balance']
    },
    {
      key: 'create_estimate',
      name: 'Create Estimate',
      description: 'Generate estimate with your pricing',
      category: 'business_process',
      icon: DollarSign,
      smartFeatures: ['pricing_templates', 'auto_calculations', 'client_portal']
    },
    {
      key: 'create_invoice',
      name: 'Create Invoice',
      description: 'Generate invoice from job data',
      category: 'business_process',
      icon: DollarSign,
      smartFeatures: ['job_line_items', 'payment_links', 'auto_reminders']
    },
    {
      key: 'ai_generate_response',
      name: 'AI Generate Response',
      description: 'Use AI to generate contextual responses',
      category: 'ai_powered',
      icon: Bot,
      smartFeatures: ['context_awareness', 'tone_matching', 'company_branding']
    }
  ];

  const filteredActions = actions.filter(action => 
    selectedCategory === 'all' || action.category === selectedCategory
  );

  const handleActionSelect = (actionKey: string) => {
    setSelectedAction(actionKey);
    setActionConfig({});
  };

  const handleConfigChange = (field: string, value: any) => {
    const newConfig = { ...actionConfig, [field]: value };
    setActionConfig(newConfig);
  };

  const handleConfirmAction = () => {
    if (selectedAction) {
      const action = actions.find(a => a.key === selectedAction);
      onActionSelect({
        type: selectedAction,
        config: actionConfig,
        name: action?.name || selectedAction
      });
    }
  };

  const insertVariable = (field: string, variable: string) => {
    const currentValue = actionConfig[field] || '';
    const newValue = currentValue + variable;
    handleConfigChange(field, newValue);
  };

  const renderSmartConfigFields = () => {
    if (!selectedAction) return null;

    const jobStatusOptions = getJobStatusOptions();
    const jobTypeOptions = getJobTypeOptions();
    const teamMemberOptions = getTeamMemberOptions();

    switch (selectedAction) {
      case 'send_sms':
        return (
          <div className="space-y-4">
            <div>
              <Label>Send To</Label>
              <Select onValueChange={(value) => handleConfigChange('to', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="technician">Assigned Technician</SelectItem>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="custom">Custom Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message Template *</Label>
              <Textarea
                placeholder="Enter your SMS message..."
                value={actionConfig.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use variables from your business data below
              </p>
            </div>
            <div className="border rounded-lg p-3 bg-muted/30">
              <Label className="text-xs font-medium">Quick Variables</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {[
                  '{{client_name}}',
                  '{{job_title}}',
                  '{{job_date}}',
                  '{{company_name}}',
                  '{{technician_name}}'
                ].map(variable => (
                  <Button
                    key={variable}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => insertVariable('message', ` ${variable}`)}
                  >
                    {variable}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'send_email':
        return (
          <div className="space-y-4">
            <div>
              <Label>Send To</Label>
              <Select onValueChange={(value) => handleConfigChange('to', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="technician">Assigned Technician</SelectItem>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="custom">Custom Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject Line *</Label>
              <Input
                placeholder="Email subject"
                value={actionConfig.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
              />
            </div>
            <div>
              <Label>Email Body *</Label>
              <Textarea
                placeholder="Enter your email message..."
                rows={4}
                value={actionConfig.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
              />
            </div>
            <div className="border rounded-lg p-3 bg-muted/30">
              <Label className="text-xs font-medium">Business Variables</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(automationVariables).map(([category, variables]) => 
                  variables.slice(0, 2).map(variable => (
                    <Button
                      key={variable.key}
                      variant="outline"
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => insertVariable('body', ` ${variable.key}`)}
                    >
                      {variable.key}
                    </Button>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'create_task':
        return (
          <div className="space-y-4">
            <div>
              <Label>Task Title *</Label>
              <Input
                placeholder="Task title"
                value={actionConfig.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label>Assign To</Label>
              <Select onValueChange={(value) => handleConfigChange('assigned_to', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-assign (based on availability)</SelectItem>
                  {teamMemberOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select onValueChange={(value) => handleConfigChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (based on job urgency)</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Select onValueChange={(value) => handleConfigChange('due_date_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Set due date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_date">Same as job date</SelectItem>
                  <SelectItem value="relative">Relative to trigger (+1 day, +1 week, etc.)</SelectItem>
                  <SelectItem value="fixed">Fixed date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'update_job_status':
        return (
          <div className="space-y-4">
            <div>
              <Label>New Status *</Label>
              <Select onValueChange={(value) => handleConfigChange('new_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
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
              <Label>Status Notes</Label>
              <Textarea
                placeholder="Optional notes for status change..."
                value={actionConfig.notes || ''}
                onChange={(e) => handleConfigChange('notes', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notify_client"
                  checked={actionConfig.notify_client || false}
                  onChange={(e) => handleConfigChange('notify_client', e.target.checked)}
                />
                <Label htmlFor="notify_client">Notify client of status change</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notify_technician"
                  checked={actionConfig.notify_technician || false}
                  onChange={(e) => handleConfigChange('notify_technician', e.target.checked)}
                />
                <Label htmlFor="notify_technician">Notify assigned technician</Label>
              </div>
            </div>
          </div>
        );

      case 'create_job':
        return (
          <div className="space-y-4">
            <div>
              <Label>Job Type *</Label>
              <Select onValueChange={(value) => handleConfigChange('job_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
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
              <Label>Job Title</Label>
              <Input
                placeholder="Auto-generated from job type"
                value={actionConfig.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label>Assign Technician</Label>
              <Select onValueChange={(value) => handleConfigChange('technician', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-assign or select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-assign (best available)</SelectItem>
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

      case 'ai_generate_response':
        return (
          <div className="space-y-4">
            <div>
              <Label>Response Context</Label>
              <Select onValueChange={(value) => handleConfigChange('context', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS Response</SelectItem>
                  <SelectItem value="email">Email Response</SelectItem>
                  <SelectItem value="call_script">Call Script</SelectItem>
                  <SelectItem value="review_response">Review Response</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Response Tone</Label>
              <Select onValueChange={(value) => handleConfigChange('tone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="apologetic">Apologetic</SelectItem>
                  <SelectItem value="celebratory">Celebratory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Include Business Context</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include_company_info"
                    checked={actionConfig.include_company_info || true}
                    onChange={(e) => handleConfigChange('include_company_info', e.target.checked)}
                  />
                  <Label htmlFor="include_company_info">Include company information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include_job_details"
                    checked={actionConfig.include_job_details || true}
                    onChange={(e) => handleConfigChange('include_job_details', e.target.checked)}
                  />
                  <Label htmlFor="include_job_details">Include relevant job details</Label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            This action will be executed with smart defaults based on your business setup.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {!selectedAction ? (
        <>
          {/* Business Integration Info */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Smart Integration</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Actions use your actual business data:</p>
              <p>• {contextData.teamMembers.length} team members available for assignment</p>
              <p>• {contextData.jobTypes.length} job types for context</p>
              <p>• {contextData.paymentMethods.length} payment methods configured</p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(actionCategories).map(([key, label]) => (
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

          {/* Smart Action Selection Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Card 
                  key={action.key}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => handleActionSelect(action.key)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-8 h-8 text-primary" />
                      <div>
                        <CardTitle className="text-base">{action.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {actionCategories[action.category as keyof typeof actionCategories]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    {action.smartFeatures && (
                      <div className="mt-2">
                        <p className="text-xs text-primary font-medium">Smart Features:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {action.smartFeatures.slice(0, 3).map(feature => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature.replace('_', ' ')}
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
                  const action = actions.find(a => a.key === selectedAction);
                  const IconComponent = action?.icon || MessageSquare;
                  return <IconComponent className="w-8 h-8 text-primary" />;
                })()}
                <div>
                  <CardTitle>
                    {actions.find(a => a.key === selectedAction)?.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {actions.find(a => a.key === selectedAction)?.description}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedAction(null)}
              >
                Change
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderSmartConfigFields()}
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleConfirmAction} className="gap-2">
                <ArrowRight className="w-4 h-4" />
                Confirm Action
              </Button>
              <Button variant="outline" onClick={() => setSelectedAction(null)}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
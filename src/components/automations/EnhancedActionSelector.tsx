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
  User, DollarSign, Bell, ArrowRight, Bot
} from 'lucide-react';
import { ACTION_DEFINITIONS, CommunicationActions, BusinessActions, AIActions } from '@/types/automationFramework';

interface EnhancedActionSelectorProps {
  onActionSelect: (action: { type: string; config: any; name: string }) => void;
  initialAction?: { type: string; config: any; name: string };
}

export const EnhancedActionSelector: React.FC<EnhancedActionSelectorProps> = ({
  onActionSelect,
  initialAction
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string | null>(
    initialAction?.type || null
  );
  const [actionConfig, setActionConfig] = useState<any>(initialAction?.config || {});

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
      description: 'Send SMS message to client or technician',
      category: 'communication',
      icon: MessageSquare
    },
    {
      key: 'send_email',
      name: 'Send Email',
      description: 'Send email to client or technician',
      category: 'communication',
      icon: Mail
    },
    {
      key: 'make_call',
      name: 'Make Call',
      description: 'Initiate phone call to client or technician',
      category: 'communication',
      icon: Phone
    },
    {
      key: 'send_push_notification',
      name: 'Push Notification',
      description: 'Send push notification to team members',
      category: 'communication',
      icon: Bell
    },
    {
      key: 'create_task',
      name: 'Create Task',
      description: 'Create a new task for team members',
      category: 'business_process',
      icon: CheckSquare
    },
    {
      key: 'create_job',
      name: 'Create Job',
      description: 'Create a new job',
      category: 'business_process',
      icon: Briefcase
    },
    {
      key: 'update_job_status',
      name: 'Update Job Status',
      description: 'Change the status of a job',
      category: 'business_process',
      icon: Briefcase
    },
    {
      key: 'assign_technician',
      name: 'Assign Technician',
      description: 'Assign technician to a job',
      category: 'business_process',
      icon: User
    },
    {
      key: 'create_estimate',
      name: 'Create Estimate',
      description: 'Generate a new estimate',
      category: 'business_process',
      icon: DollarSign
    },
    {
      key: 'create_invoice',
      name: 'Create Invoice',
      description: 'Generate a new invoice',
      category: 'business_process',
      icon: DollarSign
    },
    {
      key: 'update_client',
      name: 'Update Client',
      description: 'Update client information',
      category: 'business_process',
      icon: User
    },
    {
      key: 'ai_generate_response',
      name: 'AI Generate Response',
      description: 'Use AI to generate contextual responses',
      category: 'ai_powered',
      icon: Bot
    },
    {
      key: 'ai_sentiment_analysis',
      name: 'AI Sentiment Analysis',
      description: 'Analyze sentiment of client communications',
      category: 'ai_powered',
      icon: Bot
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

  const renderConfigFields = () => {
    if (!selectedAction) return null;

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
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="custom">Custom Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea
                placeholder="Enter your SMS message..."
                value={actionConfig.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use variables like {'{client.firstName}'} and {'{job.number}'}
              </p>
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
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="custom">Custom Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject *</Label>
              <Input
                placeholder="Email subject"
                value={actionConfig.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
              />
            </div>
            <div>
              <Label>Message Body *</Label>
              <Textarea
                placeholder="Enter your email message..."
                rows={4}
                value={actionConfig.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
              />
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
              <Label>Description</Label>
              <Textarea
                placeholder="Task description..."
                value={actionConfig.description || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select onValueChange={(value) => handleConfigChange('priority', value)}>
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes..."
                value={actionConfig.notes || ''}
                onChange={(e) => handleConfigChange('notes', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notify_client"
                checked={actionConfig.notify_client || false}
                onChange={(e) => handleConfigChange('notify_client', e.target.checked)}
              />
              <Label htmlFor="notify_client">Notify client of status change</Label>
            </div>
          </div>
        );

      case 'ai_generate_response':
        return (
          <div className="space-y-4">
            <div>
              <Label>Context</Label>
              <Select onValueChange={(value) => handleConfigChange('context', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS Response</SelectItem>
                  <SelectItem value="email">Email Response</SelectItem>
                  <SelectItem value="call">Call Script</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone</Label>
              <Select onValueChange={(value) => handleConfigChange('tone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            This action will be executed with default settings. Additional configuration coming soon.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {!selectedAction ? (
        <>
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

          {/* Action Selection Grid */}
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
            {renderConfigFields()}
            
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
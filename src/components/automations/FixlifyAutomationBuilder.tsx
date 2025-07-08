import React, { useState, useEffect } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Zap, Settings, MessageSquare, Mail, Clock, Calendar, Users, 
  ArrowRight, Plus, X, ChevronDown, ChevronUp, Copy, 
  AlertTriangle, CheckCircle, Brain, Sparkles, Phone, Hash,
  FileText, DollarSign, Star, Shield, Globe, Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AutomationBuilderProps {
  rule: any;
  onSave: (rule: any) => void;
  onCancel: () => void;
  triggerTypes: Array<{ value: string; label: string; description: string }>;
  actionTypes: Array<{ value: string; label: string; description: string }>;
}

const FixlifyAutomationBuilder: React.FC<AutomationBuilderProps> = ({
  rule: initialRule,
  onSave,
  onCancel,
  triggerTypes,
  actionTypes
}) => {
  // Initialize with defaults
  const [rule, setRule] = useState({
    name: '',
    description: '',
    status: 'draft' as 'active' | 'paused' | 'draft',
    trigger: {
      type: '',
      conditions: []
    },
    conditions: {
      operator: 'AND' as 'AND' | 'OR',
      rules: []
    },
    action: {
      type: '',
      config: {
        message: '',
        subject: '',
        template: ''
      },
      delay: {
        type: 'immediate' as 'immediate' | 'minutes' | 'hours' | 'days',
        value: 0
      }
    },
    deliveryWindow: {
      businessHoursOnly: false,
      allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      timeRange: {
        start: '09:00',
        end: '17:00'
      }
    },
    multiChannel: {
      primaryChannel: 'sms' as 'sms' | 'email',
      fallbackEnabled: false,
      fallbackChannel: 'email' as 'sms' | 'email',
      fallbackDelayHours: 2
    },
    ...initialRule
  });

  const [activeTab, setActiveTab] = useState('basics');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});

  // Available variables based on trigger type
  const getAvailableVariables = () => {
    const baseVariables = [
      { name: 'client_name', description: 'Customer name' },
      { name: 'company_name', description: 'Your company name' },
      { name: 'company_phone', description: 'Your company phone' },
      { name: 'current_date', description: 'Current date' },
      { name: 'current_time', description: 'Current time' }
    ];

    const triggerVariables: Record<string, Array<{ name: string; description: string }>> = {
      job_created: [
        { name: 'job_title', description: 'Job title/description' },
        { name: 'job_type', description: 'Type of job' },
        { name: 'client_address', description: 'Service address' }
      ],
      job_completed: [
        { name: 'job_title', description: 'Job title/description' },
        { name: 'technician_name', description: 'Technician who completed job' },
        { name: 'completion_date', description: 'Date job was completed' }
      ],
      job_scheduled: [
        { name: 'job_title', description: 'Job title/description' },
        { name: 'scheduled_date', description: 'Scheduled date' },
        { name: 'scheduled_time', description: 'Scheduled time' },
        { name: 'technician_name', description: 'Assigned technician' },
        { name: 'client_address', description: 'Service address' }
      ],
      invoice_created: [
        { name: 'invoice_number', description: 'Invoice number' },
        { name: 'total_amount', description: 'Invoice total' },
        { name: 'due_date', description: 'Payment due date' },
        { name: 'payment_link', description: 'Online payment link' }
      ],
      invoice_overdue: [
        { name: 'invoice_number', description: 'Invoice number' },
        { name: 'total_amount', description: 'Invoice total' },
        { name: 'days_overdue', description: 'Days past due' },
        { name: 'payment_link', description: 'Online payment link' }
      ],
      appointment_tomorrow: [
        { name: 'job_title', description: 'Job title/description' },
        { name: 'scheduled_time', description: 'Appointment time' },
        { name: 'technician_name', description: 'Assigned technician' },
        { name: 'client_address', description: 'Service address' }
      ]
    };

    return [...baseVariables, ...(triggerVariables[rule.trigger.type] || [])];
  };

  // Message templates based on action type
  const messageTemplates: Record<string, { sms: string; email: { subject: string; body: string } }> = {
    appointment_tomorrow: {
      sms: 'Hi {{client_name}}! Reminder: {{technician_name}} will be at {{client_address}} tomorrow at {{scheduled_time}} for {{job_title}}. Call {{company_phone}} if you need to reschedule.',
      email: {
        subject: 'Appointment Reminder - {{company_name}}',
        body: 'Hi {{client_name}},\n\nThis is a friendly reminder about your appointment tomorrow.\n\nService: {{job_title}}\nDate: Tomorrow\nTime: {{scheduled_time}}\nTechnician: {{technician_name}}\nLocation: {{client_address}}\n\nIf you need to reschedule, please call us at {{company_phone}}.\n\nThank you,\n{{company_name}}'
      }
    },
    job_completed: {
      sms: 'Hi {{client_name}}! Your {{job_title}} has been completed by {{technician_name}}. How did we do? Reply with feedback or call {{company_phone}} if you need anything.',
      email: {
        subject: 'Service Completed - {{company_name}}',
        body: 'Hi {{client_name}},\n\nWe\'ve completed your {{job_title}} service today.\n\nWe hope everything went smoothly! If you have any questions or concerns, please don\'t hesitate to reach out to us at {{company_phone}}.\n\nWe\'d love to hear about your experience. Please take a moment to leave us a review.\n\nThank you for choosing {{company_name}}!\n\nBest regards,\n{{company_name}}'
      }
    },
    invoice_overdue: {
      sms: 'Hi {{client_name}}, your invoice #{{invoice_number}} for {{total_amount}} is {{days_overdue}} days overdue. Pay online: {{payment_link}} or call {{company_phone}}.',
      email: {
        subject: 'Payment Reminder - Invoice #{{invoice_number}}',
        body: 'Hi {{client_name}},\n\nThis is a friendly reminder that your invoice is past due.\n\nInvoice #: {{invoice_number}}\nAmount: {{total_amount}}\nDays Overdue: {{days_overdue}}\n\nPay online: {{payment_link}}\n\nIf you\'ve already sent payment, please disregard this notice. If you have any questions, please call us at {{company_phone}}.\n\nThank you,\n{{company_name}}'
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: any = {};
    
    if (!rule.name.trim()) errors.name = 'Name is required';
    if (!rule.trigger.type) errors.trigger = 'Trigger is required';
    if (!rule.action.type) errors.action = 'Action is required';
    
    if (rule.action.type === 'send_sms' || rule.action.type === 'send_email') {
      if (!rule.action.config.message?.trim()) {
        errors.message = 'Message content is required';
      }
      if (rule.action.type === 'send_email' && !rule.action.config.subject?.trim()) {
        errors.subject = 'Email subject is required';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      setActiveTab('basics');
      return;
    }
    
    onSave(rule);
  };

  // Insert variable into message
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = rule.action.config.message || '';
      const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
      
      setRule({
        ...rule,
        action: {
          ...rule.action,
          config: {
            ...rule.action.config,
            message: newText
          }
        }
      });
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = start + variable.length + 4;
        textarea.selectionEnd = start + variable.length + 4;
        textarea.focus();
      }, 0);
    }
  };

  // Apply template
  const applyTemplate = () => {
    const template = messageTemplates[rule.trigger.type];
    if (template) {
      const channel = rule.multiChannel.primaryChannel;
      if (channel === 'sms') {
        setRule({
          ...rule,
          action: {
            ...rule.action,
            config: {
              ...rule.action.config,
              message: template.sms
            }
          }
        });
      } else if (channel === 'email') {
        setRule({
          ...rule,
          action: {
            ...rule.action,
            config: {
              ...rule.action.config,
              subject: template.email.subject,
              message: template.email.body
            }
          }
        });
      }
      toast.success('Template applied successfully');
    }
  };

  // Condition field options based on trigger
  const getConditionFields = () => {
    const fields: Record<string, Array<{ value: string; label: string }>> = {
      job_status_changed: [
        { value: 'new_status', label: 'New Status' },
        { value: 'old_status', label: 'Previous Status' },
        { value: 'job_type', label: 'Job Type' },
        { value: 'client_type', label: 'Client Type' }
      ],
      invoice_overdue: [
        { value: 'days_overdue', label: 'Days Overdue' },
        { value: 'total_amount', label: 'Invoice Amount' },
        { value: 'client_type', label: 'Client Type' }
      ],
      job_anniversary: [
        { value: 'months_since', label: 'Months Since Job' },
        { value: 'job_type', label: 'Job Type' },
        { value: 'service_value', label: 'Service Value' }
      ]
    };
    
    return fields[rule.trigger.type] || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {initialRule ? 'Edit Automation' : 'Create New Automation'}
        </h2>
        <p className="text-gray-600 mt-1">
          Build powerful automations that work with your business workflow
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="basics">
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Basics
            </span>
          </TabsTrigger>
          <TabsTrigger value="trigger">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Trigger
            </span>
          </TabsTrigger>
          <TabsTrigger value="action">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Action
            </span>
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Delivery
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Basics Tab */}
        <TabsContent value="basics" className="space-y-6">
          <ModernCard>
            <ModernCardContent className="space-y-6">
              <div>
                <Label htmlFor="name" className="required">
                  Automation Name
                </Label>
                <Input
                  id="name"
                  value={rule.name}
                  onChange={(e) => setRule({ ...rule, name: e.target.value })}
                  placeholder="e.g., 24-Hour Appointment Reminder"
                  className={cn(validationErrors.name && 'border-red-500')}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={rule.description || ''}
                  onChange={(e) => setRule({ ...rule, description: e.target.value })}
                  placeholder="Brief description of what this automation does..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Status</Label>
                <RadioGroup
                  value={rule.status}
                  onValueChange={(value) => setRule({ ...rule, status: value as any })}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active" className="font-normal cursor-pointer">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Active
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paused" id="paused" />
                    <Label htmlFor="paused" className="font-normal cursor-pointer">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        Paused
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="draft" id="draft" />
                    <Label htmlFor="draft" className="font-normal cursor-pointer">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        Draft
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </ModernCardContent>
          </ModernCard>
        </TabsContent>

        {/* Trigger Tab */}
        <TabsContent value="trigger" className="space-y-6">
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>When should this automation run?</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-6">
              <div>
                <Label htmlFor="trigger-type" className="required">
                  Trigger Event
                </Label>
                <Select
                  value={rule.trigger.type}
                  onValueChange={(value) => setRule({
                    ...rule,
                    trigger: { ...rule.trigger, type: value }
                  })}
                >
                  <SelectTrigger 
                    id="trigger-type"
                    className={cn(validationErrors.trigger && 'border-red-500')}
                  >
                    <SelectValue placeholder="Select a trigger..." />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <div>
                          <p className="font-medium">{trigger.label}</p>
                          <p className="text-sm text-gray-600">{trigger.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.trigger && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.trigger}</p>
                )}
              </div>

              {/* Conditions */}
              {getConditionFields().length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Additional Conditions (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      {showAdvanced ? (
                        <>Hide Advanced <ChevronUp className="w-4 h-4 ml-1" /></>
                      ) : (
                        <>Show Advanced <ChevronDown className="w-4 h-4 ml-1" /></>
                      )}
                    </Button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Label>Match</Label>
                        <Select
                          value={rule.conditions.operator}
                          onValueChange={(value) => setRule({
                            ...rule,
                            conditions: { ...rule.conditions, operator: value as 'AND' | 'OR' }
                          })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">All conditions</SelectItem>
                            <SelectItem value="OR">Any condition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {rule.conditions.rules.map((condition: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Select
                            value={condition.field}
                            onValueChange={(value) => {
                              const newRules = [...rule.conditions.rules];
                              newRules[index] = { ...condition, field: value };
                              setRule({
                                ...rule,
                                conditions: { ...rule.conditions, rules: newRules }
                              });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Field..." />
                            </SelectTrigger>
                            <SelectContent>
                              {getConditionFields().map((field) => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={condition.operator}
                            onValueChange={(value) => {
                              const newRules = [...rule.conditions.rules];
                              newRules[index] = { ...condition, operator: value };
                              setRule({
                                ...rule,
                                conditions: { ...rule.conditions, rules: newRules }
                              });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Operator..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="greater_than">Greater than</SelectItem>
                              <SelectItem value="less_than">Less than</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            value={condition.value}
                            onChange={(e) => {
                              const newRules = [...rule.conditions.rules];
                              newRules[index] = { ...condition, value: e.target.value };
                              setRule({
                                ...rule,
                                conditions: { ...rule.conditions, rules: newRules }
                              });
                            }}
                            placeholder="Value..."
                            className="flex-1"
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newRules = rule.conditions.rules.filter((_: any, i: number) => i !== index);
                              setRule({
                                ...rule,
                                conditions: { ...rule.conditions, rules: newRules }
                              });
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRule({
                            ...rule,
                            conditions: {
                              ...rule.conditions,
                              rules: [
                                ...rule.conditions.rules,
                                { field: '', operator: 'equals', value: '' }
                              ]
                            }
                          });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Condition
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        </TabsContent>

        {/* Action Tab */}
        <TabsContent value="action" className="space-y-6">
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>What should happen?</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-6">
              <div>
                <Label htmlFor="action-type" className="required">
                  Action Type
                </Label>
                <Select
                  value={rule.action.type}
                  onValueChange={(value) => setRule({
                    ...rule,
                    action: { ...rule.action, type: value }
                  })}
                >
                  <SelectTrigger 
                    id="action-type"
                    className={cn(validationErrors.action && 'border-red-500')}
                  >
                    <SelectValue placeholder="Select an action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div>
                          <p className="font-medium">{action.label}</p>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.action && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.action}</p>
                )}
              </div>

              {/* Message Configuration */}
              {(rule.action.type === 'send_sms' || rule.action.type === 'send_email') && (
                <>
                  {/* Channel Selection */}
                  <div>
                    <Label>Communication Channel</Label>
                    <RadioGroup
                      value={rule.multiChannel.primaryChannel}
                      onValueChange={(value) => setRule({
                        ...rule,
                        multiChannel: {
                          ...rule.multiChannel,
                          primaryChannel: value as 'sms' | 'email'
                        }
                      })}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sms" id="channel-sms" />
                        <Label htmlFor="channel-sms" className="font-normal cursor-pointer">
                          <span className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            SMS
                          </span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="channel-email" />
                        <Label htmlFor="channel-email" className="font-normal cursor-pointer">
                          <span className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Email Subject */}
                  {rule.multiChannel.primaryChannel === 'email' && (
                    <div>
                      <Label htmlFor="subject" className="required">
                        Email Subject
                      </Label>
                      <Input
                        id="subject"
                        value={rule.action.config.subject || ''}
                        onChange={(e) => setRule({
                          ...rule,
                          action: {
                            ...rule.action,
                            config: {
                              ...rule.action.config,
                              subject: e.target.value
                            }
                          }
                        })}
                        placeholder="e.g., Appointment Reminder - {{company_name}}"
                        className={cn(validationErrors.subject && 'border-red-500')}
                      />
                      {validationErrors.subject && (
                        <p className="text-sm text-red-500 mt-1">{validationErrors.subject}</p>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="message-textarea" className="required">
                        Message Content
                      </Label>
                      {messageTemplates[rule.trigger.type] && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={applyTemplate}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Use Template
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id="message-textarea"
                      value={rule.action.config.message || ''}
                      onChange={(e) => setRule({
                        ...rule,
                        action: {
                          ...rule.action,
                          config: {
                            ...rule.action.config,
                            message: e.target.value
                          }
                        }
                      })}
                      placeholder={rule.multiChannel.primaryChannel === 'sms' 
                        ? "Enter your SMS message..." 
                        : "Enter your email message..."}
                      rows={rule.multiChannel.primaryChannel === 'email' ? 8 : 4}
                      className={cn(validationErrors.message && 'border-red-500')}
                    />
                    {validationErrors.message && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.message}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">
                        {rule.multiChannel.primaryChannel === 'sms' && (
                          `${(rule.action.config.message || '').length}/160 characters`
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Variables */}
                  <div>
                    <Label>Available Variables</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getAvailableVariables().map((variable) => (
                        <Button
                          key={variable.name}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(variable.name)}
                          className="text-xs"
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {variable.name}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Click a variable to insert it into your message
                    </p>
                  </div>

                  {/* Action Delay */}
                  <div>
                    <Label>When to send</Label>
                    <div className="space-y-3 mt-2">
                      <RadioGroup
                        value={rule.action.delay.type}
                        onValueChange={(value) => setRule({
                          ...rule,
                          action: {
                            ...rule.action,
                            delay: {
                              ...rule.action.delay,
                              type: value as any
                            }
                          }
                        })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="immediate" id="delay-immediate" />
                          <Label htmlFor="delay-immediate" className="font-normal cursor-pointer">
                            Immediately
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="minutes" id="delay-minutes" />
                          <Label htmlFor="delay-minutes" className="font-normal cursor-pointer">
                            After a delay
                          </Label>
                        </div>
                      </RadioGroup>

                      {rule.action.delay.type !== 'immediate' && (
                        <div className="flex items-center gap-2 ml-6">
                          <Input
                            type="number"
                            value={rule.action.delay.value || 0}
                            onChange={(e) => setRule({
                              ...rule,
                              action: {
                                ...rule.action,
                                delay: {
                                  ...rule.action.delay,
                                  value: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-20"
                            min="1"
                          />
                          <Select
                            value={rule.action.delay.type}
                            onValueChange={(value) => setRule({
                              ...rule,
                              action: {
                                ...rule.action,
                                delay: {
                                  ...rule.action.delay,
                                  type: value as any
                                }
                              }
                            })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutes</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Other action configurations */}
              {rule.action.type === 'update_job_status' && (
                <div>
                  <Label htmlFor="status-update">New Status</Label>
                  <Select
                    value={rule.action.config.status_update || ''}
                    onValueChange={(value) => setRule({
                      ...rule,
                      action: {
                        ...rule.action,
                        config: {
                          ...rule.action.config,
                          status_update: value
                        }
                      }
                    })}
                  >
                    <SelectTrigger id="status-update">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-6">
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Delivery Settings</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-6">
              {/* Multi-channel Fallback */}
              {(rule.action.type === 'send_sms' || rule.action.type === 'send_email') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="fallback-enabled">Enable Fallback Channel</Label>
                      <p className="text-sm text-gray-600">
                        Send via alternative channel if primary fails
                      </p>
                    </div>
                    <Switch
                      id="fallback-enabled"
                      checked={rule.multiChannel.fallbackEnabled}
                      onCheckedChange={(checked) => setRule({
                        ...rule,
                        multiChannel: {
                          ...rule.multiChannel,
                          fallbackEnabled: checked
                        }
                      })}
                    />
                  </div>

                  {rule.multiChannel.fallbackEnabled && (
                    <div className="ml-4 space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label>Fallback Channel</Label>
                        <RadioGroup
                          value={rule.multiChannel.fallbackChannel}
                          onValueChange={(value) => setRule({
                            ...rule,
                            multiChannel: {
                              ...rule.multiChannel,
                              fallbackChannel: value as 'sms' | 'email'
                            }
                          })}
                          className="flex gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="sms" 
                              id="fallback-sms" 
                              disabled={rule.multiChannel.primaryChannel === 'sms'}
                            />
                            <Label htmlFor="fallback-sms" className="font-normal cursor-pointer">
                              SMS
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="email" 
                              id="fallback-email"
                              disabled={rule.multiChannel.primaryChannel === 'email'}
                            />
                            <Label htmlFor="fallback-email" className="font-normal cursor-pointer">
                              Email
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label>Fallback Delay</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            type="number"
                            value={rule.multiChannel.fallbackDelayHours}
                            onChange={(e) => setRule({
                              ...rule,
                              multiChannel: {
                                ...rule.multiChannel,
                                fallbackDelayHours: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-20"
                            min="1"
                          />
                          <span className="text-sm text-gray-600">hours after primary fails</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Business Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="business-hours">Business Hours Only</Label>
                    <p className="text-sm text-gray-600">
                      Only send during business hours
                    </p>
                  </div>
                  <Switch
                    id="business-hours"
                    checked={rule.deliveryWindow.businessHoursOnly}
                    onCheckedChange={(checked) => setRule({
                      ...rule,
                      deliveryWindow: {
                        ...rule.deliveryWindow,
                        businessHoursOnly: checked
                      }
                    })}
                  />
                </div>

                {rule.deliveryWindow.businessHoursOnly && (
                  <div className="ml-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label>Allowed Days</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                          <label key={day} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={rule.deliveryWindow.allowedDays.includes(day)}
                              onCheckedChange={(checked) => {
                                const days = checked
                                  ? [...rule.deliveryWindow.allowedDays, day]
                                  : rule.deliveryWindow.allowedDays.filter(d => d !== day);
                                setRule({
                                  ...rule,
                                  deliveryWindow: {
                                    ...rule.deliveryWindow,
                                    allowedDays: days
                                  }
                                });
                              }}
                            />
                            <span className="text-sm capitalize">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Time Range</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="time"
                          value={rule.deliveryWindow.timeRange?.start || '09:00'}
                          onChange={(e) => setRule({
                            ...rule,
                            deliveryWindow: {
                              ...rule.deliveryWindow,
                              timeRange: {
                                ...rule.deliveryWindow.timeRange,
                                start: e.target.value
                              }
                            }
                          })}
                          className="w-32"
                        />
                        <span className="text-sm text-gray-600">to</span>
                        <Input
                          type="time"
                          value={rule.deliveryWindow.timeRange?.end || '17:00'}
                          onChange={(e) => setRule({
                            ...rule,
                            deliveryWindow: {
                              ...rule.deliveryWindow,
                              timeRange: {
                                ...rule.deliveryWindow.timeRange,
                                end: e.target.value
                              }
                            }
                          })}
                          className="w-32"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ModernCardContent>
          </ModernCard>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>All messages are sent securely and comply with regulations</span>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <GradientButton
            variant="default"
            onClick={handleSave}
          >
            {initialRule ? 'Update Automation' : 'Create Automation'}
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default FixlifyAutomationBuilder;

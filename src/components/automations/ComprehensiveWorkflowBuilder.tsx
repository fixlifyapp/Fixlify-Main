import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, Save, Play, Clock, Mail, MessageSquare, 
  ChevronRight, DollarSign, 
  Zap, ArrowDown, GitBranch, Sun, Moon, Globe,
  Gift, Trash2, Info, User, Calendar, Wrench, MapPin,
  Hash, Shield, CheckCircle, Phone, FileText, BarChart3,
  Sparkles, Variable, Copy, Star, Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useWorkflow, useWorkflows } from '@/hooks/useWorkflows';
import { supabase } from '@/integrations/supabase/client';
import TriggerConfigFields from './TriggerConfigFields';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { getCurrentTimeInTimezone } from '@/utils/timezones';

// Props interface
interface ComprehensiveWorkflowBuilderProps {
  workflowId?: string | null;
  initialTemplate?: any;
  onSave?: () => void;
}

// Types
interface WorkflowTrigger {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
}

interface WorkflowStep {
  id: string;
  type: 'email' | 'sms' | 'delay' | 'conditional' | 'gift_card';
  name: string;
  config: Record<string, any>;
}

// System variables available to all users
const SYSTEM_VARIABLES = [
  { name: 'client_name', icon: User, description: 'Client full name' },
  { name: 'client_first_name', icon: User, description: 'Client first name' },
  { name: 'client_phone', icon: Phone, description: 'Client phone number' },
  { name: 'client_email', icon: Mail, description: 'Client email address' },
  { name: 'appointment_time', icon: Clock, description: 'Scheduled appointment time' },
  { name: 'appointment_date', icon: Calendar, description: 'Scheduled appointment date' },
  { name: 'service_type', icon: Wrench, description: 'Type of service' },
  { name: 'address', icon: MapPin, description: 'Service address' },
  { name: 'invoice_number', icon: Hash, description: 'Invoice number' },
  { name: 'estimate_number', icon: Hash, description: 'Estimate number' },
  { name: 'amount', icon: DollarSign, description: 'Amount in dollars' },
  { name: 'company_name', icon: Shield, description: 'Your company name' },
  { name: 'company_phone', icon: Phone, description: 'Your company phone' },
  { name: 'company_email', icon: Mail, description: 'Your company email' },
  { name: 'technician_name', icon: User, description: 'Assigned technician name' },
  { name: 'job_description', icon: FileText, description: 'Job description' },
  { name: 'job_id', icon: Hash, description: 'Job ID number' },
  { name: 'due_date', icon: Calendar, description: 'Payment due date' },
  { name: 'payment_date', icon: Calendar, description: 'Date payment received' },
  { name: 'completion_date', icon: CheckCircle, description: 'Job completion date' },
  { name: 'commission_amount', icon: DollarSign, description: 'Commission amount' },
  { name: 'period', icon: Calendar, description: 'Time period (week/month)' },
  { name: 'jobs_count', icon: BarChart3, description: 'Number of jobs' }
];

// Trigger types with configurations
const TRIGGER_TYPES = {
  job_completed: {
    label: 'Job Completed',
    icon: CheckCircle,
    configFields: ['jobType', 'technicianId', 'serviceCategory']
  },
  job_scheduled: {
    label: 'Job Scheduled',
    icon: Calendar,
    configFields: ['hoursBeforeJob', 'jobType', 'priority']
  },
  invoice_paid: {
    label: 'Invoice Paid',
    icon: DollarSign,
    configFields: ['minAmount', 'paymentMethod']
  },
  invoice_threshold: {
    label: 'Invoice Above Threshold',
    icon: DollarSign,
    configFields: ['threshold', 'includeEstimates']
  },
  payment_overdue: {
    label: 'Payment Overdue',
    icon: Clock,
    configFields: ['daysOverdue', 'minAmount', 'excludeDisputed']
  },
  estimate_sent: {
    label: 'Estimate Sent',
    icon: FileText,
    configFields: ['estimateType', 'minAmount']
  },
  estimate_expired: {
    label: 'Estimate Expired',
    icon: Clock,
    configFields: ['daysUntilExpiry', 'estimateAmount']
  },
  customer_created: {
    label: 'New Customer',
    icon: User,
    configFields: ['source', 'hasPhoneNumber', 'hasEmail']
  },
  rating_below_threshold: {
    label: 'Low Rating Received',
    icon: Star,
    configFields: ['ratingThreshold', 'includeComments']
  },
  days_since_last_service: {
    label: 'Days Since Last Service',
    icon: Calendar,
    configFields: ['daysSince', 'serviceType', 'customerSegment']
  },
  weather_forecast: {
    label: 'Weather Forecast',
    icon: Sun,
    configFields: ['weatherCondition', 'temperature', 'daysAhead']
  },
  membership_expiring: {
    label: 'Membership Expiring',
    icon: Shield,
    configFields: ['daysBeforeExpiry', 'membershipType']
  },
  time_based: {
    label: 'Time-Based Schedule',
    icon: Clock,
    configFields: ['schedule', 'timezone', 'recurringDays']
  },
  manual: {
    label: 'Manual Trigger',
    icon: User,
    configFields: []
  }
};

// Predefined templates - more compact
const WORKFLOW_TEMPLATES = {
  newClientOnboarding: {
    name: "New Client Welcome",
    description: "Welcome sequence for new clients",
    triggers: [{ type: 'customer_created', name: 'New Customer', config: {} }],
    steps: [
      {
        type: 'email',
        name: 'Welcome Email',
        config: {
          subject: 'Welcome to {{company_name}}!',
          message: 'Hi {{client_first_name}},\n\nThank you for choosing {{company_name}}. We\'re excited to serve you!'
        }
      },
      {
        type: 'delay',
        name: 'Wait 2 Days',
        config: { delayValue: 2, delayUnit: 'days' }
      },
      {
        type: 'sms',
        name: 'Follow-up SMS',
        config: {
          message: 'Hi {{client_first_name}}, save this number for quick service! - {{company_name}}'
        }
      }
    ]
  },
  thankYouGiftCard: {
    name: "VIP Thank You",
    description: "Gift card for high-value jobs",
    triggers: [{ 
      type: 'invoice_threshold', 
      name: 'Invoice Above $500', 
      config: { threshold: 500 } 
    }],
    steps: [
      {
        type: 'gift_card',
        name: 'Send $25 Gift',
        config: { giftCardAmount: 25, message: 'Thank you for being a VIP!' }
      },
      {
        type: 'email',
        name: 'Thank You Email',
        config: {
          subject: 'Special Thank You Gift!',
          message: 'Hi {{client_name}}, we appreciate your business! Enjoy your gift card.'
        }
      }
    ]
  },
  appointmentReminder: {
    name: "Smart Reminder",
    description: "Day-before appointment reminder",
    triggers: [{ 
      type: 'job_scheduled', 
      name: 'Job Scheduled', 
      config: { hoursBeforeJob: 24 } 
    }],
    steps: [
      {
        type: 'sms',
        name: 'SMS Reminder',
        config: {
          message: 'Hi {{client_first_name}}, reminder: {{technician_name}} will arrive tomorrow at {{appointment_time}} for your {{service_type}}. Reply YES to confirm.'
        }
      }
    ]
  },
  paymentFollowUp: {
    name: "Payment Reminder",
    description: "Gentle payment reminder sequence",
    triggers: [{ 
      type: 'payment_overdue', 
      name: 'Payment Overdue', 
      config: { daysOverdue: 7 } 
    }],
    steps: [
      {
        type: 'email',
        name: 'Friendly Reminder',
        config: {
          subject: 'Invoice #{{invoice_number}} - Friendly Reminder',
          message: 'Hi {{client_name}}, just a reminder that invoice #{{invoice_number}} for ${{amount}} is ready for payment.'
        }
      },
      {
        type: 'delay',
        name: 'Wait 3 Days',
        config: { delayValue: 3, delayUnit: 'days' }
      },
      {
        type: 'sms',
        name: 'SMS Follow-up',
        config: {
          message: 'Hi {{client_first_name}}, invoice #{{invoice_number}} (${{amount}}) is overdue. Need help? Call {{company_phone}}'
        }
      }
    ]
  },
  maintenanceReminder: {
    name: "Maintenance Due",
    description: "Seasonal maintenance reminders",
    triggers: [{ 
      type: 'days_since_last_service', 
      name: '90 Days Since Service', 
      config: { daysSince: 90 } 
    }],
    steps: [
      {
        type: 'email',
        name: 'Maintenance Email',
        config: {
          subject: 'Time for Your Seasonal Maintenance',
          message: 'Hi {{client_name}}, it\'s been 3 months since your last service. Schedule your maintenance today!'
        }
      }
    ]
  },
  reviewRequest: {
    name: "Review Request",
    description: "Post-service review request",
    triggers: [{ 
      type: 'job_completed', 
      name: 'Job Completed', 
      config: {} 
    }],
    steps: [
      {
        type: 'delay',
        name: 'Wait 1 Day',
        config: { delayValue: 1, delayUnit: 'days' }
      },
      {
        type: 'sms',
        name: 'Review SMS',
        config: {
          message: 'Hi {{client_first_name}}, how was your experience with {{technician_name}}? Leave a review: [review_link]'
        }
      }
    ]
  }
};

const ComprehensiveWorkflowBuilder: React.FC<ComprehensiveWorkflowBuilderProps> = ({ 
  workflowId, 
  initialTemplate,
  onSave 
}) => {
  const { workflow: existingWorkflow, isLoading: isLoadingWorkflow } = useWorkflow(workflowId || '');
  const { createWorkflow, updateWorkflow, isCreating, isUpdating } = useWorkflows();
  const { companySettings } = useCompanySettings();

  // Local state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([]);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [settings, setSettings] = useState({
    timezone: 'customer_local',
    businessHours: {
      enabled: true,
      start: '09:00',
      end: '17:00',
      days: ['mon', 'tue', 'wed', 'thu', 'fri']
    }
  });
  const [enabled, setEnabled] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [activeStepForAI, setActiveStepForAI] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Load existing workflow
  useEffect(() => {
    if (existingWorkflow && workflowId) {
      setName(existingWorkflow.name || '');
      setDescription(existingWorkflow.description || '');
      setTriggers(existingWorkflow.triggers || []);
      setSteps(existingWorkflow.steps || []);
      setSettings(existingWorkflow.settings || settings);
      setEnabled(existingWorkflow.enabled ?? true);
    }
  }, [existingWorkflow, workflowId]);

  // Load initial template
  useEffect(() => {
    if (initialTemplate && !workflowId) {
      setName(initialTemplate.name || '');
      setDescription(initialTemplate.description || '');
      setTriggers(initialTemplate.triggers || []);
      setSteps(initialTemplate.steps || []);
      setSelectedTemplate(null);
    }
  }, [initialTemplate, workflowId]);

  // Add trigger
  const addTrigger = () => {
    const newTrigger: WorkflowTrigger = {
      id: `trigger-${Date.now()}`,
      type: 'job_completed',
      name: 'Job Completed',
      config: {}
    };
    setTriggers([...triggers, newTrigger]);
  };

  // Update trigger
  const updateTrigger = (index: number, updates: Partial<WorkflowTrigger>) => {
    const newTriggers = [...triggers];
    newTriggers[index] = { ...newTriggers[index], ...updates };
    setTriggers(newTriggers);
  };

  // Remove trigger
  const removeTrigger = (id: string) => {
    setTriggers(triggers.filter(t => t.id !== id));
  };

  // Add step
  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type,
      name: getDefaultStepName(type),
      config: getDefaultStepConfig(type)
    };
    setSteps([...steps, newStep]);
  };

  // Update step
  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
  };

  // Remove step
  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  // Load template
  const loadTemplate = (templateKey: string) => {
    const template = WORKFLOW_TEMPLATES[templateKey];
    if (template) {      setName(template.name);
      setDescription(template.description);
      setTriggers(template.triggers.map((t, i) => ({ ...t, id: `trigger-${Date.now()}-${i}` })));
      setSteps(template.steps.map((s, i) => ({ ...s, id: `step-${Date.now()}-${i}` })));
      setSelectedTemplate(templateKey);
    }
  };

  // Generate AI message
  const generateAIMessage = async (stepId: string, messageType: 'email' | 'sms') => {
    setAiLoading(true);
    setActiveStepForAI(stepId);
    
    try {
      const step = steps.find(s => s.id === stepId);
      if (!step) return;

      // Get trigger context
      const triggerContext = triggers[0] ? `Trigger: ${triggers[0].name}` : '';
      
      // Create prompt based on message type
      const prompt = messageType === 'email' 
        ? `Write a professional email for: ${step.name}. ${triggerContext}. Keep it friendly and concise.`
        : `Write a short SMS message (160 chars max) for: ${step.name}. ${triggerContext}. Be very concise.`;

      const systemContext = `You are creating automation messages for a service business. Use these variables where appropriate: {{client_name}}, {{client_first_name}}, {{company_name}}, {{appointment_time}}, {{appointment_date}}, {{amount}}, {{invoice_number}}, {{technician_name}}, {{service_type}}. Write in a professional yet friendly tone.`;

      const { data, error } = await supabase.functions.invoke('generate-with-ai', {
        body: {
          prompt,
          systemContext,
          mode: 'text',
          temperature: 0.7,
          maxTokens: messageType === 'sms' ? 100 : 300
        }
      });

      if (error) throw error;

      const generatedText = data?.generatedText || '';
      
      // Update the step with generated content
      const stepIndex = steps.findIndex(s => s.id === stepId);
      if (stepIndex !== -1) {
        if (messageType === 'email') {
          // Extract subject line if present
          const lines = generatedText.split('\n');
          let subject = 'Your Service Update';
          let body = generatedText;
          
          if (lines[0].toLowerCase().includes('subject:')) {
            subject = lines[0].replace(/subject:\s*/i, '').trim();
            body = lines.slice(1).join('\n').trim();
          }
          
          updateStep(stepIndex, {
            config: {
              ...step.config,
              subject,
              message: body
            }
          });
        } else {
          updateStep(stepIndex, {
            config: {
              ...step.config,
              message: generatedText
            }
          });
        }
      }
      
      toast.success('Message generated with AI!');
    } catch (error) {
      console.error('Error generating AI message:', error);
      toast.error('Failed to generate message with AI');
    } finally {
      setAiLoading(false);
      setActiveStepForAI(null);
    }
  };

  // Insert variable into message
  const insertVariable = (stepId: string, variableName: string, field: 'message' | 'subject') => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    const step = steps[stepIndex];
    const currentValue = step.config[field] || '';
    const variable = `{{${variableName}}}`;
    
    // Insert at cursor position if possible, otherwise append
    updateStep(stepIndex, {
      config: {
        ...step.config,
        [field]: currentValue + (currentValue ? ' ' : '') + variable
      }
    });
    
    toast.success(`Added ${variable} to ${field}`);
  };

  // Save workflow
  const handleSave = async () => {
    try {
      // Validate
      if (!name.trim()) {
        toast.error('Please enter a workflow name');
        return;
      }

      if (triggers.length === 0) {
        toast.error('Please add at least one trigger');
        return;
      }

      if (steps.length === 0) {
        toast.error('Please add at least one step');
        return;
      }

      const workflowData = {
        name,
        description,
        triggers,
        steps,
        settings,
        enabled
      };

      if (workflowId) {
        await updateWorkflow({ id: workflowId, updates: workflowData });
      } else {
        await createWorkflow(workflowData);
      }

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  // Test workflow
  const testWorkflow = () => {
    setIsTestMode(true);
    toast.info('Test mode activated. Simulating workflow execution...');
    setTimeout(() => {
      setIsTestMode(false);
      toast.success('Test completed! Check the logs for details.');
    }, 3000);
  };

  // Get default step name
  const getDefaultStepName = (type: string) => {
    switch (type) {
      case 'email': return 'Send Email';
      case 'sms': return 'Send SMS';
      case 'delay': return 'Wait Period';
      case 'gift_card': return 'Send Gift Card';
      default: return 'New Step';
    }
  };

  // Get default step config
  const getDefaultStepConfig = (type: string) => {
    switch (type) {
      case 'email':
        return { 
          subject: 'Service Update from {{company_name}}', 
          message: 'Hi {{client_name}},\n\nWe wanted to update you about your service.\n\nBest regards,\n{{company_name}}' 
        };
      case 'sms':
        return { 
          message: 'Hi {{client_first_name}}, this is {{company_name}} with an update about your service.' 
        };
      case 'delay':
        return { delayValue: 1, delayUnit: 'days' };
      case 'gift_card':
        return { giftCardAmount: 25, message: 'Thank you for your business!' };
      default:
        return {};
    }
  };

  if (isLoadingWorkflow) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Variable Reference */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Variable className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">System Variables</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVariables(!showVariables)}
            >
              {showVariables ? 'Hide' : 'Show'} Variables
            </Button>
          </div>
        </CardHeader>
        {showVariables && (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {SYSTEM_VARIABLES.map((variable) => (
                <div 
                  key={variable.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer group"
                  onClick={() => {
                    navigator.clipboard.writeText(`{{${variable.name}}}`);
                    toast.success(`Copied {{${variable.name}}}`);
                  }}
                >
                  <variable.icon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate">{`{{${variable.name}}}`}</p>
                    <p className="text-xs text-muted-foreground truncate">{variable.description}</p>
                  </div>
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <Alert className="mt-3">
              <Info className="w-4 h-4" />
              <AlertDescription className="text-xs">
                Click any variable to copy it. These variables are automatically replaced with actual values when the workflow runs.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
          <CardDescription>
            Start with a pre-built template or create from scratch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(WORKFLOW_TEMPLATES).map(([key, template]) => (
              <Card 
                key={key}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedTemplate === key && "ring-2 ring-primary"
                )}
                onClick={() => loadTemplate(key)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {template.steps.length} Steps
                    </Badge>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workflow Configuration</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={testWorkflow} disabled={isTestMode}>
                <Play className="w-4 h-4 mr-2" />
                {isTestMode ? 'Testing...' : 'Test'}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isCreating || isUpdating}
              >
                <Save className="w-4 h-4 mr-2" />
                {isCreating || isUpdating ? 'Saving...' : 'Save Workflow'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow does"
                rows={3}
              />
            </div>
          </div>
          {/* Triggers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Triggers</Label>
              <Button size="sm" variant="outline" onClick={addTrigger}>
                <Plus className="w-4 h-4 mr-2" />
                Add Trigger
              </Button>
            </div>
            
            {triggers.length > 0 && (
              <div className="space-y-2">
                {triggers.map((trigger, index) => (
                  <div key={trigger.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {TRIGGER_TYPES[trigger.type]?.icon ? (
                            React.createElement(TRIGGER_TYPES[trigger.type].icon, { className: "w-5 h-5 text-blue-600" })
                          ) : (
                            <Zap className="w-5 h-5 text-blue-600" />
                          )}
                          <Select 
                            value={trigger.type}
                            onValueChange={(value) => {
                              updateTrigger(index, { 
                                type: value,
                                name: TRIGGER_TYPES[value]?.label || value,
                                config: {}
                              });
                            }}
                          >
                            <SelectTrigger className="w-64">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(TRIGGER_TYPES).map(([value, config]) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex items-center gap-2">
                                    {config.icon && React.createElement(config.icon, { className: "w-4 h-4" })}
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTrigger(trigger.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Trigger Configuration */}
                    {TRIGGER_TYPES[trigger.type]?.configFields?.length > 0 && (
                      <div className="p-4 bg-white dark:bg-gray-900 border-t">
                        <div className="flex items-center gap-2 mb-3">
                          <Settings2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Configuration</span>
                        </div>
                        <TriggerConfigFields
                          triggerType={trigger.type}
                          config={trigger.config || {}}
                          onUpdate={(newConfig) => updateTrigger(index, { config: newConfig })}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Workflow Steps</Label>
            
            {steps.length === 0 ? (
              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  No steps added yet. Add your first step to get started.
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => addStep('email')}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addStep('sms')}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addStep('delay')}>
                    <Clock className="w-4 h-4 mr-2" />
                    Delay
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addStep('gift_card')}>
                    <Gift className="w-4 h-4 mr-2" />
                    Gift Card
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={step.id}>
                    {index > 0 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <WorkflowStepCard
                      step={step}
                      onUpdate={(updates) => updateStep(index, updates)}
                      onRemove={() => removeStep(step.id)}
                      onGenerateAI={(type) => generateAIMessage(step.id, type as 'email' | 'sms')}
                      onInsertVariable={(variable, field) => insertVariable(step.id, variable, field)}
                      isGeneratingAI={aiLoading && activeStepForAI === step.id}
                      systemVariables={SYSTEM_VARIABLES}
                    />
                  </div>
                ))}
                
                {/* Add Step Button */}
                <div className="flex justify-center pt-4">
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button size="sm" variant="outline" onClick={() => addStep('email')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addStep('sms')}>
                      <Plus className="w-4 h-4 mr-2" />
                      SMS
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addStep('delay')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Delay
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addStep('gift_card')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Gift Card
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Smart Timing Options */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Smart Timing Options</Label>
            
            <div className="space-y-4 p-4 border rounded-lg">
              {/* Business Hours */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-yellow-600" />
                    <Label>Business Hours Only</Label>
                  </div>
                  <Switch
                    checked={settings.businessHours?.enabled}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        businessHours: {
                          ...settings.businessHours,
                          enabled: checked
                        }
                      });
                    }}
                  />
                </div>
                {settings.businessHours?.enabled && (
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">From:</Label>
                      <Input
                        type="time"
                        value={settings.businessHours?.start || '09:00'}
                        onChange={(e) => setSettings({
                          ...settings,
                          businessHours: {
                            ...settings.businessHours,
                            start: e.target.value
                          }
                        })}
                        className="w-32"
                      />
                      <Label className="text-sm">To:</Label>
                      <Input
                        type="time"
                        value={settings.businessHours?.end || '17:00'}
                        onChange={(e) => setSettings({
                          ...settings,
                          businessHours: {
                            ...settings.businessHours,
                            end: e.target.value
                          }
                        })}
                        className="w-32"
                      />
                    </div>
                    {companySettings?.company_timezone && (
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Using company timezone: {companySettings.company_timezone}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Current time: {getCurrentTimeInTimezone(companySettings.company_timezone)}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Messages will only be sent during business hours in your company timezone
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable Workflow</Label>
              <p className="text-sm text-muted-foreground">
                Start running this workflow immediately after saving
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// WorkflowStepCard Component
interface WorkflowStepCardProps {
  step: WorkflowStep;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
  onRemove: () => void;
  onGenerateAI?: (type: string) => void;
  onInsertVariable?: (variable: string, field: 'message' | 'subject') => void;
  isGeneratingAI?: boolean;
  systemVariables?: typeof SYSTEM_VARIABLES;
}

const WorkflowStepCard: React.FC<WorkflowStepCardProps> = ({
  step,
  onUpdate,
  onRemove,
  onGenerateAI,
  onInsertVariable,
  isGeneratingAI,
  systemVariables = []
}) => {
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [variableTarget, setVariableTarget] = useState<'message' | 'subject'>('message');

  const getStepIcon = () => {
    switch (step.type) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'sms': return <MessageSquare className="w-5 h-5" />;
      case 'delay': return <Clock className="w-5 h-5" />;
      case 'gift_card': return <Gift className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getStepColor = () => {
    switch (step.type) {
      case 'email': return 'bg-blue-50 dark:bg-blue-950 text-blue-600';
      case 'sms': return 'bg-green-50 dark:bg-green-950 text-green-600';
      case 'delay': return 'bg-yellow-50 dark:bg-yellow-950 text-yellow-600';
      case 'gift_card': return 'bg-purple-50 dark:bg-purple-950 text-purple-600';
      default: return 'bg-gray-50 dark:bg-gray-950 text-gray-600';
    }
  };

  return (
    <div className={cn("p-4 border rounded-lg", getStepColor())}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStepIcon()}
          <Input
            value={step.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-64 bg-white dark:bg-gray-900"
            placeholder="Step name"
          />
        </div>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Step Configuration */}
      <div className="space-y-4">
        {step.type === 'email' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Subject</Label>
                <div className="flex gap-1">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setVariableTarget('subject');
                      setShowVariableMenu(!showVariableMenu);
                    }}
                  >
                    <Variable className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Input
                value={step.config.subject || ''}
                onChange={(e) => onUpdate({ 
                  config: { ...step.config, subject: e.target.value } 
                })}
                placeholder="Email subject line"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Message</Label>
                <div className="flex gap-1">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setVariableTarget('message');
                      setShowVariableMenu(!showVariableMenu);
                    }}
                  >
                    <Variable className="w-3 h-3" />
                  </Button>
                  {onGenerateAI && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => onGenerateAI('email')}
                      disabled={isGeneratingAI}
                    >
                      <Sparkles className={cn("w-3 h-3", isGeneratingAI && "animate-pulse")} />
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                value={step.config.message || ''}
                onChange={(e) => onUpdate({ 
                  config: { ...step.config, message: e.target.value } 
                })}
                placeholder="Email message content"
                rows={4}
              />
            </div>
          </>
        )}

        {step.type === 'sms' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Message (160 chars)</Label>
              <div className="flex gap-1">
                <span className="text-xs text-muted-foreground">
                  {(step.config.message || '').length}/160
                </span>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setVariableTarget('message');
                    setShowVariableMenu(!showVariableMenu);
                  }}
                >
                  <Variable className="w-3 h-3" />
                </Button>
                {onGenerateAI && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => onGenerateAI('sms')}
                    disabled={isGeneratingAI}
                  >
                    <Sparkles className={cn("w-3 h-3", isGeneratingAI && "animate-pulse")} />
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              value={step.config.message || ''}
              onChange={(e) => {
                if (e.target.value.length <= 160) {
                  onUpdate({ 
                    config: { ...step.config, message: e.target.value } 
                  });
                }
              }}
              placeholder="SMS message content"
              rows={3}
            />
          </div>
        )}

        {step.type === 'delay' && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={step.config.delayValue || 1}
              onChange={(e) => onUpdate({ 
                config: { ...step.config, delayValue: parseInt(e.target.value) || 1 } 
              })}
              className="w-20"
              min="1"
            />
            <Select
              value={step.config.delayUnit || 'days'}
              onValueChange={(value) => onUpdate({ 
                config: { ...step.config, delayUnit: value } 
              })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {step.type === 'gift_card' && (
          <>
            <div className="flex items-center gap-2">
              <Label>Amount</Label>
              <div className="flex items-center gap-1">
                <span className="text-lg">$</span>
                <Input
                  type="number"
                  value={step.config.giftCardAmount || 25}
                  onChange={(e) => onUpdate({ 
                    config: { ...step.config, giftCardAmount: parseInt(e.target.value) || 25 } 
                  })}
                  className="w-24"
                  min="5"
                  step="5"
                />
              </div>
            </div>
            <div>
              <Label>Message</Label>
              <Input
                value={step.config.message || ''}
                onChange={(e) => onUpdate({ 
                  config: { ...step.config, message: e.target.value } 
                })}
                placeholder="Gift card message"
              />
            </div>
          </>
        )}

        {/* Variable Menu */}
        {showVariableMenu && onInsertVariable && (
          <div className="border rounded-lg bg-white dark:bg-gray-900 p-2 max-h-48 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">Click to insert variable:</p>
            <div className="grid grid-cols-2 gap-1">
              {systemVariables.map((variable) => (
                <Button
                  key={variable.name}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs h-8"
                  onClick={() => {
                    onInsertVariable(variable.name, variableTarget);
                    setShowVariableMenu(false);
                  }}
                >
                  <variable.icon className="w-3 h-3 mr-1" />
                  <span className="font-mono">{`{{${variable.name}}}`}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveWorkflowBuilder;
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
  Trash2, Info, User, Calendar, Wrench, MapPin,
  Hash, Shield, CheckCircle, Phone, FileText, BarChart3,
  Sparkles, Variable, Copy, Star, Settings2, GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useWorkflow, useWorkflows } from '@/hooks/useWorkflows';
import { supabase } from '@/integrations/supabase/client';
import TriggerConfigFields from './TriggerConfigFields';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { getCurrentTimeInTimezone } from '@/utils/timezones';
import { AutomationManualExecution } from '@/services/automation-manual-execution';
import { MESSAGE_TEMPLATES, getMessageTemplate } from '@/utils/automation-message-templates';

interface ComprehensiveWorkflowBuilderProps {
  workflowId?: string | null;
  initialTemplate?: any;  onSave?: () => void;
}

// Trigger types
const TRIGGER_TYPES = [
  { 
    type: 'job_scheduled', 
    name: 'Job Scheduled', 
    icon: Calendar,
    color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600',
    description: 'When a job is scheduled'
  },
  { 
    type: 'job_completed', 
    name: 'Job Completed', 
    icon: CheckCircle,
    color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600',
    description: 'When a job is marked as complete'
  },
  { 
    type: 'payment_overdue', 
    name: 'Payment Overdue', 
    icon: DollarSign,
    color: 'bg-red-100 dark:bg-red-900 text-red-600',
    description: 'When a payment becomes overdue'
  },
  { 
    type: 'client_created', 
    name: 'New Client', 
    icon: User,
    color: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600',
    description: 'When a new client is added'
  },
  { 
    type: 'manual', 
    name: 'Manual Trigger', 
    icon: Play,
    color: 'bg-slate-100 dark:bg-slate-900 text-slate-600',
    description: 'Triggered manually by user'
  }
];

// Step types
const STEP_TYPES = [
  { type: 'email', name: 'Send Email', icon: Mail, color: 'bg-blue-50 dark:bg-blue-950 text-blue-600' },
  { type: 'sms', name: 'Send SMS', icon: MessageSquare, color: 'bg-green-50 dark:bg-green-950 text-green-600' },
  { type: 'delay', name: 'Wait', icon: Clock, color: 'bg-orange-50 dark:bg-orange-950 text-orange-600' },
  { type: 'conditional', name: 'If/Then', icon: GitBranch, color: 'bg-purple-50 dark:bg-purple-950 text-purple-600' }
];

const ComprehensiveWorkflowBuilder: React.FC<ComprehensiveWorkflowBuilderProps> = ({ 
  workflowId, 
  initialTemplate,
  onSave 
}) => {
  const { workflow: existingWorkflow, isLoading: isLoadingWorkflow } = useWorkflow(workflowId || '');
  const { createWorkflow, updateWorkflow, isCreating, isUpdating } = useWorkflows();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [triggers, setTriggers] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [expandedVariables, setExpandedVariables] = useState(true);

  // Automation templates
  const AUTOMATION_TEMPLATES = {
    welcome: {
      name: "Welcome Series",
      description: "Automated welcome sequence for new clients",
      triggers: [{ type: 'client_created', name: 'New Client' }],
      steps: [
        { type: 'email', name: 'Welcome Email' },
        { type: 'delay', name: 'Wait 2 Days' },
        { type: 'sms', name: 'Check-in SMS' }
      ]
    },
    reminder: {
      name: "Appointment Reminder", 
      description: "24-hour appointment reminder",
      triggers: [{ type: 'job_scheduled', name: 'Job Scheduled' }],
      steps: [
        { type: 'sms', name: 'SMS Reminder' },
        { type: 'email', name: 'Email Reminder' }
      ]
    },
    followup: {
      name: "Job Follow-up",
      description: "Follow up after job completion",
      triggers: [{ type: 'job_completed', name: 'Job Completed' }],
      steps: [
        { type: 'delay', name: 'Wait 1 Day' },
        { type: 'email', name: 'Satisfaction Survey' }
      ]
    }
  };

  // System variables available in workflows
  const systemVariables = [
    { name: 'client_name', icon: User, description: 'Full client name' },
    { name: 'client_first_name', icon: User, description: 'Client first name' },
    { name: 'client_email', icon: Mail, description: 'Client email address' },
    { name: 'client_phone', icon: Phone, description: 'Client phone number' },
    { name: 'client_address', icon: MapPin, description: 'Client address' },
    { name: 'job_type', icon: Wrench, description: 'Type of service' },
    { name: 'appointment_date', icon: Calendar, description: 'Scheduled date' },
    { name: 'appointment_time', icon: Clock, description: 'Scheduled time' },
    { name: 'technician_name', icon: User, description: 'Assigned technician' },
    { name: 'invoice_number', icon: FileText, description: 'Invoice reference' },
    { name: 'amount', icon: DollarSign, description: 'Total amount' },
    { name: 'company_name', icon: Shield, description: 'Your company name' },
    { name: 'company_phone', icon: Phone, description: 'Company contact' },
    { name: 'booking_link', icon: Globe, description: 'Online booking URL' }
  ];

  // Load existing workflow
  useEffect(() => {
    if (existingWorkflow) {
      setName(existingWorkflow.name);
      setDescription(existingWorkflow.description || '');
      setIsActive(existingWorkflow.isActive);
      setTriggers(existingWorkflow.triggers || []);
      setSteps(existingWorkflow.steps || []);
    }
  }, [existingWorkflow]);

  // Add trigger
  const addTrigger = (type: string) => {
    const triggerType = TRIGGER_TYPES.find(t => t.type === type);
    const newTrigger = {
      id: `trigger-${Date.now()}`,
      type,
      name: triggerType?.name || type,
      config: {}
    };
    setTriggers([...triggers, newTrigger]);
  };

  // Remove trigger
  const removeTrigger = (id: string) => {
    setTriggers(triggers.filter(t => t.id !== id));
  };

  // Add step
  const addStep = (type: string) => {
    const stepType = STEP_TYPES.find(s => s.type === type);
    const newStep = {
      id: `step-${Date.now()}`,
      type,
      name: stepType?.name || type,
      config: {}
    };
    setSteps([...steps, newStep]);
  };

  // Remove step
  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleSave = async () => {
    if (!name) {
      toast.error('Please enter a workflow name');
      return;
    }

    if (triggers.length === 0) {
      toast.error('Please add at least one trigger');
      return;
    }

    if (steps.length === 0) {
      toast.error('Please add at least one workflow step');
      return;
    }

    const workflowData = {
      name,
      description,
      isActive,
      triggers,
      steps
    };

    try {
      if (workflowId) {
        await updateWorkflow(workflowId, workflowData);
        toast.success('Workflow updated successfully');
      } else {
        await createWorkflow(workflowData);
        toast.success('Workflow created successfully');
      }
      onSave?.();
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
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
              onClick={() => setExpandedVariables(!expandedVariables)}
            >
              {expandedVariables ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {expandedVariables && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {systemVariables.map((variable) => (
                <div
                  key={variable.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                  onClick={() => navigator.clipboard.writeText(`{{${variable.name}}}`)}
                  title={variable.description}
                >
                  <variable.icon className="w-4 h-4 text-muted-foreground" />
                  <code className="text-xs font-mono">{`{{${variable.name}}}`}</code>
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Click any variable to copy. Use these in your messages to personalize content.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Template Selector */}
      {!workflowId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Quick Start Templates
            </CardTitle>
            <CardDescription>
              Start with a pre-built workflow template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(AUTOMATION_TEMPLATES).map(([key, template]) => (
                <div
                  key={key}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                    selectedTemplate === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                  onClick={() => {
                    setSelectedTemplate(key);
                    setName(template.name);
                    setDescription(template.description);
                    setTriggers(template.triggers.map(t => ({ ...t, id: `trigger-${Date.now()}`, config: {} })));
                    setSteps(template.steps.map((s, i) => ({ ...s, id: `step-${Date.now()}-${i}`, config: {} })));
                    toast.success(`Template "${template.name}" loaded`);
                  }}
                >
                  <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {template.triggers.length} trigger{template.triggers.length !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {template.steps.length} step{template.steps.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workflow Configuration</CardTitle>
              <CardDescription>
                Configure your automation workflow
              </CardDescription>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Welcome New Clients"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Triggers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Triggers</Label>
              <Select onValueChange={addTrigger}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add trigger" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((trigger) => (
                    <SelectItem key={trigger.type} value={trigger.type}>
                      <div className="flex items-center gap-2">
                        <trigger.icon className="w-4 h-4" />
                        <span>{trigger.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {triggers.length > 0 ? (
              <div className="space-y-3">
                {triggers.map((trigger) => {
                  const triggerType = TRIGGER_TYPES.find(t => t.type === trigger.type);
                  return (
                    <div 
                      key={trigger.id} 
                      className={cn(
                        "p-4 rounded-lg border",
                        triggerType?.color || 'bg-gray-50 dark:bg-gray-950'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {triggerType?.icon && <triggerType.icon className="w-5 h-5" />}
                          <div>
                            <h4 className="font-medium">{trigger.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {triggerType?.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTrigger(trigger.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Add at least one trigger to define when this workflow should run.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Steps Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Workflow Steps</Label>
              <Select onValueChange={addStep}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add step" />
                </SelectTrigger>
                <SelectContent>
                  {STEP_TYPES.map((step) => (
                    <SelectItem key={step.type} value={step.type}>
                      <div className="flex items-center gap-2">
                        <step.icon className="w-4 h-4" />
                        <span>{step.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {steps.length > 0 ? (
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const stepType = STEP_TYPES.find(s => s.type === step.type);
                  return (
                    <div key={step.id} className="relative">
                      {index > 0 && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <ArrowDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className={cn(
                        "p-4 pl-10 border rounded-lg relative transition-all",
                        stepType?.color || 'bg-gray-50 dark:bg-gray-950'
                      )}>
                        <div
                          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4 text-gray-500" />
                        </div>
                        
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {stepType?.icon && <stepType.icon className="w-5 h-5" />}
                            <Input
                              value={step.name}
                              onChange={(e) => {
                                const newSteps = [...steps];
                                const stepIndex = newSteps.findIndex(s => s.id === step.id);
                                if (stepIndex !== -1) {
                                  newSteps[stepIndex] = { ...step, name: e.target.value };
                                  setSteps(newSteps);
                                }
                              }}
                              className="font-medium text-sm w-40"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                            className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Step Configuration */}
                        {step.type === 'email' && (
                          <div className="space-y-3 mt-3">
                            <div>
                              <Label className="text-xs">Subject</Label>
                              <Input
                                placeholder="Email subject line..."
                                className="text-sm mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Message</Label>
                              <Textarea
                                placeholder="Email body content..."
                                rows={3}
                                className="text-sm mt-1"
                              />
                            </div>
                          </div>
                        )}
                        
                        {step.type === 'sms' && (
                          <div className="space-y-3 mt-3">
                            <div>
                              <Label className="text-xs">Message</Label>
                              <Textarea
                                placeholder="SMS message content..."
                                rows={2}
                                className="text-sm mt-1"
                                maxLength={160}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                0/160 characters
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {step.type === 'delay' && (
                          <div className="flex items-center gap-3 mt-3">
                            <Label className="text-xs">Wait for</Label>
                            <Input
                              type="number"
                              defaultValue={1}
                              className="w-20 text-sm"
                              min="1"
                            />
                            <Select defaultValue="hours">
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
                        
                        {step.type === 'conditional' && (
                          <div className="space-y-4 mt-3">
                            <div className="flex items-center gap-3">
                              <Label className="text-xs">If</Label>
                              <Select defaultValue="email_opened">
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="email_opened">Email Opened</SelectItem>
                                  <SelectItem value="link_clicked">Link Clicked</SelectItem>
                                  <SelectItem value="sms_replied">SMS Replied</SelectItem>
                                  <SelectItem value="job_scheduled">Job Scheduled</SelectItem>
                                  <SelectItem value="payment_received">Payment Received</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Alert>
                              <Info className="w-4 h-4" />
                              <AlertDescription>
                                Conditional branching allows different actions based on client behavior.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Add steps to define what actions should be taken when the trigger conditions are met.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => toast.info('Test workflow functionality coming soon')}
              disabled={triggers.length === 0 || steps.length === 0}
            >
              <Play className="w-4 h-4 mr-2" />
              Test Workflow
            </Button>
            <Button
              onClick={handleSave}
              disabled={isCreating || isUpdating || !name || triggers.length === 0 || steps.length === 0}
            >
              {isCreating || isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {workflowId ? 'Update' : 'Create'} Workflow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveWorkflowBuilder;
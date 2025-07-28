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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface SimpleWorkflowBuilderProps {
  workflowId?: string | null;
  initialTemplate?: any;
  onSave?: () => void;
  onCancel?: () => void;
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

const SimpleWorkflowBuilder: React.FC<SimpleWorkflowBuilderProps> = ({ 
  workflowId, 
  initialTemplate,
  onSave,
  onCancel
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [triggers, setTriggers] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [expandedVariables, setExpandedVariables] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Automation templates
  const AUTOMATION_TEMPLATES = {
    welcome: {
      name: "Welcome Series",
      description: "Welcome new clients with a series of messages",
      triggers: [{ type: 'client_created', config: {} }],
      steps: [
        {
          id: '1',
          type: 'email',
          name: 'Welcome Email',
          config: {
            subject: 'Welcome to {{company_name}}!',
            message: 'Thank you for choosing us, {{client_name}}!'
          }
        },
        {
          id: '2',
          type: 'delay',
          name: 'Wait 1 Day',
          config: { amount: 1, unit: 'days' }
        },
        {
          id: '3',
          type: 'sms',
          name: 'Follow-up SMS',
          config: {
            message: 'Hi {{client_name}}, how was your experience with us?'
          }
        }
      ]
    },
    payment_reminder: {
      name: "Payment Reminder",
      description: "Remind clients about overdue payments",
      triggers: [{ type: 'payment_overdue', config: { days: 7 } }],
      steps: [
        {
          id: '1',
          type: 'email',
          name: 'Payment Reminder',
          config: {
            subject: 'Payment Reminder - Invoice {{invoice_number}}',
            message: 'Dear {{client_name}}, your payment of ${{amount}} is overdue.'
          }
        }
      ]
    }
  };

  // Load existing workflow
  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    } else if (initialTemplate) {
      applyTemplate(initialTemplate);
    }
  }, [workflowId, initialTemplate]);

  const loadWorkflow = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      if (data) {
        setName(data.name || '');
        setDescription(data.description || '');
        setIsActive(data.enabled ?? true);
        setTriggers(Array.isArray(data.triggers) ? data.triggers : []);
        setSteps(Array.isArray(data.steps) ? data.steps : []);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error('Failed to load workflow');
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = AUTOMATION_TEMPLATES[templateKey as keyof typeof AUTOMATION_TEMPLATES];
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setTriggers(template.triggers);
      setSteps(template.steps);
      setSelectedTemplate(templateKey);
    }
  };

  const addTrigger = () => {
    const newTrigger = {
      id: Date.now().toString(),
      type: '',
      config: {}
    };
    setTriggers([...triggers, newTrigger]);
  };

  const updateTrigger = (index: number, field: string, value: any) => {
    const updated = [...triggers];
    if (field === 'type') {
      updated[index] = { ...updated[index], [field]: value, config: {} };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setTriggers(updated);
  };

  const removeTrigger = (index: number) => {
    setTriggers(triggers.filter((_, i) => i !== index));
  };

  const addStep = () => {
    const newStep = {
      id: Date.now().toString(),
      type: '',
      name: '',
      config: {}
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (index: number, field: string, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const saveWorkflow = async () => {
    if (!name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    if (triggers.length === 0) {
      toast.error('Please add at least one trigger');
      return;
    }

    setIsSaving(true);
    try {
      const workflowData = {
        name: name.trim(),
        description: description.trim(),
        enabled: isActive,
        triggers,
        steps,
        user_id: user?.id,
        organization_id: user?.id, // Using user_id as org_id for now
        workflow_type: 'simple',
        updated_at: new Date().toISOString()
      };

      if (workflowId) {
        const { error } = await supabase
          .from('automation_workflows')
          .update(workflowData)
          .eq('id', workflowId);

        if (error) throw error;
        toast.success('Workflow updated successfully');
      } else {
        const { error } = await supabase
          .from('automation_workflows')
          .insert({
            ...workflowData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Workflow created successfully');
      }

      onSave?.();
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTriggerConfig = (trigger: any, index: number) => {
    const triggerType = TRIGGER_TYPES.find(t => t.type === trigger.type);
    if (!triggerType) return null;

    return (
      <div className="space-y-4 mt-4 p-4 bg-muted rounded-lg">
        <h4 className="font-medium">Trigger Configuration</h4>
        
        {trigger.type === 'payment_overdue' && (
          <div>
            <Label>Days Overdue</Label>
            <Input
              type="number"
              placeholder="7"
              value={trigger.config?.days || ''}
              onChange={(e) => updateTrigger(index, 'config', { ...trigger.config, days: parseInt(e.target.value) || 0 })}
            />
          </div>
        )}

        {trigger.type === 'job_scheduled' && (
          <div>
            <Label>Hours Before Job</Label>
            <Input
              type="number"
              placeholder="24"
              value={trigger.config?.hours || ''}
              onChange={(e) => updateTrigger(index, 'config', { ...trigger.config, hours: parseInt(e.target.value) || 0 })}
            />
          </div>
        )}
      </div>
    );
  };

  const renderStepConfig = (step: any, index: number) => {
    return (
      <div className="space-y-4 mt-4 p-4 bg-muted rounded-lg">
        <div>
          <Label>Step Name</Label>
          <Input
            placeholder="Enter step name"
            value={step.name}
            onChange={(e) => updateStep(index, 'name', e.target.value)}
          />
        </div>

        {(step.type === 'email' || step.type === 'sms') && (
          <>
            {step.type === 'email' && (
              <div>
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject"
                  value={step.config?.subject || ''}
                  onChange={(e) => updateStep(index, 'config', { ...step.config, subject: e.target.value })}
                />
              </div>
            )}
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Enter your message. Use {{variable_name}} for dynamic content."
                value={step.config?.message || ''}
                onChange={(e) => updateStep(index, 'config', { ...step.config, message: e.target.value })}
                rows={4}
              />
            </div>
          </>
        )}

        {step.type === 'delay' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="1"
                value={step.config?.amount || ''}
                onChange={(e) => updateStep(index, 'config', { ...step.config, amount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select
                value={step.config?.unit || 'hours'}
                onValueChange={(value) => updateStep(index, 'config', { ...step.config, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Simple Workflow Builder</h2>
          <p className="text-muted-foreground">Create automated workflows for your business</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={saveWorkflow} disabled={isSaving}>
            {isSaving ? 'Saving...' : workflowId ? 'Update' : 'Save'} Workflow
          </Button>
        </div>
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Quick Templates
          </CardTitle>
          <CardDescription>Start with a pre-built template</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(AUTOMATION_TEMPLATES).map(([key, template]) => (
              <Card 
                key={key} 
                className={cn("cursor-pointer transition-colors", selectedTemplate === key && "ring-2 ring-primary")}
                onClick={() => applyTemplate(key)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Workflow Name *</Label>
            <Input
              placeholder="Enter workflow name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Describe what this workflow does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label>Activate workflow</Label>
          </div>
        </CardContent>
      </Card>

      {/* Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Triggers
            </span>
            <Button onClick={addTrigger} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Trigger
            </Button>
          </CardTitle>
          <CardDescription>When should this workflow run?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {triggers.map((trigger, index) => (
            <Card key={trigger.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Trigger {index + 1}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeTrigger(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Trigger Type</Label>
                    <Select
                      value={trigger.type}
                      onValueChange={(value) => updateTrigger(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIGGER_TYPES.map((type) => (
                          <SelectItem key={type.type} value={type.type}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {renderTriggerConfig(trigger, index)}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {triggers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No triggers added yet. Add a trigger to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Actions
            </span>
            <Button onClick={addStep} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Action
            </Button>
          </CardTitle>
          <CardDescription>What should happen when the workflow is triggered?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <Card key={step.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Action {index + 1}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Action Type</Label>
                    <Select
                      value={step.type}
                      onValueChange={(value) => updateStep(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action type" />
                      </SelectTrigger>
                      <SelectContent>
                        {STEP_TYPES.map((type) => (
                          <SelectItem key={type.type} value={type.type}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {renderStepConfig(step, index)}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {steps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Settings2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No actions added yet. Add an action to define what happens.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Variable className="w-5 h-5" />
            Available Variables
          </CardTitle>
          <CardDescription>Use these variables in your messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Client</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>{"{{client_name}}"}</p>
                <p>{"{{client_email}}"}</p>
                <p>{"{{client_phone}}"}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Job</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>{"{{job_title}}"}</p>
                <p>{"{{job_date}}"}</p>
                <p>{"{{job_address}}"}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Company</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>{"{{company_name}}"}</p>
                <p>{"{{company_phone}}"}</p>
                <p>{"{{company_email}}"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleWorkflowBuilder;
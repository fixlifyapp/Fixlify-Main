import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Zap, 
  Mail, 
  MessageSquare, 
  Clock, 
  Users, 
  Settings,
  Play,
  Save,
  ChevronDown,
  ChevronRight,
  Trash2,
  Copy,
  GripVertical,
  X,
  ArrowDown,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';

// Workflow Step Types
interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  description?: string;
  config: Record<string, any>;
  enabled: boolean;
  order: number;
}

interface WorkflowData {
  id?: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  enabled: boolean;
  category: string;
}

// Trigger Templates
const TRIGGER_TEMPLATES = [
  {
    id: 'job_created',
    name: 'Job Created',
    description: 'When a new job is created',
    icon: <FileText className="w-4 h-4" />,
    category: 'Jobs',
    config: { event: 'job_created' }
  },
  {
    id: 'job_completed',
    name: 'Job Completed',
    description: 'When a job is marked as completed',
    icon: <CheckCircle className="w-4 h-4" />,
    category: 'Jobs',
    config: { event: 'job_completed' }
  },
  {
    id: 'invoice_sent',
    name: 'Invoice Sent',
    description: 'When an invoice is sent to a client',
    icon: <DollarSign className="w-4 h-4" />,
    category: 'Financial',
    config: { event: 'invoice_sent' }
  },
  {
    id: 'payment_received',
    name: 'Payment Received',
    description: 'When a payment is received',
    icon: <DollarSign className="w-4 h-4" />,
    category: 'Financial',
    config: { event: 'payment_received' }
  },
  {
    id: 'client_created',
    name: 'New Client',
    description: 'When a new client is added',
    icon: <Users className="w-4 h-4" />,
    category: 'Clients',
    config: { event: 'client_created' }
  },
  {
    id: 'scheduled_trigger',
    name: 'Schedule',
    description: 'Run on a schedule',
    icon: <Calendar className="w-4 h-4" />,
    category: 'Time',
    config: { event: 'scheduled' }
  }
];

// Action Templates
const ACTION_TEMPLATES = [
  {
    id: 'send_sms',
    name: 'Send SMS',
    description: 'Send an SMS message',
    icon: <MessageSquare className="w-4 h-4" />,
    category: 'Communication',
    config: { type: 'send_sms' }
  },
  {
    id: 'send_email',
    name: 'Send Email',
    description: 'Send an email message',
    icon: <Mail className="w-4 h-4" />,
    category: 'Communication',
    config: { type: 'send_email' }
  },
  {
    id: 'make_call',
    name: 'Make Call',
    description: 'Make an outbound call',
    icon: <Phone className="w-4 h-4" />,
    category: 'Communication',
    config: { type: 'make_call' }
  },
  {
    id: 'create_task',
    name: 'Create Task',
    description: 'Create a new task',
    icon: <CheckCircle className="w-4 h-4" />,
    category: 'Tasks',
    config: { type: 'create_task' }
  },
  {
    id: 'wait_delay',
    name: 'Wait/Delay',
    description: 'Wait for a specified time',
    icon: <Clock className="w-4 h-4" />,
    category: 'Control',
    config: { type: 'wait_delay' }
  }
];

interface EnhancedVerticalWorkflowBuilderProps {
  workflowId?: string;
  template?: any;
  onSave?: (workflow: WorkflowData) => void;
  onCancel?: () => void;
}

export const EnhancedVerticalWorkflowBuilder: React.FC<EnhancedVerticalWorkflowBuilderProps> = ({
  workflowId,
  template,
  onSave,
  onCancel
}) => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  
  const [workflow, setWorkflow] = useState<WorkflowData>({
    name: template?.name || '',
    description: template?.description || '',
    steps: template?.steps || [],
    enabled: true,
    category: template?.category || 'general'
  });
  
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing workflow if editing
  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadWorkflow = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        let parsedSteps: WorkflowStep[] = [];
        try {
          if (typeof data.steps === 'string') {
            parsedSteps = JSON.parse(data.steps);
          } else if (Array.isArray(data.steps)) {
            parsedSteps = data.steps as unknown as WorkflowStep[];
          }
        } catch (error) {
          console.error('Error parsing workflow steps:', error);
          parsedSteps = [];
        }

        setWorkflow({
          id: data.id,
          name: data.name,
          description: data.description || '',
          steps: parsedSteps,
          enabled: data.enabled || true,
          category: data.category || 'general'
        });
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const addStep = (type: 'trigger' | 'action', template: any, insertIndex?: number) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: template.name,
      description: template.description,
      config: { ...template.config },
      enabled: true,
      order: insertIndex !== undefined ? insertIndex : workflow.steps.length
    };

    const updatedSteps = [...workflow.steps];
    if (insertIndex !== undefined) {
      updatedSteps.splice(insertIndex, 0, newStep);
      // Reorder subsequent steps
      updatedSteps.forEach((step, index) => {
        step.order = index;
      });
    } else {
      updatedSteps.push(newStep);
    }

    setWorkflow(prev => ({
      ...prev,
      steps: updatedSteps
    }));

    setExpandedStep(newStep.id);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const removeStep = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId).map((step, index) => ({
        ...step,
        order: index
      }))
    }));
  };

  const duplicateStep = (stepId: string) => {
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) return;

    const newStep: WorkflowStep = {
      ...step,
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${step.name} (Copy)`,
      order: step.order + 1
    };

    const updatedSteps = [...workflow.steps];
    updatedSteps.splice(step.order + 1, 0, newStep);
    updatedSteps.forEach((s, index) => {
      s.order = index;
    });

    setWorkflow(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  const saveWorkflow = async () => {
    if (!workflow.name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    if (workflow.steps.length === 0) {
      toast.error('Please add at least one step to the workflow');
      return;
    }

    try {
      setSaving(true);

      const workflowData = {
        name: workflow.name,
        description: workflow.description,
        steps: JSON.stringify(workflow.steps),
        enabled: workflow.enabled,
        category: workflow.category,
        organization_id: organization?.id,
        user_id: user?.id,
        trigger_type: workflow.steps.find(s => s.type === 'trigger')?.config?.event || 'manual',
        status: workflow.enabled ? 'active' : 'inactive',
        updated_at: new Date().toISOString()
      };

      let result;
      if (workflow.id) {
        // Update existing workflow
        result = await supabase
          .from('automation_workflows')
          .update(workflowData)
          .eq('id', workflow.id)
          .select()
          .single();
      } else {
        // Create new workflow
        result = await supabase
          .from('automation_workflows')
          .insert([{
            ...workflowData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(`Workflow ${workflow.id ? 'updated' : 'created'} successfully!`);
      
      if (onSave) {
        onSave(workflow);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const testWorkflow = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('automation-executor', {
        body: {
          action: 'test',
          workflow: {
            ...workflow,
            organization_id: organization?.id,
            user_id: user?.id
          },
          testData: {
            source: 'workflow_builder_test',
            timestamp: new Date().toISOString(),
            job_id: 'test-job-id',
            client_id: 'test-client-id'
          }
        }
      });

      if (error) throw error;

      toast.success('Workflow test completed successfully!');
      console.log('Test result:', data);
    } catch (error) {
      console.error('Error testing workflow:', error);
      toast.error('Failed to test workflow');
    }
  };

  const renderStepConfig = (step: WorkflowStep) => {
    if (expandedStep !== step.id) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="border-t bg-muted/50 p-4 space-y-4"
      >
        <div className="grid gap-4">
          <div>
            <Label htmlFor={`step-name-${step.id}`}>Step Name</Label>
            <Input
              id={`step-name-${step.id}`}
              value={step.name}
              onChange={(e) => updateStep(step.id, { name: e.target.value })}
              placeholder="Enter step name"
            />
          </div>
          
          <div>
            <Label htmlFor={`step-description-${step.id}`}>Description</Label>
            <Input
              id={`step-description-${step.id}`}
              value={step.description || ''}
              onChange={(e) => updateStep(step.id, { description: e.target.value })}
              placeholder="Enter step description"
            />
          </div>

          {step.type === 'action' && step.config.type === 'send_sms' && (
            <div className="space-y-4">
              <div>
                <Label>SMS Message</Label>
                <Textarea
                  value={step.config.message || ''}
                  onChange={(e) => updateStep(step.id, { 
                    config: { ...step.config, message: e.target.value }
                  })}
                  placeholder="Enter SMS message (you can use variables like {{client.name}}, {{job.number}})"
                  rows={3}
                />
              </div>
              <div>
                <Label>Recipient</Label>
                <Select
                  value={step.config.recipient || 'client'}
                  onValueChange={(value) => updateStep(step.id, { 
                    config: { ...step.config, recipient: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="custom">Custom Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step.type === 'action' && step.config.type === 'send_email' && (
            <div className="space-y-4">
              <div>
                <Label>Email Subject</Label>
                <Input
                  value={step.config.subject || ''}
                  onChange={(e) => updateStep(step.id, { 
                    config: { ...step.config, subject: e.target.value }
                  })}
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <Label>Email Body</Label>
                <Textarea
                  value={step.config.body || ''}
                  onChange={(e) => updateStep(step.id, { 
                    config: { ...step.config, body: e.target.value }
                  })}
                  placeholder="Enter email body (you can use variables like {{client.name}}, {{job.number}})"
                  rows={5}
                />
              </div>
              <div>
                <Label>Recipient</Label>
                <Select
                  value={step.config.recipient || 'client'}
                  onValueChange={(value) => updateStep(step.id, { 
                    config: { ...step.config, recipient: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="custom">Custom Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step.type === 'action' && step.config.type === 'wait_delay' && (
            <div className="space-y-4">
              <div>
                <Label>Delay Duration</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={step.config.duration || 1}
                    onChange={(e) => updateStep(step.id, { 
                      config: { ...step.config, duration: parseInt(e.target.value) || 1 }
                    })}
                    placeholder="Enter duration"
                    min="1"
                  />
                  <Select
                    value={step.config.unit || 'hours'}
                    onValueChange={(value) => updateStep(step.id, { 
                      config: { ...step.config, unit: value }
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
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id={`step-enabled-${step.id}`}
              checked={step.enabled}
              onCheckedChange={(checked) => updateStep(step.id, { enabled: checked })}
            />
            <Label htmlFor={`step-enabled-${step.id}`}>Step Enabled</Label>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            {workflow.id ? 'Edit Workflow' : 'Create New Workflow'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input
              id="workflow-name"
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter workflow name"
            />
          </div>
          
          <div>
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={workflow.description}
              onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this workflow does"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="workflow-enabled"
              checked={workflow.enabled}
              onCheckedChange={(checked) => setWorkflow(prev => ({ ...prev, enabled: checked }))}
            />
            <Label htmlFor="workflow-enabled">Workflow Enabled</Label>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workflow.steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No steps added yet. Add a trigger to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflow.steps
                .sort((a, b) => a.order - b.order)
                .map((step, index) => (
                  <div key={step.id}>
                    <Card className={`transition-all ${!step.enabled ? 'opacity-60' : ''}`}>
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              {step.type === 'trigger' && <Zap className="w-4 h-4 text-primary" />}
                              {step.type === 'action' && step.config.type === 'send_sms' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                              {step.type === 'action' && step.config.type === 'send_email' && <Mail className="w-4 h-4 text-green-500" />}
                              {step.type === 'action' && step.config.type === 'wait_delay' && <Clock className="w-4 h-4 text-orange-500" />}
                              {step.type === 'action' && step.config.type === 'make_call' && <Phone className="w-4 h-4 text-purple-500" />}
                              {step.type === 'action' && step.config.type === 'create_task' && <CheckCircle className="w-4 h-4 text-teal-500" />}
                            </div>
                            <div>
                              <h4 className="font-medium">{step.name}</h4>
                              {step.description && (
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                              )}
                            </div>
                            <Badge variant={step.type === 'trigger' ? 'default' : 'secondary'}>
                              {step.type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                            >
                              {expandedStep === step.id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateStep(step.id)}
                              title="Duplicate Step"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStep(step.id)}
                              title="Remove Step"
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {renderStepConfig(step)}
                        </AnimatePresence>
                      </CardContent>
                    </Card>

                    {/* Add Step Between */}
                    {index < workflow.steps.length - 1 && (
                      <div className="flex justify-center py-2">
                        <div className="flex flex-col items-center gap-2">
                          <ArrowDown className="w-4 h-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Show action selection for inserting between steps
                              const template = ACTION_TEMPLATES[0]; // Default to first action
                              addStep('action', template, index + 1);
                            }}
                            className="h-6 w-6 p-0 rounded-full"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Add Step Buttons */}
          <div className="pt-4 border-t space-y-4">
            {workflow.steps.length === 0 && (
              <div>
                <h4 className="font-medium mb-3">Add a Trigger</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {TRIGGER_TEMPLATES.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => addStep('trigger', template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded bg-primary/10">
                          {template.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {workflow.steps.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Add an Action</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {ACTION_TEMPLATES.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => addStep('action', template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded bg-primary/10">
                          {template.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        <div className="flex gap-2">
          {workflow.steps.length > 0 && (
            <Button variant="outline" onClick={testWorkflow}>
              <Play className="w-4 h-4 mr-2" />
              Test Workflow
            </Button>
          )}
          <Button onClick={saveWorkflow} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : workflow.id ? 'Update' : 'Save'} Workflow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVerticalWorkflowBuilder;
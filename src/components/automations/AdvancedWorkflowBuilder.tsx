import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Plus, Zap, Mail, MessageSquare, Phone, Clock, Trash2, ArrowDown,
  GitBranch, Globe, Bell, Settings, Bot, Sparkles, User, Calendar,
  Tag, Briefcase, ChevronDown, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartTimingOptions } from './SmartTimingOptions';
import { AIAutomationAssistant } from './AIAutomationAssistant';
import { EnhancedTriggerSelector } from './EnhancedTriggerSelector';
import { EnhancedActionSelector } from './EnhancedActionSelector';
import { SmartActionSelector } from './SmartActionSelector';
import { WORKFLOW_TEMPLATES, getPopularTemplates } from '@/data/workflowTemplates';
import { TriggerTypes } from '@/types/automationFramework';
import { supabase } from '@/integrations/supabase/client';
import { useJobStatuses } from '@/hooks/useJobStatuses';
import { AIMessageGeneratorConfig } from './AIMessageGeneratorConfig';
import { TriggerStatusChangeConfig } from './TriggerStatusChangeConfig';
import { TriggerTagsChangeConfig } from './TriggerTagsChangeConfig';

// Generate AI message function
const generateAIMessage = async (
  messageType: 'email' | 'sms',
  config: any,
  onUpdate: (config: any) => void,
  availableVariables: Array<{ name: string; label: string; type: string }>,
  workflowContext?: any
) => {
  onUpdate({ ...config, isGenerating: true });
  
  try {
    // Get context-aware variables based on trigger type
    const getContextAwareVariables = (triggerType?: string) => {
      const baseVars = [
        { name: 'client.firstName', label: 'Client Name' },
        { name: 'company.name', label: 'Company Name' }
      ];

      switch (triggerType) {
        case 'job_scheduled':
        case 'appointment_scheduled':
          return [
            ...baseVars,
            { name: 'job.scheduledDate', label: 'Appointment Date' },
            { name: 'job.scheduledTime', label: 'Appointment Time' },
            { name: 'job.scheduledDateTime', label: 'Full Date & Time' },
            { name: 'job.title', label: 'Service Type' },
            { name: 'job.technician', label: 'Technician Name' },
            { name: 'job.address', label: 'Service Address' }
          ];
        case 'job_completed':
          return [
            ...baseVars,
            { name: 'job.title', label: 'Service Type' },
            { name: 'job.completedDate', label: 'Completion Date' },
            { name: 'job.technician', label: 'Technician Name' },
            { name: 'job.total', label: 'Service Total' }
          ];
        case 'invoice_sent':
        case 'payment_overdue':
          return [
            ...baseVars,
            { name: 'invoice.number', label: 'Invoice Number' },
            { name: 'invoice.total', label: 'Amount Due' },
            { name: 'invoice.dueDate', label: 'Due Date' },
            { name: 'payment.link', label: 'Payment Link' }
          ];
        case 'estimate_sent':
          return [
            ...baseVars,
            { name: 'estimate.number', label: 'Estimate Number' },
            { name: 'estimate.total', label: 'Estimate Amount' },
            { name: 'estimate.validUntil', label: 'Valid Until' },
            { name: 'estimate.link', label: 'View Estimate' }
          ];
        default:
          return [
            ...baseVars,
            { name: 'job.title', label: 'Job Type' },
            { name: 'job.status', label: 'Job Status' },
            { name: 'job.scheduledDate', label: 'Date' },
            { name: 'job.scheduledTime', label: 'Time' }
          ];
      }
    };

    const contextAwareVars = getContextAwareVariables(workflowContext?.triggerType);
    
    // Get context from existing message or workflow
    const userInput = config.message || '';
    const hasUserInput = userInput.trim().length > 0;
    
    // Create context-aware prompt based on trigger
    let contextPrompt = '';
    if (hasUserInput) {
      contextPrompt = `Take this message and improve it by adding appropriate variables: "${userInput}"`;
    } else {
      const triggerContext = workflowContext?.triggerType || 'general';
      switch (triggerContext) {
        case 'job_scheduled':
        case 'appointment_scheduled':
          contextPrompt = `Generate a ${messageType === 'email' ? 'professional appointment confirmation email' : 'friendly appointment reminder SMS'} for a scheduled service appointment`;
          break;
        case 'job_completed':
          contextPrompt = `Generate a ${messageType === 'email' ? 'professional job completion follow-up email' : 'friendly completion SMS'} thanking the customer and asking for feedback`;
          break;
        case 'invoice_sent':
          contextPrompt = `Generate a ${messageType === 'email' ? 'professional invoice email' : 'friendly invoice SMS'} notifying about a new invoice`;
          break;
        case 'payment_overdue':
          contextPrompt = `Generate a ${messageType === 'email' ? 'polite payment reminder email' : 'friendly payment reminder SMS'} for an overdue invoice`;
          break;
        case 'estimate_sent':
          contextPrompt = `Generate a ${messageType === 'email' ? 'professional estimate email' : 'friendly estimate SMS'} presenting a service estimate`;
          break;
        default:
          contextPrompt = `Generate a ${messageType === 'email' ? 'professional email' : 'friendly SMS'} message`;
      }
    }

    const { data, error } = await supabase.functions.invoke('generate-ai-message', {
      body: {
        messageType: messageType === 'email' ? 'professional' : 'friendly',
        context: contextPrompt,
        userInput: userInput,
        hasUserInput: hasUserInput,
        variables: contextAwareVars,
        triggerType: workflowContext?.triggerType,
        companyInfo: {
          businessType: 'service company',
          tone: 'professional'
        }
      }
    });

    if (error) throw error;

    if (data?.message) {
      onUpdate({ 
        ...config, 
        message: data.message,
        subject: messageType === 'email' && data.subject ? data.subject : config.subject,
        isGenerating: false
      });
    }
  } catch (error) {
    console.error('Error generating AI message:', error);
    onUpdate({ ...config, isGenerating: false });
  }
};

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'branch' | 'webhook' | 'task' | 'notification';
  name: string;
  config: any;
  conditions?: ConditionGroup;
  branches?: WorkflowBranch[];
  enabled?: boolean;
}

interface WorkflowBranch {
  id: string;
  name: string;
  condition: ConditionGroup;
  steps: WorkflowStep[];
}

interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: Condition[];
}

interface Condition {
  field: string;
  operator: string;
  value: any;
}

interface WorkflowBuilderProps {
  initialWorkflow?: WorkflowStep[];
  onSave: (workflow: WorkflowStep[]) => void;
  onCancel?: () => void;
  availableVariables: Array<{ name: string; label: string; type: string }>;
  businessType?: string;
  companyName?: string;
}

export const AdvancedWorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  initialWorkflow = [],
  onSave,
  onCancel,
  availableVariables,
  businessType = 'General Service',
  companyName = 'Your Company'
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>(initialWorkflow);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [workflowTitle, setWorkflowTitle] = useState('Untitled Workflow');
  const [timingConfig, setTimingConfig] = useState({
    businessHours: true,
    businessStart: '09:00',
    businessEnd: '17:00',
    timezone: 'customer_local',
    quietHours: true,
    quietStart: '21:00',
    quietEnd: '08:00',
    optimalSend: false,
    recurring: false,
    recurringType: 'none'
  });

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: getDefaultStepName(type),
      config: getDefaultStepConfig(type)
    };

    if (type === 'branch') {
      newStep.branches = [
        {
          id: `branch-${Date.now()}-1`,
          name: 'If',
          condition: { operator: 'AND', conditions: [] },
          steps: []
        },
        {
          id: `branch-${Date.now()}-2`,
          name: 'Else',
          condition: { operator: 'AND', conditions: [] },
          steps: []
        }
      ];
    }

    setSteps([...steps, newStep]);
  };

  const getDefaultStepName = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'trigger': return 'New Trigger';
      case 'action': return 'Send Message';
      case 'condition': return 'Check Condition';
      case 'delay': return 'Wait';
      case 'branch': return 'If/Then/Else';
      case 'webhook': return 'Send Webhook';
      case 'task': return 'Create Task';
      case 'notification': return 'Send Notification';
      default: return 'New Step';
    }
  };

  const getDefaultStepConfig = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'trigger':
        return {
          triggerType: 'job_created',
          conditions: []
        };
      case 'action':
        return {
          actionType: 'email',
          subject: '',
          message: '',
          sendTime: 'immediately',
          templateId: null
        };
      case 'delay':
        return {
          delayType: 'hours',
          delayValue: 24,
          businessHours: false
        };
      case 'condition':
        return {
          field: 'invoice_amount',
          operator: 'greater_than',
          value: 500
        };
      case 'webhook':
        return {
          url: '',
          method: 'POST',
          headers: {},
          body: '{}'
        };
      case 'task':
        return {
          title: '',
          description: '',
          assignTo: 'creator',
          priority: 'medium',
          dueDate: null
        };
      case 'notification':
        return {
          type: 'push',
          title: '',
          message: '',
          channels: ['app']
        };
      default:
        return {};
    }
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < steps.length) {
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
      setSteps(newSteps);
    }
  };

  const handleAIWorkflowGenerated = (workflow: any) => {
    if (workflow && workflow.steps) {
      setSteps(workflow.steps);
      setShowAIAssistant(false);
    }
  };

  const handleAITemplateSelected = (template: any) => {
    // Convert template to workflow steps
    const templateSteps = convertTemplateToSteps(template);
    setSteps(templateSteps);
    setShowAIAssistant(false);
  };

  const convertTemplateToSteps = (template: any): WorkflowStep[] => {
    // Simple template to steps conversion
    return [
      {
        id: `step-${Date.now()}`,
        type: 'action',
        name: template.name,
        config: {
          actionType: 'email',
          subject: `${template.name} - {{company.name}}`,
          message: `Generated from ${template.name} template`
        }
      }
    ];
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workflow Builder</h2>
          <p className="text-muted-foreground">Create intelligent automations for your business</p>
        </div>
        <Button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          variant={showAIAssistant ? "default" : "outline"}
          className="gap-2"
        >
          <Bot className="w-4 h-4" />
          {showAIAssistant ? 'Hide AI Assistant' : 'AI Assistant'}
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AIAutomationAssistant
            onWorkflowGenerated={handleAIWorkflowGenerated}
            onTemplateSelected={handleAITemplateSelected}
            businessType={businessType}
            existingData={{
              jobs: 0,
              clients: 0,
              revenue: 0
            }}
          />
        </motion.div>
      )}

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="actions">Enhanced Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          {/* Workflow Canvas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Workflow Steps
                {steps.length > 0 && (
                  <Badge variant="secondary">{steps.length} steps</Badge>
                )}
              </CardTitle>
              <div className="mt-4">
                <Label htmlFor="workflow-title" className="text-sm font-medium">
                  Workflow Name
                </Label>
                <Input
                  id="workflow-title"
                  value={workflowTitle}
                  onChange={(e) => setWorkflowTitle(e.target.value)}
                  placeholder="Enter workflow name..."
                  className="max-w-md mt-2"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <WorkflowStepCard
                        step={step}
                        index={index}
                        totalSteps={steps.length}
                        isSelected={selectedStep === step.id}
                        onSelect={() => setSelectedStep(step.id)}
                        onUpdate={(updates) => updateStep(step.id, updates)}
                        onDelete={() => deleteStep(step.id)}
                        onMove={(direction) => moveStep(index, direction)}
                        availableVariables={availableVariables}
                      />

                      {index < steps.length - 1 && (
                        <div className="flex justify-center my-2">
                          <ArrowDown className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add Step Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('trigger')}
                    className="gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Add Trigger
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('action')}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Action
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('delay')}
                    className="gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Add Delay
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('branch')}
                    className="gap-2"
                  >
                    <GitBranch className="w-4 h-4" />
                    Add If/Then/Else
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={() => onSave(steps)}>Save Workflow</Button>
          </div>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Action Library</CardTitle>
              <p className="text-muted-foreground">
                Create powerful actions with multi-channel communication and business automation
              </p>
            </CardHeader>
            <CardContent>
              <EnhancedActionSelector
                onActionSelect={(action) => {
                  // Add action as workflow step
                  const actionStep: WorkflowStep = {
                    id: `action-${Date.now()}`,
                    type: 'action',
                    name: action.name,
                    config: {
                      actionType: action.type,
                      ...action.config
                    }
                  };
                  setSteps([...steps, actionStep]);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Workflow Step Card Component
const WorkflowStepCard: React.FC<{
  step: WorkflowStep;
  index: number;
  totalSteps: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  availableVariables: Array<{ name: string; label: string; type: string }>;
}> = ({ step, index, totalSteps, isSelected, onSelect, onUpdate, onDelete, onMove, availableVariables }) => {
  const getStepIcon = () => {
    switch (step.type) {
      case 'trigger': return <Zap className="w-4 h-4" />;
      case 'action':
        switch (step.config.actionType) {
          case 'email': return <Mail className="w-4 h-4" />;
          case 'sms': return <MessageSquare className="w-4 h-4" />;
          case 'call': return <Phone className="w-4 h-4" />;
          case 'ai_generate_message': return <Bot className="w-4 h-4" />;
          default: return <Zap className="w-4 h-4" />;
        }
      case 'delay': return <Clock className="w-4 h-4" />;
      case 'branch': return <GitBranch className="w-4 h-4" />;
      case 'condition': return <AlertCircle className="w-4 h-4" />;
      case 'webhook': return <Globe className="w-4 h-4" />;
      case 'task': return <User className="w-4 h-4" />;
      case 'notification': return <Bell className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all",
        isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {getStepIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Step {index + 1}:</span>
                <Input
                  value={step.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 w-48"
                />
              </div>

              {/* Step Content Preview */}
              {step.type === 'trigger' && (
                <StepTriggerConfig
                  config={step.config}
                  onUpdate={(config) => onUpdate({ config })}
                />
              )}

              {step.type === 'action' && (
                <StepActionConfig
                  config={step.config}
                  onUpdate={(config) => onUpdate({ config })}
                  availableVariables={availableVariables}
                  workflowContext={{
                    triggerType: 'job_scheduled' // Default for now, will be enhanced later
                  }}
                />
              )}

              {step.type === 'delay' && (
                <StepDelayConfig
                  config={step.config}
                  onUpdate={(config) => onUpdate({ config })}
                />
              )}

              {step.type === 'condition' && (
                <StepConditionConfig
                  config={step.config}
                  onUpdate={(config) => onUpdate({ config })}
                  availableVariables={availableVariables}
                />
              )}

              {step.type === 'branch' && (
                <StepBranchConfig
                  branches={step.branches || []}
                  onUpdate={(branches) => onUpdate({ branches })}
                  availableVariables={availableVariables}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onMove('up');
              }}
              disabled={index === 0}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onMove('down');
              }}
              disabled={index === totalSteps - 1}
            >
              ↓
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Trigger Step Configuration
const StepTriggerConfig: React.FC<{
  config: any;
  onUpdate: (config: any) => void;
}> = ({ config, onUpdate }) => {
  return (
    <div className="space-y-3 mt-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-2">
        <Select
          value={config.triggerType}
          onValueChange={(value) => onUpdate({ ...config, triggerType: value })}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom">{/* Force dropdown to open downward */}
            {/* Job Management Triggers */}
            <SelectItem value="job_created">Job Created</SelectItem>
            <SelectItem value="job_status_changed">Job Status Changed</SelectItem>
            <SelectItem value="job_scheduled">Job Scheduled</SelectItem>
            <SelectItem value="job_completed">Job Completed</SelectItem>
            <SelectItem value="job_tags_changed">Job Tags Changed</SelectItem>
            
            {/* Client Management Triggers */}
            <SelectItem value="client_created">Client Created</SelectItem>
            <SelectItem value="client_updated">Client Updated</SelectItem>
            <SelectItem value="client_tags_changed">Client Tags Changed</SelectItem>
            
            {/* Financial Triggers */}
            <SelectItem value="estimate_sent">Estimate Sent</SelectItem>
            <SelectItem value="estimate_accepted">Estimate Accepted</SelectItem>
            <SelectItem value="estimate_rejected">Estimate Rejected</SelectItem>
            <SelectItem value="estimate_status_changed">Estimate Status Changed</SelectItem>
            <SelectItem value="invoice_sent">Invoice Sent</SelectItem>
            <SelectItem value="invoice_overdue">Invoice Overdue</SelectItem>
            <SelectItem value="payment_received">Payment Received</SelectItem>
            
            {/* Configuration Triggers */}
            <SelectItem value="job_status_created">Job Status Created</SelectItem>
            <SelectItem value="job_status_updated">Job Status Updated</SelectItem>
            <SelectItem value="tag_created">Tag Created</SelectItem>
            <SelectItem value="tag_updated">Tag Updated</SelectItem>
            <SelectItem value="lead_source_created">Lead Source Created</SelectItem>
            <SelectItem value="lead_source_updated">Lead Source Updated</SelectItem>
            
            {/* Time-Based Triggers */}
            <SelectItem value="scheduled_time">Scheduled Time</SelectItem>
            <SelectItem value="relative_time">Relative Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Job Status Changed Configuration */}
      {config.triggerType === 'job_status_changed' && (
        <TriggerStatusChangeConfig 
          config={config} 
          onUpdate={onUpdate}
        />
      )}
      
      {/* Job Tags Changed Configuration */}
      {config.triggerType === 'job_tags_changed' && (
        <TriggerTagsChangeConfig 
          config={config} 
          onUpdate={onUpdate}
        />
      )}
      
      {/* Client Tags Changed Configuration */}
      {config.triggerType === 'client_tags_changed' && (
        <TriggerTagsChangeConfig 
          config={config} 
          onUpdate={onUpdate}
          isClientTags={true}
        />
      )}
      
      {config.triggerType === 'scheduled_time' && (
        <div className="flex items-center gap-2">
          <Input
            type="datetime-local"
            value={config.scheduledTime || ''}
            onChange={(e) => onUpdate({ ...config, scheduledTime: e.target.value })}
            className="w-48"
          />
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        This trigger starts the workflow when the selected event occurs.
      </div>
    </div>
  );
};

// Condition Step Configuration
const StepConditionConfig: React.FC<{
  config: any;
  onUpdate: (config: any) => void;
  availableVariables: Array<{ name: string; label: string; type: string }>;
}> = ({ config, onUpdate, availableVariables }) => {
  return (
    <div className="space-y-3 mt-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <Select
          value={config.field}
          onValueChange={(value) => onUpdate({ ...config, field: value })}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent side="bottom">{/* Force dropdown to open downward */}
            {availableVariables.map((variable) => (
              <SelectItem key={variable.name} value={variable.name}>
                {variable.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={config.operator}
          onValueChange={(value) => onUpdate({ ...config, operator: value })}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom">{/* Force dropdown to open downward */}
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="not_equals">Not Equals</SelectItem>
            <SelectItem value="greater_than">Greater Than</SelectItem>
            <SelectItem value="less_than">Less Than</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
          </SelectContent>
        </Select>

        <Input
          value={config.value}
          onChange={(e) => onUpdate({ ...config, value: e.target.value })}
          placeholder="Value"
          className="w-32"
        />
      </div>
    </div>
  );
};

const StepActionConfig: React.FC<{
  config: any;
  onUpdate: (config: any) => void;
  availableVariables: Array<{ name: string; label: string; type: string }>;
  workflowContext?: any;
}> = ({ config, onUpdate, availableVariables, workflowContext }) => {
  const [showTiming, setShowTiming] = useState(false);
  
  return (
    <div className="space-y-3 mt-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-2">
        <Select
          value={config.actionType}
          onValueChange={(value) => onUpdate({ ...config, actionType: value })}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom">{/* Force dropdown to open downward */}
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="notification">App Notification</SelectItem>
            <SelectItem value="task">Create Task</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Timing Settings Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTiming(!showTiming)}
          className="gap-2"
        >
          <Clock className="w-4 h-4" />
          Timing
        </Button>
      </div>

      {config.actionType === 'email' && (
        <>
          <Input
            placeholder="Subject"
            value={config.subject || ''}
            onChange={(e) => onUpdate({ ...config, subject: e.target.value })}
          />
          <div className="relative">
            <Textarea
              placeholder="Message"
              value={config.message || ''}
              onChange={(e) => onUpdate({ ...config, message: e.target.value })}
              rows={3}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateAIMessage('email', config, onUpdate, availableVariables, workflowContext)}
              className="absolute top-2 right-2 h-6 w-6 p-0"
              disabled={config.isGenerating}
            >
              {config.isGenerating ? (
                <div className="w-3 h-3 border border-current border-t-transparent animate-spin rounded-full" />
              ) : (
                <Bot className="w-3 h-3" />
              )}
            </Button>
          </div>
        </>
      )}

      {config.actionType === 'sms' && (
        <div className="relative">
          <Textarea
            placeholder="SMS Message (160 characters)"
            value={config.message || ''}
            onChange={(e) => onUpdate({ ...config, message: e.target.value })}
            rows={2}
            maxLength={160}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateAIMessage('sms', config, onUpdate, availableVariables, workflowContext)}
            className="absolute top-2 right-2 h-6 w-6 p-0"
            disabled={config.isGenerating}
          >
            {config.isGenerating ? (
              <div className="w-3 h-3 border border-current border-t-transparent animate-spin rounded-full" />
            ) : (
              <Bot className="w-3 h-3" />
            )}
          </Button>
        </div>
      )}

      {config.actionType === 'ai_generate_message' && (
        <AIMessageGeneratorConfig
          config={config}
          onUpdate={onUpdate}
          availableVariables={availableVariables}
        />
      )}

      {/* Show AI Generator when triggered */}
      {config.showAIGenerator && (
        <AIMessageGeneratorConfig
          config={config}
          onUpdate={(newConfig) => {
            // Remove the trigger flag and update
            const { showAIGenerator, ...updatedConfig } = newConfig;
            onUpdate(updatedConfig);
          }}
          availableVariables={availableVariables}
        />
      )}
      
      {/* Timing Options */}
      {showTiming && (
        <div className="mt-4">
          <SmartTimingOptions 
            config={config.timing || {}}
            onConfigChange={(timingConfig) => {
              onUpdate({ ...config, timing: timingConfig });
            }}
          />
        </div>
      )}

      {/* Variable Insertion */}
      <div className="flex flex-wrap gap-1">
        {/* Important Variables Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs h-6"
            >
              <Plus className="w-3 h-3" />
              Variables
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 max-h-64 overflow-y-auto bg-background border shadow-lg z-50"
            align="start"
          >
            {/* Important variables first */}
            <DropdownMenuItem
              onClick={() => {
                const currentMessage = config.message || '';
                onUpdate({ ...config, message: currentMessage + ` {{client.firstName}}` });
              }}
            >
              <User className="w-3 h-3 mr-2" />
              Client Name
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const currentMessage = config.message || '';
                onUpdate({ ...config, message: currentMessage + ` {{job.formattedDate}}` });
              }}
            >
              <Calendar className="w-3 h-3 mr-2" />
              Appointment Date
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const currentMessage = config.message || '';
                onUpdate({ ...config, message: currentMessage + ` {{job.appointmentTime}}` });
              }}
            >
              <Clock className="w-3 h-3 mr-2" />
              Appointment Time
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const currentMessage = config.message || '';
                onUpdate({ ...config, message: currentMessage + ` {{job.scheduledDateTime}}` });
              }}
            >
              <Calendar className="w-3 h-3 mr-2" />
              Full Appointment
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const currentMessage = config.message || '';
                onUpdate({ ...config, message: currentMessage + ` {{job.title}}` });
              }}
            >
              <Briefcase className="w-3 h-3 mr-2" />
              Job Type
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const currentMessage = config.message || '';
                onUpdate({ ...config, message: currentMessage + ` {{company.name}}` });
              }}
            >
              <Settings className="w-3 h-3 mr-2" />
              Company Name
            </DropdownMenuItem>
            {/* Additional variables */}
            {availableVariables.filter(v => 
              !['client.firstName', 'job.formattedDate', 'job.appointmentTime', 'job.scheduledDateTime', 'job.title', 'company.name'].includes(v.name)
            ).slice(0, 6).map((variable) => (
              <DropdownMenuItem
                key={variable.name}
                onClick={() => {
                  const currentMessage = config.message || '';
                  onUpdate({ ...config, message: currentMessage + ` {{${variable.name}}}` });
                }}
              >
                <Tag className="w-3 h-3 mr-2" />
                {variable.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Quick access to top 3 variables */}
        {availableVariables.slice(0, 3).map((variable) => (
          <Badge
            key={variable.name}
            variant="outline"
            className="cursor-pointer text-xs"
            onClick={() => {
              const currentMessage = config.message || '';
              onUpdate({ ...config, message: currentMessage + ` {{${variable.name}}}` });
            }}
          >
            +{variable.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// Delay Step Configuration
const StepDelayConfig: React.FC<{
  config: any;
  onUpdate: (config: any) => void;
}> = ({ config, onUpdate }) => {
  return (
    <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
      <span className="text-sm text-muted-foreground">Wait</span>
      <Input
        type="number"
        value={config.delayValue}
        onChange={(e) => onUpdate({ ...config, delayValue: parseInt(e.target.value) })}
        className="w-20 h-8"
      />
      <Select
        value={config.delayType}
        onValueChange={(value) => onUpdate({ ...config, delayType: value })}
      >
        <SelectTrigger className="w-32 h-8">
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
  );
};

// Branch Step Configuration
const StepBranchConfig: React.FC<{
  branches: WorkflowBranch[];
  onUpdate: (branches: WorkflowBranch[]) => void;
  availableVariables: Array<{ name: string; label: string; type: string }>;
}> = ({ branches, onUpdate, availableVariables }) => {
  const addCondition = (branchId: string) => {
    const newBranches = branches.map(branch => {
      if (branch.id === branchId) {
        return {
          ...branch,
          condition: {
            ...branch.condition,
            conditions: [
              ...branch.condition.conditions,
              { field: '', operator: 'equals', value: '' }
            ]
          }
        };
      }
      return branch;
    });
    onUpdate(newBranches);
  };

  return (
    <div className="space-y-4 mt-3" onClick={(e) => e.stopPropagation()}>
      {branches.slice(0, 1).map((branch) => ( // Only show "If" branch in preview
        <div key={branch.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{branch.name}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addCondition(branch.id)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Condition
            </Button>
          </div>

          {branch.condition.conditions.map((condition, index) => (
            <div key={index} className="flex items-center gap-2 pl-4">
              <Select
                value={condition.field}
                onValueChange={(value) => {
                  const newConditions = [...branch.condition.conditions];
                  newConditions[index].field = value;
                  onUpdate(branches.map(b =>
                    b.id === branch.id
                      ? { ...b, condition: { ...b.condition, conditions: newConditions } }
                      : b
                  ));
                }}
              >
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {availableVariables.map((variable) => (
                    <SelectItem key={variable.name} value={variable.name}>
                      {variable.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={condition.operator}
                onValueChange={(value) => {
                  const newConditions = [...branch.condition.conditions];
                  newConditions[index].operator = value;
                  onUpdate(branches.map(b =>
                    b.id === branch.id
                      ? { ...b, condition: { ...b.condition, conditions: newConditions } }
                      : b
                  ));
                }}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="not_contains">Doesn't Contain</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={condition.value}
                onChange={(e) => {
                  const newConditions = [...branch.condition.conditions];
                  newConditions[index].value = e.target.value;
                  onUpdate(branches.map(b =>
                    b.id === branch.id
                      ? { ...b, condition: { ...b.condition, conditions: newConditions } }
                      : b
                  ));
                }}
                placeholder="Value"
                className="w-32 h-8"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

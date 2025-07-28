import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Save, Trash2, ChevronDown, Info, Sparkles,
  Calendar, CheckCircle, Send, DollarSign, AlertCircle,
  User, FileText, Clock, Star, Tag, UserPlus, MessageSquare,
  Mail, Phone, Bell, Timer, Target, Zap, X, Play, Pause,
  History, Variable, GripVertical, ArrowDown, Code, Webhook,
  Wand2, RefreshCw, Edit3, ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface WorkflowTrigger {
  type: string;
  name: string;
  icon: any;
  color: string;
  category: string;
  description: string;
  config?: any;
}

interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  icon: any;
  description: string;
  config: any;
  deliveryWindow?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone?: string;
    weekdays?: boolean[];
  };
}

interface WorkflowCondition {
  field: string;
  operator: string;
  value: string;
  connector?: 'and' | 'or';
  fieldType?: string;
}

interface SimpleWorkflowBuilderProps {
  workflowId?: string;
  onSave?: (workflow: any) => void;
  loadedTemplate?: any;
  onCancel?: () => void;
}

// Trigger options
const TRIGGERS: WorkflowTrigger[] = [
  // Jobs
  { type: 'job_created', name: 'Job Created', icon: Plus, color: 'blue', category: 'Jobs', description: 'When a new job is created' },
  { type: 'job_scheduled', name: 'Job Scheduled', icon: Calendar, color: 'blue', category: 'Jobs', description: 'When a job is scheduled' },
  { type: 'job_completed', name: 'Job Completed', icon: CheckCircle, color: 'green', category: 'Jobs', description: 'When a job is marked complete' },
  { type: 'job_status_changed', name: 'Job Status Changed', icon: Target, color: 'blue', category: 'Jobs', description: 'When job status is updated' },
  
  // Financial
  { type: 'estimate_sent', name: 'Estimate Sent', icon: Send, color: 'purple', category: 'Financial', description: 'When an estimate is sent' },
  { type: 'estimate_approved', name: 'Estimate Approved', icon: CheckCircle, color: 'purple', category: 'Financial', description: 'When an estimate is approved' },
  { type: 'invoice_sent', name: 'Invoice Sent', icon: FileText, color: 'purple', category: 'Financial', description: 'When an invoice is sent' },
  { type: 'payment_received', name: 'Payment Received', icon: DollarSign, color: 'green', category: 'Financial', description: 'When payment is received' },
  { type: 'payment_overdue', name: 'Payment Overdue', icon: AlertCircle, color: 'red', category: 'Financial', description: 'When payment becomes overdue' },
  
  // Customers
  { type: 'customer_created', name: 'Customer Created', icon: UserPlus, color: 'teal', category: 'Customers', description: 'When a new customer is added' },
  { type: 'customer_tagged', name: 'Customer Tagged', icon: Tag, color: 'teal', category: 'Customers', description: 'When a customer is tagged' },
  
  // Tasks
  { type: 'task_created', name: 'Task Created', icon: Plus, color: 'orange', category: 'Tasks', description: 'When a task is created' },
  { type: 'task_completed', name: 'Task Completed', icon: CheckCircle, color: 'orange', category: 'Tasks', description: 'When a task is marked done' },
];

// Action options
const ACTION_TYPES = [
  { type: 'send_sms', name: 'Send SMS', icon: MessageSquare, description: 'Send a text message' },
  { type: 'send_email', name: 'Send Email', icon: Mail, description: 'Send an email' },
  { type: 'send_notification', name: 'Send Notification', icon: Bell, description: 'Send in-app notification' },
  { type: 'create_task', name: 'Create Task', icon: Plus, description: 'Create a follow-up task' },
  { type: 'update_status', name: 'Update Status', icon: Target, description: 'Change job or invoice status' },
  { type: 'add_tag', name: 'Add Tag', icon: Tag, description: 'Add a tag to customer or job' },
  { type: 'webhook', name: 'Call Webhook', icon: Webhook, description: 'Send data to external service' },
  { type: 'wait', name: 'Wait', icon: Clock, description: 'Add a delay before next action' },
];

// Variables for message templates
const AVAILABLE_VARIABLES = {
  client: [
    { name: 'client.name', description: 'Client full name' },
    { name: 'client.firstName', description: 'Client first name' },
    { name: 'client.email', description: 'Client email address' },
    { name: 'client.phone', description: 'Client phone number' },
    { name: 'client.address', description: 'Client address' },
  ],
  job: [
    { name: 'job.number', description: 'Job number' },
    { name: 'job.type', description: 'Job type' },
    { name: 'job.status', description: 'Job status' },
    { name: 'job.scheduledDate', description: 'Scheduled date' },
    { name: 'job.address', description: 'Job address' },
    { name: 'job.description', description: 'Job description' },
  ],
  company: [
    { name: 'company.name', description: 'Company name' },
    { name: 'company.phone', description: 'Company phone' },
    { name: 'company.website', description: 'Company website' },
  ],
  technician: [
    { name: 'technician.name', description: 'Assigned technician name' },
    { name: 'technician.phone', description: 'Technician phone' },
  ]
};

// Sortable Step Component
const SortableStep: React.FC<{
  step: WorkflowStep;
  index: number;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
  onDelete: () => void;
  companyTimezone?: string;
}> = ({ step, index, onUpdate, onDelete, companyTimezone }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const insertVariable = (variable: string, field: 'subject' | 'content' | 'message') => {
    const currentValue = step.config[field] || '';
    const newValue = currentValue + `{{${variable}}}`;
    onUpdate({ config: { ...step.config, [field]: newValue } });
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Step Icon */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              "bg-primary/10 text-primary"
            )}>
              <step.icon className="h-4 w-4" />
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{step.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      Step {index + 1}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 w-8 p-0"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded Configuration */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-4 pl-11">
                      {/* SMS Configuration */}
                      {step.type === 'send_sms' && (
                        <>
                          <div>
                            <Label className="text-xs">Message</Label>
                            <div className="flex gap-2 mt-1">
                              <Textarea
                                placeholder="Enter SMS message..."
                                value={step.config.message || ''}
                                onChange={(e) => onUpdate({ config: { ...step.config, message: e.target.value } })}
                                className="resize-none"
                                rows={3}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowVariables(!showVariables)}
                                className="shrink-0"
                              >
                                <Variable className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {step.config.message?.length || 0}/160 characters
                            </div>
                          </div>

                          {/* Variables Panel */}
                          {showVariables && (
                            <div className="border rounded-lg p-3 bg-muted/50">
                              <Label className="text-xs font-medium">Insert Variables</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {Object.entries(AVAILABLE_VARIABLES).map(([category, variables]) => (
                                  <div key={category}>
                                    <div className="text-xs font-medium capitalize mb-1">{category}</div>
                                    {variables.map((variable) => (
                                      <Button
                                        key={variable.name}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs justify-start w-full"
                                        onClick={() => insertVariable(variable.name, 'message')}
                                      >
                                        {`{{${variable.name}}}`}
                                      </Button>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Email Configuration */}
                      {step.type === 'send_email' && (
                        <>
                          <div>
                            <Label className="text-xs">Subject</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                placeholder="Email subject..."
                                value={step.config.subject || ''}
                                onChange={(e) => onUpdate({ config: { ...step.config, subject: e.target.value } })}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowVariables(!showVariables)}
                                className="shrink-0"
                              >
                                <Variable className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Content</Label>
                            <Textarea
                              placeholder="Email content..."
                              value={step.config.content || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, content: e.target.value } })}
                              rows={4}
                              className="mt-1"
                            />
                          </div>

                          {/* Variables Panel */}
                          {showVariables && (
                            <div className="border rounded-lg p-3 bg-muted/50">
                              <Label className="text-xs font-medium">Insert Variables</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {Object.entries(AVAILABLE_VARIABLES).map(([category, variables]) => (
                                  <div key={category}>
                                    <div className="text-xs font-medium capitalize mb-1">{category}</div>
                                    {variables.map((variable) => (
                                      <Button
                                        key={variable.name}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs justify-start w-full"
                                        onClick={() => insertVariable(variable.name, 'content')}
                                      >
                                        {`{{${variable.name}}}`}
                                      </Button>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Wait Configuration */}
                      {step.type === 'wait' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Duration</Label>
                            <Input
                              type="number"
                              placeholder="1"
                              value={step.config.duration || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, duration: e.target.value } })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Unit</Label>
                            <Select
                              value={step.config.unit || 'hours'}
                              onValueChange={(value) => onUpdate({ config: { ...step.config, unit: value } })}
                            >
                              <SelectTrigger className="mt-1">
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

                      {/* Task Creation Configuration */}
                      {step.type === 'create_task' && (
                        <>
                          <div>
                            <Label className="text-xs">Task Title</Label>
                            <Input
                              placeholder="Task title..."
                              value={step.config.title || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, title: e.target.value } })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              placeholder="Task description..."
                              value={step.config.description || ''}
                              onChange={(e) => onUpdate({ config: { ...step.config, description: e.target.value } })}
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SimpleWorkflowBuilder: React.FC<SimpleWorkflowBuilderProps> = ({
  workflowId,
  onSave,
  loadedTemplate,
  onCancel
}) => {
  // State
  const [workflowName, setWorkflowName] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<WorkflowTrigger | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [conditions, setConditions] = useState<WorkflowCondition[]>([]);
  const [showConditions, setShowConditions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load template or existing workflow
  useEffect(() => {
    if (loadedTemplate) {
      setWorkflowName(loadedTemplate.name || '');
      // Load trigger
      if (loadedTemplate.triggers?.[0]) {
        const trigger = TRIGGERS.find(t => t.type === loadedTemplate.triggers[0].type);
        if (trigger) setSelectedTrigger(trigger);
      }
      // Load steps
      if (loadedTemplate.steps?.length > 0) {
        const loadedSteps = loadedTemplate.steps.map((step: any) => {
          const actionType = ACTION_TYPES.find(a => a.type === step.type);
          return {
            id: step.id || `step-${Date.now()}-${Math.random()}`,
            type: step.type,
            name: actionType?.name || step.name,
            icon: actionType?.icon || Clock,
            description: actionType?.description || '',
            config: step.config || {}
          };
        });
        setSteps(loadedSteps);
      }
    }
  }, [loadedTemplate]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addStep = (actionType: typeof ACTION_TYPES[0]) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}-${Math.random()}`,
      type: actionType.type,
      name: actionType.name,
      icon: actionType.icon,
      description: actionType.description,
      config: {}
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const saveWorkflow = async () => {
    if (!selectedTrigger || !workflowName.trim()) {
      toast.error('Please select a trigger and enter a workflow name');
      return;
    }

    setIsSaving(true);

    try {
      const workflowData = {
        name: workflowName,
        trigger_type: selectedTrigger.type,
        trigger_config: selectedTrigger.config || {},
        action_config: steps.map(step => ({
          type: step.type,
          config: step.config
        })),
        enabled: isActive,
        user_id: 'current-user',
        organization_id: 'current-org'
      };

      const { error } = await supabase
        .from('automation_workflows')
        .insert(workflowData);

      if (error) throw error;

      toast.success('Workflow saved successfully!');
      onSave?.(workflowData);
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Simple Workflow Builder</h1>
          <p className="text-muted-foreground">Create automated workflows for your business</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label className="text-sm">Active</Label>
          </div>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={saveWorkflow}
            disabled={isSaving || !selectedTrigger || !workflowName.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </Button>
        </div>
      </div>

      {/* Workflow Name */}
      <Card>
        <CardContent className="p-4">
          <div>
            <Label>Workflow Name</Label>
            <Input
              placeholder="Enter workflow name..."
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trigger Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <Label className="font-medium">When this happens (Trigger)</Label>
            </div>

            {selectedTrigger ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  `bg-${selectedTrigger.color}-100 text-${selectedTrigger.color}-600`
                )}>
                  <selectedTrigger.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{selectedTrigger.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedTrigger.description}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTrigger(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {TRIGGERS.map((trigger) => (
                  <Button
                    key={trigger.type}
                    variant="outline"
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setSelectedTrigger(trigger)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        `bg-${trigger.color}-100 text-${trigger.color}-600`
                      )}>
                        <trigger.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{trigger.name}</div>
                        <div className="text-xs text-muted-foreground">{trigger.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      {selectedTrigger && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-primary" />
                <Label className="font-medium">Then do this (Actions)</Label>
              </div>

              {/* Existing Steps */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {steps.map((step, index) => (
                    <SortableStep
                      key={step.id}
                      step={step}
                      index={index}
                      onUpdate={(updates) => updateStep(step.id, updates)}
                      onDelete={() => deleteStep(step.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Add Step */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Action
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {ACTION_TYPES.map((actionType) => (
                    <DropdownMenuItem
                      key={actionType.type}
                      onClick={() => addStep(actionType)}
                      className="flex items-center gap-2"
                    >
                      <actionType.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{actionType.name}</div>
                        <div className="text-xs text-muted-foreground">{actionType.description}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleWorkflowBuilder;

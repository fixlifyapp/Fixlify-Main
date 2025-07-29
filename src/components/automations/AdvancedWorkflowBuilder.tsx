import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Trash2, Clock, Calendar, Mail, MessageSquare, Phone,
  ChevronRight, AlertCircle, DollarSign, Star, User, Settings,
  Zap, ArrowDown, GitBranch, Timer, Sun, Moon, Globe, Bot, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AIAutomationAssistant } from './AIAutomationAssistant';
import { EnhancedTriggerSelector } from './EnhancedTriggerSelector';
import { EnhancedActionSelector } from './EnhancedActionSelector';
import { WORKFLOW_TEMPLATES, getPopularTemplates } from '@/data/workflowTemplates';
import { TriggerTypes } from '@/types/automationFramework';

interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay' | 'branch';
  name: string;
  config: any;
  conditions?: ConditionGroup;
  branches?: WorkflowBranch[];
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
  availableVariables: Array<{ name: string; label: string; type: string }>;
  businessType?: string;
  companyName?: string;
}

export const AdvancedWorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  initialWorkflow = [],
  onSave,
  availableVariables,
  businessType = 'General Service',
  companyName = 'Your Company'
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>(initialWorkflow);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showTriggerSelector, setShowTriggerSelector] = useState(false);

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
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
      case 'action': return 'Send Message';
      case 'condition': return 'Check Condition';
      case 'delay': return 'Wait';
      case 'branch': return 'If/Then/Else';
      default: return 'New Step';
    }
  };

  const getDefaultStepConfig = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'action':
        return {
          actionType: 'email',
          subject: '',
          message: '',
          sendTime: 'immediately'
        };
      case 'delay':
        return {
          delayType: 'hours',
          delayValue: 24
        };
      case 'condition':
        return {
          field: 'invoice_amount',
          operator: 'greater_than',
          value: 500
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
                onClick={() => setShowTriggerSelector(!showTriggerSelector)}
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

            {/* Inline Trigger Selector */}
            {showTriggerSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 border rounded-lg bg-muted/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Add Trigger</h4>
                    <p className="text-sm text-muted-foreground">
                      Select a trigger to start your workflow
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTriggerSelector(false)}
                  >
                    ✕
                  </Button>
                </div>
                <EnhancedTriggerSelector
                  onTriggerSelect={(trigger) => {
                    // Add trigger as first step
                    const triggerStep: WorkflowStep = {
                      id: `trigger-${Date.now()}`,
                      type: 'action', // Using action type for now, could extend to trigger type
                      name: `Trigger: ${trigger.name}`,
                      config: {
                        actionType: 'trigger',
                        triggerType: trigger.type,
                        triggerConfig: trigger.config
                      }
                    };
                    setSteps([triggerStep, ...steps]);
                    setShowTriggerSelector(false);
                  }}
                />
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Smart Timing Options */}
      <SmartTimingOptions />

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
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
      case 'action':
        switch (step.config.actionType) {
          case 'email': return <Mail className="w-4 h-4" />;
          case 'sms': return <MessageSquare className="w-4 h-4" />;
          case 'call': return <Phone className="w-4 h-4" />;
          default: return <Zap className="w-4 h-4" />;
        }
      case 'delay': return <Clock className="w-4 h-4" />;
      case 'branch': return <GitBranch className="w-4 h-4" />;
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
              {step.type === 'action' && (
                <StepActionConfig
                  config={step.config}
                  onUpdate={(config) => onUpdate({ config })}
                  availableVariables={availableVariables}
                />
              )}

              {step.type === 'delay' && (
                <StepDelayConfig
                  config={step.config}
                  onUpdate={(config) => onUpdate({ config })}
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

// Action Step Configuration
const StepActionConfig: React.FC<{
  config: any;
  onUpdate: (config: any) => void;
  availableVariables: Array<{ name: string; label: string; type: string }>;
}> = ({ config, onUpdate, availableVariables }) => {
  return (
    <div className="space-y-3 mt-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-2">
        <Select
          value={config.actionType}
          onValueChange={(value) => onUpdate({ ...config, actionType: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="notification">App Notification</SelectItem>
            <SelectItem value="task">Create Task</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.actionType === 'email' && (
        <>
          <Input
            placeholder="Subject"
            value={config.subject || ''}
            onChange={(e) => onUpdate({ ...config, subject: e.target.value })}
          />
          <Textarea
            placeholder="Message"
            value={config.message || ''}
            onChange={(e) => onUpdate({ ...config, message: e.target.value })}
            rows={3}
          />
        </>
      )}

      {config.actionType === 'sms' && (
        <Textarea
          placeholder="SMS Message (160 characters)"
          value={config.message || ''}
          onChange={(e) => onUpdate({ ...config, message: e.target.value })}
          rows={2}
          maxLength={160}
        />
      )}

      {/* Variable Insertion */}
      <div className="flex flex-wrap gap-1">
        {availableVariables.slice(0, 5).map((variable) => (
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

// Smart Timing Options Component
const SmartTimingOptions: React.FC = () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Timing Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Business Hours */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Label>Send during business hours only</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={timingConfig.businessHours}
                onCheckedChange={(checked) =>
                  setTimingConfig({ ...timingConfig, businessHours: checked })
                }
              />
              {timingConfig.businessHours && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={timingConfig.businessStart}
                    onChange={(e) =>
                      setTimingConfig({ ...timingConfig, businessStart: e.target.value })
                    }
                    className="w-24 h-8"
                  />
                  <span className="text-sm">to</span>
                  <Input
                    type="time"
                    value={timingConfig.businessEnd}
                    onChange={(e) =>
                      setTimingConfig({ ...timingConfig, businessEnd: e.target.value })
                    }
                    className="w-24 h-8"
                  />
                </div>
              )}
            </div>
          </div>


          {/* Timezone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Label>Timezone</Label>
            </div>
            <Select
              value={timingConfig.timezone}
              onValueChange={(value) =>
                setTimingConfig({ ...timingConfig, timezone: value })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_local">Customer's Local Time</SelectItem>
                <SelectItem value="business">Business Time</SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optimal Send Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label>AI Optimal Send Time</Label>
                <p className="text-xs text-muted-foreground">
                  AI learns the best time to reach each customer
                </p>
              </div>
            </div>
            <Switch
              checked={timingConfig.optimalSend}
              onCheckedChange={(checked) =>
                setTimingConfig({ ...timingConfig, optimalSend: checked })
              }
            />
          </div>

          {/* Recurring Schedule */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Label>Recurring Schedule</Label>
            </div>
            <Select
              value={timingConfig.recurringType}
              onValueChange={(value) =>
                setTimingConfig({ ...timingConfig, recurringType: value, recurring: value !== 'none' })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export type { WorkflowStep };

export default AdvancedWorkflowBuilder;
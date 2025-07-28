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
  Zap, ArrowDown, GitBranch, Timer, Sun, Moon, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  onCancel?: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  initialWorkflow = [],
  onSave,
  availableVariables,
  onCancel
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>(initialWorkflow);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

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
          recipient: 'client'
        };
      case 'delay':
        return {
          amount: 1,
          unit: 'hours',
          respectBusinessHours: false
        };
      case 'condition':
        return {
          field: '',
          operator: 'equals',
          value: ''
        };
      case 'branch':
        return {};
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
    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    
    const newSteps = [...steps];
    [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];
    setSteps(newSteps);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Workflow Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  onMove={(direction) => moveStep(step.id, direction)}
                  availableVariables={availableVariables}
                />
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {steps.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No steps added yet</p>
              <p className="text-sm text-muted-foreground">Add your first step below</p>
            </div>
          )}
          
          {/* Add Step Buttons */}
          <div className="flex justify-center">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addStep('action')}
                className="gap-2"
              >
                <Zap className="w-4 h-4" />
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

      {/* Smart Timing Options */}
      <SmartTimingOptions />

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        )}
        <Button onClick={() => onSave(steps)}>Save Workflow</Button>
      </div>
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
              const currentValue = config.message || '';
              onUpdate({ 
                ...config, 
                message: currentValue + `{{${variable.name}}}` 
              });
            }}
          >
            {variable.label}
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
    <div className="space-y-2 mt-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          placeholder="Amount"
          value={config.amount || ''}
          onChange={(e) => onUpdate({ ...config, amount: parseInt(e.target.value) })}
          className="w-20"
        />
        <Select
          value={config.unit}
          onValueChange={(value) => onUpdate({ ...config, unit: value })}
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
      
      <div className="flex items-center gap-2">
        <Switch
          checked={config.respectBusinessHours}
          onCheckedChange={(checked) => onUpdate({ ...config, respectBusinessHours: checked })}
        />
        <Label className="text-sm">Respect business hours</Label>
      </div>
    </div>
  );
};

// Branch Step Configuration
const StepBranchConfig: React.FC<{
  branches: WorkflowBranch[];
  onUpdate: (branches: WorkflowBranch[]) => void;
  availableVariables: Array<{ name: string; label: string; type: string }>;
}> = ({ branches, onUpdate, availableVariables }) => {
  return (
    <div className="space-y-2 mt-3" onClick={(e) => e.stopPropagation()}>
      <div className="text-sm text-muted-foreground">Branch configuration will be added here</div>
    </div>
  );
};

// Smart Timing Options Component
const SmartTimingOptions: React.FC = () => {
  const [timingConfig, setTimingConfig] = useState({
    businessHours: false,
    businessStart: '09:00',
    businessEnd: '17:00',
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00',
    timezone: 'customer_local',
    optimalSend: false,
    recurring: false,
    recurringType: 'none'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5" />
          Smart Timing Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Business Hours */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Label>Only during business hours</Label>
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

          {/* Quiet Hours */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <Label>Respect quiet hours</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={timingConfig.quietHours}
                onCheckedChange={(checked) => 
                  setTimingConfig({ ...timingConfig, quietHours: checked })
                }
              />
              {timingConfig.quietHours && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={timingConfig.quietStart}
                    onChange={(e) => 
                      setTimingConfig({ ...timingConfig, quietStart: e.target.value })
                    }
                    className="w-24 h-8"
                  />
                  <span className="text-sm">to</span>
                  <Input
                    type="time"
                    value={timingConfig.quietEnd}
                    onChange={(e) => 
                      setTimingConfig({ ...timingConfig, quietEnd: e.target.value })
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

export default WorkflowBuilder;
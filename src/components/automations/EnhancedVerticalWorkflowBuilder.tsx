import React, { useState, useRef, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, Active, Over } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOrganization } from '@/hooks/use-organization';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useMessageTemplates, useUpdateTemplateUsage } from '@/hooks/useMessageTemplates';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, Save, Play, Clock, Mail, MessageSquare, Phone, Bell,
  ChevronRight, DollarSign, User, Calendar, Wrench, MapPin,
  Hash, Shield, CheckCircle, FileText, BarChart3, AlertCircle,
  Sparkles, Variable, Copy, Star, Settings2, GripVertical,
  GitBranch, Timer, Sun, Moon, Globe, Trash2, Edit3, X,
  Activity, Zap, UserPlus, Receipt, Tag, Target, MessageCircle,
  ChevronDown, ChevronUp, Layers, Eye, EyeOff, CheckSquare,
  CircleCheck, CircleX, Info, Filter, Calculator, Database,
  Send, Bot, Code, Webhook, ArrowRight, ArrowDown, MoreVertical,
  Pause, PlayCircle, TestTube, History, HelpCircle, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  category?: string;
  name: string;
  description?: string;
  icon?: any;
  color?: string;
  config: any;
  enabled?: boolean;
}

interface WorkflowBranch {
  id: string;
  name: string;
  condition: any;
  steps: WorkflowStep[];
}

// Trigger templates
const TRIGGER_TEMPLATES = [
  {
    id: 'job_scheduled',
    name: 'Job Scheduled',
    icon: Calendar,
    color: 'bg-blue-500',
    category: 'Jobs',
    description: 'When a new job is scheduled',
    configFields: ['timeBeforeJob', 'jobTypes', 'technicians']
  },
  {
    id: 'job_completed',
    name: 'Job Completed',
    icon: CheckCircle,
    color: 'bg-green-500',
    category: 'Jobs',
    description: 'When a job is marked complete',
    configFields: ['completionStatus', 'withInvoice']
  },
  {
    id: 'invoice_sent',
    name: 'Invoice Sent',
    icon: Send,
    color: 'bg-purple-500',
    category: 'Financial',
    description: 'When an invoice is sent to client',
    configFields: ['amountRange']
  },
  {
    id: 'payment_received',
    name: 'Payment Received',
    icon: DollarSign,
    color: 'bg-emerald-500',
    category: 'Financial',
    description: 'When a payment is received',
    configFields: ['paymentMethod', 'amountRange']
  },
  {
    id: 'payment_overdue',
    name: 'Payment Overdue',
    icon: AlertCircle,
    color: 'bg-red-500',
    category: 'Financial',
    description: 'When payment becomes overdue',
    configFields: ['daysOverdue', 'minimumAmount']
  },
  {
    id: 'client_created',
    name: 'New Client Added',
    icon: UserPlus,
    color: 'bg-cyan-500',
    category: 'Clients',
    description: 'When a new client is created',
    configFields: ['clientType', 'source']
  },
  {
    id: 'estimate_approved',
    name: 'Estimate Approved',
    icon: CircleCheck,
    color: 'bg-teal-500',
    category: 'Sales',
    description: 'When client approves an estimate',
    configFields: []
  },
  {
    id: 'review_received',
    name: 'Review Received',
    icon: Star,
    color: 'bg-yellow-500',
    category: 'Engagement',
    description: 'When a customer leaves a review',
    configFields: ['minRating', 'platform']
  },
  {
    id: 'form_submitted',
    name: 'Form Submitted',
    icon: CheckSquare,
    color: 'bg-indigo-500',
    category: 'Engagement',
    description: 'When a form is submitted',
    configFields: ['formType']
  },
  {
    id: 'schedule_time',
    name: 'Scheduled Time',
    icon: Clock,
    color: 'bg-orange-500',
    category: 'Time',
    description: 'At a specific time or interval',
    configFields: ['scheduleType', 'time', 'days']
  }
];
// Action templates
const ACTION_TEMPLATES = [
  {
    id: 'send_email',
    name: 'Send Email',
    icon: Mail,
    color: 'bg-blue-500',
    category: 'Communication',
    description: 'Send an email to client or team',
    configFields: ['recipient', 'template', 'customMessage']
  },
  {
    id: 'send_sms',
    name: 'Send SMS',
    icon: MessageSquare,
    color: 'bg-green-500',
    category: 'Communication',
    description: 'Send a text message',
    configFields: ['recipient', 'message']
  },
  {
    id: 'send_push',
    name: 'Push Notification',
    icon: Bell,
    color: 'bg-purple-500',
    category: 'Communication',
    description: 'Send app notification',
    configFields: ['recipient', 'title', 'message']
  },
  {
    id: 'create_task',
    name: 'Create Task',
    icon: CheckSquare,
    color: 'bg-orange-500',
    category: 'Tasks',
    description: 'Create a task for team member',
    configFields: ['assignee', 'title', 'description', 'dueDate', 'priority']
  },
  {
    id: 'update_job',
    name: 'Update Job Status',
    icon: Edit3,
    color: 'bg-indigo-500',
    category: 'Data',
    description: 'Update job information',
    configFields: ['status', 'fields']
  },
  {
    id: 'add_tag',
    name: 'Add Tag',
    icon: Tag,
    color: 'bg-pink-500',
    category: 'Data',
    description: 'Add tag to client or job',
    configFields: ['tagName', 'target']
  },
  {
    id: 'create_invoice',
    name: 'Create Invoice',
    icon: FileText,
    color: 'bg-violet-500',
    category: 'Financial',
    description: 'Generate an invoice',
    configFields: ['template', 'dueDate']
  },
  {
    id: 'webhook',
    name: 'Call Webhook',
    icon: Webhook,
    color: 'bg-gray-500',
    category: 'Integration',
    description: 'Send data to external service',
    configFields: ['url', 'method', 'headers', 'body']
  }
];

// Draggable Step Component
const DraggableStep: React.FC<{
  step: WorkflowStep;
  index: number;
  isOverlay?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}> = ({ step, index, isOverlay, onEdit, onDelete, onDuplicate }) => {
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
  };

  const Icon = step.icon || Zap;
  const [isExpanded, setIsExpanded] = useState(true);

  if (isOverlay) {
    return (
      <div className="bg-background border-2 border-primary rounded-lg p-4 shadow-2xl opacity-90">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg text-white", step.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold">{step.name}</h4>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50"
      )}
    >
      {/* Connection Line */}
      {index > 0 && (
        <div className="absolute left-1/2 -top-4 w-0.5 h-4 bg-border" />
      )}

      <Card className={cn(
        "transition-all duration-200",
        !step.enabled && "opacity-50",
        isDragging && "cursor-grabbing"
      )}>
        <CardContent className="p-0">
          <div className="flex items-start">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="p-4 cursor-grab hover:bg-muted/50 transition-colors"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Step Content */}
            <div className="flex-1 p-4 pl-0">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    "p-2 rounded-lg text-white shrink-0",
                    step.color || "bg-gray-500"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{step.name}</h4>
                      {step.type === 'trigger' && (
                        <Badge variant="secondary" className="text-xs">Trigger</Badge>
                      )}
                      {step.type === 'condition' && (
                        <Badge variant="outline" className="text-xs">Condition</Badge>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    )}
                    
                    {/* Quick Config Preview */}
                    {isExpanded && step.config && Object.keys(step.config).length > 0 && (
                      <div className="mt-3 space-y-2">
                        {step.config.recipient && (
                          <div className="flex items-center gap-2 text-xs">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">To:</span>
                            <span className="font-medium">{step.config.recipient}</span>
                          </div>
                        )}
                        {step.config.template && (
                          <div className="flex items-center gap-2 text-xs">
                            <FileText className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Template:</span>
                            <span className="font-medium">{step.config.template}</span>
                          </div>
                        )}
                        {step.config.delayValue && (
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Wait:</span>
                            <span className="font-medium">
                              {step.config.delayValue} {step.config.delayUnit}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onEdit}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onDuplicate}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="p-4 pl-0">
              <Switch
                checked={step.enabled !== false}
                onCheckedChange={(checked) => {
                  step.enabled = checked;
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add Step Menu Component
const AddStepMenu: React.FC<{
  onAddStep: (type: string, template?: any) => void;
  position?: number;
}> = ({ onAddStep, position }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative my-4">
      <div className="absolute left-1/2 -top-4 w-0.5 h-4 bg-border" />
      <div className="absolute left-1/2 -bottom-4 w-0.5 h-4 bg-border" />
      
      <div className="flex justify-center">
        {!isOpen ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full"
            onClick={() => setIsOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Step
          </Button>
        ) : (
          <Card className="w-full max-w-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Add a Step</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="actions" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="conditions">Logic</TabsTrigger>
                  <TabsTrigger value="delays">Timing</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="actions" className="mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    {ACTION_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        className="h-auto p-4 justify-start"
                        onClick={() => {
                          onAddStep('action', template);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg text-white", template.color)}>
                            <template.icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {template.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="conditions" className="mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => {
                        onAddStep('condition', {
                          id: 'if_else',
                          name: 'If/Else Condition',
                          icon: GitBranch,
                          color: 'bg-purple-500',
                          description: 'Branch workflow based on conditions'
                        });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-500 text-white">
                          <GitBranch className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">If/Else Condition</div>
                          <div className="text-xs text-muted-foreground">
                            Branch based on conditions
                          </div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => {
                        onAddStep('condition', {
                          id: 'filter',
                          name: 'Filter',
                          icon: Filter,
                          color: 'bg-orange-500',
                          description: 'Continue only if conditions are met'
                        });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-orange-500 text-white">
                          <Filter className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Filter</div>
                          <div className="text-xs text-muted-foreground">
                            Continue only if conditions are met
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="delays" className="mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => {
                        onAddStep('delay', {
                          id: 'delay',
                          name: 'Delay',
                          icon: Clock,
                          color: 'bg-amber-500',
                          description: 'Wait before continuing'
                        });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-500 text-white">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Delay</div>
                          <div className="text-xs text-muted-foreground">
                            Wait for a specific time
                          </div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => {
                        onAddStep('delay', {
                          id: 'schedule',
                          name: 'Wait Until',
                          icon: Calendar,
                          color: 'bg-blue-500',
                          description: 'Wait until specific time/date'
                        });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-500 text-white">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Wait Until</div>
                          <div className="text-xs text-muted-foreground">
                            Wait until specific time
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => {
                        onAddStep('action', {
                          id: 'ai_action',
                          name: 'AI Action',
                          icon: Bot,
                          color: 'bg-gradient-to-r from-violet-500 to-purple-500',
                          description: 'Use AI to process data'
                        });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">AI Action</div>
                          <div className="text-xs text-muted-foreground">
                            Use AI to process data
                          </div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => {
                        onAddStep('action', {
                          id: 'code',
                          name: 'Custom Code',
                          icon: Code,
                          color: 'bg-gray-500',
                          description: 'Run custom JavaScript'
                        });
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gray-500 text-white">
                          <Code className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">Custom Code</div>
                          <div className="text-xs text-muted-foreground">
                            Run custom JavaScript
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Step Configuration Panel
const StepConfigPanel: React.FC<{
  step: WorkflowStep;
  onUpdate: (config: any) => void;
  onClose: () => void;
}> = ({ step, onUpdate, onClose }) => {
  const [config, setConfig] = useState(step.config || {});
  
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  return (
    <div className="space-y-4">
      {step.type === 'trigger' && (
        <div className="space-y-4">
          {step.id === 'job_scheduled' && (
            <div className="space-y-4">
              <div>
                <Label>Trigger Timing</Label>
                <Select
                  value={config.timingType || 'before'}
                  onValueChange={(value) => updateConfig('timingType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before Job</SelectItem>
                    <SelectItem value="after">After Job</SelectItem>
                    <SelectItem value="on">When Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {config.timingType === 'before' && (
                <div>
                  <Label>Time Before Job</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={config.timeValue || 24}
                      onChange={(e) => updateConfig('timeValue', parseInt(e.target.value))}
                      className="w-24"
                    />
                    <Select
                      value={config.timeUnit || 'hours'}
                      onValueChange={(value) => updateConfig('timeUnit', value)}
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
              )}
              
              <div>
                <Label>Job Types (Optional)</Label>
                <Select
                  value={config.jobTypes || 'all'}
                  onValueChange={(value) => updateConfig('jobTypes', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Types</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {step.id === 'payment_overdue' && (
            <>
              <div>
                <Label>Days Overdue</Label>
                <Input
                  type="number"
                  value={config.daysOverdue || 1}
                  onChange={(e) => updateConfig('daysOverdue', parseInt(e.target.value))}
                  placeholder="1"
                />
              </div>
              
              <div>
                <Label>Minimum Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={config.minimumAmount || ''}
                    onChange={(e) => updateConfig('minimumAmount', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="pl-9"
                  />
                </div>
              </div>
            </>
          )}
          
          {step.id === 'schedule_time' && (
            <>
              <div>
                <Label>Schedule Type</Label>
                <Select
                  value={config.scheduleType || 'once'}
                  onValueChange={(value) => updateConfig('scheduleType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One Time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {config.scheduleType === 'daily' && (
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={config.time || '09:00'}
                    onChange={(e) => updateConfig('time', e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {(step.type === 'action' || step.id?.includes('send')) && (
        <>
          <div>
            <Label>Send To</Label>
            <Select
              value={config.recipient || 'client'}
              onValueChange={(value) => updateConfig('recipient', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="technician">Assigned Technician</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="custom">Custom Email/Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {config.recipient === 'custom' && (
            <div>
              <Label>Email/Phone</Label>
              <Input
                value={config.customRecipient || ''}
                onChange={(e) => updateConfig('customRecipient', e.target.value)}
                placeholder="email@example.com or +1234567890"
              />
            </div>
          )}
          
          {step.id === 'send_email' && (
            <>
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentEditingStep(step.id);
                    setShowTemplates(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Use Template
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentEditingStep(step.id);
                    setShowAIDialog(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Write with AI
                </Button>
              </div>
              
              <div>
                <Label>Email Template</Label>
                <Select
                  value={config.template || 'custom'}
                  onValueChange={(value) => updateConfig('template', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                    <SelectItem value="job_complete">Job Complete</SelectItem>
                    <SelectItem value="invoice_sent">Invoice Sent</SelectItem>
                    <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                    <SelectItem value="thank_you">Thank You</SelectItem>
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {config.template === 'custom' && (
                <>
                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={config.subject || ''}
                      onChange={(e) => updateConfig('subject', e.target.value)}
                      placeholder="Email subject"
                    />
                  </div>
                  
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      value={config.message || ''}
                      onChange={(e) => updateConfig('message', e.target.value)}
                      placeholder="Email message..."
                      rows={4}
                    />
                  </div>
                </>
              )}
            </>
          )}
          
          {step.id === 'send_sms' && (
            <>
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentEditingStep(step.id);
                    setShowTemplates(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Use Template
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentEditingStep(step.id);
                    setShowAIDialog(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Write with AI
                </Button>
              </div>
              
              <div>
                <Label>Message</Label>
                <Textarea
                  value={config.message || ''}
                  onChange={(e) => updateConfig('message', e.target.value)}
                  placeholder="SMS message (160 characters)"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {config.message?.length || 0}/160 characters
                </p>
              </div>
            </>
          )}
        </>
      )}
      
      {step.type === 'delay' && (
        <>
          <div>
            <Label>Delay Duration</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={config.delayValue || 1}
                onChange={(e) => updateConfig('delayValue', parseInt(e.target.value))}
                className="w-24"
              />
              <Select
                value={config.delayUnit || 'hours'}
                onValueChange={(value) => updateConfig('delayUnit', value)}
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
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="business-hours"
                checked={config.businessHours || false}
                onCheckedChange={(checked) => updateConfig('businessHours', checked)}
              />
              <Label htmlFor="business-hours">Only during business hours</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="skip-weekends"
                checked={config.skipWeekends || false}
                onCheckedChange={(checked) => updateConfig('skipWeekends', checked)}
              />
              <Label htmlFor="skip-weekends">Skip weekends</Label>
            </div>
          </div>
        </>
      )}
      
      {step.type === 'condition' && (
        <>
          <div>
            <Label>Condition Type</Label>
            <Select
              value={config.conditionType || 'field'}
              onValueChange={(value) => updateConfig('conditionType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="field">Field Value</SelectItem>
                <SelectItem value="exists">Field Exists</SelectItem>
                <SelectItem value="empty">Field is Empty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {config.conditionType === 'field' && (
            <>
              <div>
                <Label>Field</Label>
                <Select
                  value={config.field || ''}
                  onValueChange={(value) => updateConfig('field', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_status">Job Status</SelectItem>
                    <SelectItem value="invoice_amount">Invoice Amount</SelectItem>
                    <SelectItem value="client_type">Client Type</SelectItem>
                    <SelectItem value="payment_status">Payment Status</SelectItem>
                    <SelectItem value="job_type">Job Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Operator</Label>
                <Select
                  value={config.operator || 'equals'}
                  onValueChange={(value) => updateConfig('operator', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not Equals</SelectItem>
                    <SelectItem value="greater_than">Greater Than</SelectItem>
                    <SelectItem value="less_than">Less Than</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Value</Label>
                <Input
                  value={config.value || ''}
                  onChange={(e) => updateConfig('value', e.target.value)}
                  placeholder="Enter value"
                />
              </div>
            </>
          )}
        </>
      )}
      
      {/* Variable Helper */}
      <div className="border-t pt-4">
        <Label className="text-xs text-muted-foreground mb-2 block">
          Available Variables (click to copy)
        </Label>
        <div className="flex flex-wrap gap-1">
          {['{{client_name}}', '{{job_date}}', '{{invoice_amount}}', '{{technician_name}}'].map((variable) => (
            <Badge
              key={variable}
              variant="outline"
              className="text-xs cursor-pointer hover:bg-secondary"
              onClick={() => {
                navigator.clipboard.writeText(variable);
                toast.success('Variable copied!');
              }}
            >
              {variable}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Vertical Workflow Builder Component
const VerticalWorkflowBuilder: React.FC<{
  workflowId?: string;
  onSave?: (workflow: any) => void;
}> = ({ workflowId, onSave }) => {
  console.log('VerticalWorkflowBuilder mounted with workflowId:', workflowId);
  
  const { organization } = useOrganization();
  const { companyInfo } = useCompanySettings();
  const { data: messageTemplates = [], isLoading: templatesLoading } = useMessageTemplates();
  const { updateUsage } = useUpdateTemplateUsage();
  
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTriggerMenu, setShowTriggerMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [currentEditingStep, setCurrentEditingStep] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Add initial trigger
  const addTrigger = (template: any) => {
    const newStep: WorkflowStep = {
      id: `trigger-${Date.now()}`,
      type: 'trigger',
      category: template.category,
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      config: {},
      enabled: true
    };
    setSteps([newStep]);
    setShowTriggerMenu(false);
  };

  // Add step
  const addStep = (type: string, template?: any) => {
    const newStep: WorkflowStep = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      category: template?.category,
      name: template?.name || type,
      description: template?.description,
      icon: template?.icon,
      color: template?.color,
      config: {},
      enabled: true
    };
    setSteps([...steps, newStep]);
  };

  // Delete step
  const deleteStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
    if (selectedStep?.id === id) {
      setSelectedStep(null);
      setShowConfigPanel(false);
    }
  };

  // Duplicate step
  const duplicateStep = (step: WorkflowStep) => {
    const newStep = {
      ...step,
      id: `${step.type}-${Date.now()}`,
      name: `${step.name} (Copy)`
    };
    const index = steps.findIndex(s => s.id === step.id);
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, newStep);
    setSteps(newSteps);
  };

  // Update step config
  const updateStepConfig = (stepId: string, config: any) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, config } : step
    ));
  };

  // Apply message template
  const applyMessageTemplate = async (template: any, stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const newConfig = { ...step.config };
    
    // Apply template content based on step type
    if (step.id === 'send_email') {
      newConfig.subject = template.subject || '';
      newConfig.message = template.content;
      newConfig.template = 'custom';
    } else if (step.id === 'send_sms') {
      newConfig.message = template.content;
    }
    
    updateStepConfig(stepId, newConfig);
    
    // Update template usage statistics
    if (template.id) {
      await updateUsage(template.id);
    }
    
    setShowTemplates(false);
    setSelectedTemplate(null);
    setCurrentEditingStep(null);
    toast.success('Template applied successfully!');
  };

  // Generate AI content
  const generateAIContent = async () => {
    if (!aiPrompt.trim() || !currentEditingStep) return;
    
    setGeneratingAI(true);
    try {
      // Simulate AI generation - in real implementation, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const step = steps.find(s => s.id === currentEditingStep);
      if (!step) return;
      
      const newConfig = { ...step.config };
      
      // Generate content based on prompt
      const generatedContent = `Dear {{client_name}},\n\n${aiPrompt}\n\nBest regards,\n{{company_name}}`;
      
      if (step.id === 'send_email') {
        newConfig.subject = `Important: ${aiPrompt.slice(0, 50)}...`;
        newConfig.message = generatedContent;
        newConfig.template = 'custom';
      } else if (step.id === 'send_sms') {
        newConfig.message = generatedContent.slice(0, 160);
      }
      
      updateStepConfig(currentEditingStep, newConfig);
      
      toast.success('AI content generated successfully!');
      setShowAIDialog(false);
      setAiPrompt('');
      setCurrentEditingStep(null);
    } catch (error) {
      toast.error('Failed to generate AI content');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Save workflow
  const handleSave = () => {
    const workflow = {
      name: workflowName,
      description: workflowDescription,
      isActive,
      steps,
      triggers: steps.filter(s => s.type === 'trigger'),
      actions: steps.filter(s => s.type === 'action'),
    };
    
    onSave?.(workflow);
    toast.success('Workflow saved successfully');
  };

  // Test workflow
  const handleTest = () => {
    toast.info('Running workflow test...');
    // Implement test logic
  };

  const hasTrigger = steps.some(s => s.type === 'trigger');

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <Input
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="text-lg font-semibold"
                    placeholder="Workflow Name"
                  />
                  <Textarea
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    className="resize-none"
                    placeholder="Workflow Description (optional)"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="flex items-center gap-2">
                    <Label>Active</Label>
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleTest}>
                      <TestTube className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 pb-8">
            {!hasTrigger ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start with a Trigger</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose when this workflow should run
                  </p>
                  <Button onClick={() => setShowTriggerMenu(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Trigger
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={steps}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence>
                    {steps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <DraggableStep
                          step={step}
                          index={index}
                          onEdit={() => {
                            setSelectedStep(step);
                            setShowConfigPanel(true);
                          }}
                          onDelete={() => deleteStep(step.id)}
                          onDuplicate={() => duplicateStep(step)}
                        />
                        
                        {index < steps.length - 1 && (
                          <AddStepMenu
                            onAddStep={addStep}
                            position={index + 1}
                          />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SortableContext>
                
                <DragOverlay>
                  {activeId ? (
                    <DraggableStep
                      step={steps.find(s => s.id === activeId)!}
                      index={0}
                      isOverlay
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
            
            {hasTrigger && steps.length > 0 && (
              <AddStepMenu onAddStep={addStep} />
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Trigger Selection Menu */}
      <AnimatePresence>
        {showTriggerMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTriggerMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Choose a Trigger</CardTitle>
                      <CardDescription>
                        Select when this workflow should start
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowTriggerMenu(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {TRIGGER_TEMPLATES.map((trigger) => (
                      <Button
                        key={trigger.id}
                        variant="outline"
                        className="h-auto p-4 justify-start"
                        onClick={() => addTrigger(trigger)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg text-white", trigger.color)}>
                            <trigger.icon className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{trigger.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {trigger.description}
                            </div>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {trigger.category}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration Panel */}
      <AnimatePresence>
        {showConfigPanel && selectedStep && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-96"
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg text-white", selectedStep.color)}>
                      {selectedStep.icon && <selectedStep.icon className="w-4 h-4" />}
                    </div>
                    <CardTitle className="text-base">{selectedStep.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfigPanel(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <StepConfigPanel
                  step={selectedStep}
                  onUpdate={(config) => updateStepConfig(selectedStep.id, config)}
                  onClose={() => setShowConfigPanel(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Message Template</DialogTitle>
            <DialogDescription>
              Select from pre-written templates optimized with marketing formulas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {templatesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading templates...</p>
              </div>
            ) : (
              <Tabs defaultValue="job_reminders" className="w-full">
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
                  <TabsTrigger value="job_reminders">Reminders</TabsTrigger>
                  <TabsTrigger value="follow_ups">Follow-ups</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="promotions">Promotions</TabsTrigger>
                  <TabsTrigger value="retention">Win-back</TabsTrigger>
                  <TabsTrigger value="job_notifications">Updates</TabsTrigger>
                </TabsList>
                
                {['job_reminders', 'follow_ups', 'financial', 'promotions', 'retention', 'job_notifications'].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-3 mt-4">
                    {messageTemplates
                      .filter(template => template.category === category)
                      .map((template) => (
                        <Card
                          key={template.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-lg",
                            selectedTemplate?.id === template.id && "ring-2 ring-primary"
                          )}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              {selectedTemplate?.id === template.id && (
                                <CheckCircle className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            {template.marketing_formula && (
                              <Badge variant="secondary" className="text-xs mt-2">
                                {template.marketing_formula}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent>
                            {template.subject && (
                              <p className="text-sm font-medium mb-2">Subject: {template.subject}</p>
                            )}
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {template.content}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {template.variables.map((variable) => (
                                <Badge key={variable} variant="outline" className="text-xs">
                                  {`{{${variable}}}`}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplates(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedTemplate && currentEditingStep) {
                  applyMessageTemplate(selectedTemplate, currentEditingStep);
                }
              }}
              disabled={!selectedTemplate}
            >
              Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Writing Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write with AI</DialogTitle>
            <DialogDescription>
              Describe what you want to communicate and AI will generate the content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>What would you like to say?</Label>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., Friendly reminder about tomorrow's appointment with a call to action to confirm"
                className="mt-2 min-h-[100px]"
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>AI will include appropriate variables like client name and company info</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAIDialog(false);
              setAiPrompt('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={generateAIContent}
              disabled={!aiPrompt.trim() || generatingAI}
            >
              {generatingAI ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerticalWorkflowBuilder;
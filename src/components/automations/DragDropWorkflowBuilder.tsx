import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
import { 
  Plus, Save, Play, Clock, Mail, MessageSquare, Phone, Bell,
  ChevronRight, DollarSign, User, Calendar, Wrench, MapPin,
  Hash, Shield, CheckCircle, FileText, BarChart3, AlertCircle,
  Sparkles, Variable, Copy, Star, Settings2, GripVertical,
  GitBranch, Timer, Sun, Moon, Globe, Trash2, Edit3, X,
  Activity, Zap, UserPlus, Receipt, Tag, Target, MessageCircle,
  ChevronDown, ChevronUp, Layers, Eye, EyeOff, CheckSquare,
  CircleCheck, CircleX, Info, Filter, Calculator, Database,
  Send, Bot, Code, Webhook, ArrowRight, ArrowDown, MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  Node,
  Edge,
  NodeProps,
  EdgeProps,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';

// Drag and Drop Types
const ItemTypes = {
  TRIGGER: 'trigger',
  ACTION: 'action',
  CONDITION: 'condition',
  WORKFLOW_NODE: 'workflow_node'
};

// Trigger types with enhanced metadata
const TRIGGER_TYPES = [
  { 
    id: 'job_created',
    name: 'Job Created',
    icon: Plus,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 border-blue-200',
    description: 'When a new job is created',
    category: 'jobs',
    fields: ['job_type', 'priority', 'assigned_to']
  },
  { 
    id: 'job_scheduled',
    name: 'Job Scheduled',
    icon: Calendar,
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 border-indigo-200',
    description: 'When a job is scheduled',
    category: 'jobs',
    fields: ['date_range', 'time_window', 'technician']
  },
  { 
    id: 'job_started',
    name: 'Job Started',
    icon: Play,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 border-green-200',
    description: 'When technician starts a job',
    category: 'jobs',
    fields: []
  },
  { 
    id: 'job_completed',
    name: 'Job Completed',
    icon: CheckCircle,
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border-emerald-200',
    description: 'When a job is marked complete',
    category: 'jobs',
    fields: ['completion_status', 'rating']
  },
  { 
    id: 'job_cancelled',
    name: 'Job Cancelled',
    icon: CircleX,
    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 border-red-200',
    description: 'When a job is cancelled',
    category: 'jobs',
    fields: ['cancellation_reason']
  },
  { 
    id: 'invoice_created',
    name: 'Invoice Created',
    icon: FileText,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 border-purple-200',
    description: 'When an invoice is generated',
    category: 'financial',
    fields: ['amount_range', 'payment_terms']
  },
  { 
    id: 'invoice_sent',
    name: 'Invoice Sent',
    icon: Send,
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 border-cyan-200',
    description: 'When an invoice is sent',
    category: 'financial',
    fields: []
  },
  { 
    id: 'payment_received',
    name: 'Payment Received',
    icon: DollarSign,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 border-green-200',
    description: 'When a payment is received',
    category: 'financial',
    fields: ['payment_method', 'amount_range']
  },
  { 
    id: 'payment_overdue',
    name: 'Payment Overdue',
    icon: AlertCircle,
    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 border-red-200',
    description: 'When payment becomes overdue',
    category: 'financial',
    fields: ['days_overdue', 'amount_threshold']
  },
  { 
    id: 'client_created',
    name: 'New Client',
    icon: UserPlus,
    color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 border-teal-200',
    description: 'When a new client is added',
    category: 'clients',
    fields: ['client_type', 'source']
  },
  { 
    id: 'client_updated',
    name: 'Client Updated',
    icon: User,
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 border-orange-200',
    description: 'When client info is updated',
    category: 'clients',
    fields: ['updated_fields']
  },
  { 
    id: 'estimate_created',
    name: 'Estimate Created',
    icon: Receipt,
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 border-pink-200',
    description: 'When an estimate is created',
    category: 'sales',
    fields: ['amount_range', 'service_type']
  },
  { 
    id: 'estimate_approved',
    name: 'Estimate Approved',
    icon: CircleCheck,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 border-green-200',
    description: 'When client approves estimate',
    category: 'sales',
    fields: []
  },
  { 
    id: 'form_submitted',
    name: 'Form Submitted',
    icon: CheckSquare,
    color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 border-violet-200',
    description: 'When a form is submitted',
    category: 'engagement',
    fields: ['form_type', 'form_name']
  },
  { 
    id: 'review_received',
    name: 'Review Received',
    icon: Star,
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 border-yellow-200',
    description: 'When a review is submitted',
    category: 'engagement',
    fields: ['rating_threshold', 'platform']
  },
  { 
    id: 'schedule_time',
    name: 'Scheduled Time',
    icon: Clock,
    color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 border-gray-200',
    description: 'At a specific time/date',
    category: 'time',
    fields: ['schedule_type', 'time', 'days', 'timezone']
  },
  { 
    id: 'webhook',
    name: 'Webhook',
    icon: Webhook,
    color: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 border-slate-200',
    description: 'When webhook is received',
    category: 'integration',
    fields: ['webhook_url', 'authentication']
  },
  { 
    id: 'manual',
    name: 'Manual Trigger',
    icon: Play,
    color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 border-gray-200',
    description: 'Triggered manually',
    category: 'system',
    fields: []
  }
];

// Action types with enhanced metadata
const ACTION_TYPES = [
  { 
    id: 'send_email',
    name: 'Send Email',
    icon: Mail,
    color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',
    category: 'communication',
    fields: ['to', 'subject', 'template', 'attachments']
  },
  { 
    id: 'send_sms',
    name: 'Send SMS',
    icon: MessageSquare,
    color: 'bg-green-50 dark:bg-green-950/30 text-green-600',
    category: 'communication',
    fields: ['to', 'message', 'media_url']
  },
  { 
    id: 'send_push',
    name: 'Push Notification',
    icon: Bell,
    color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
    category: 'communication',
    fields: ['title', 'message', 'action_url']
  },
  { 
    id: 'create_task',
    name: 'Create Task',
    icon: CheckSquare,
    color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600',
    category: 'tasks',
    fields: ['description', 'assignee', 'due_date', 'priority']
  },
  { 
    id: 'update_job',
    name: 'Update Job',
    icon: Edit3,
    color: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600',
    category: 'data',
    fields: ['status', 'fields', 'notes']
  },
  { 
    id: 'update_client',
    name: 'Update Client',
    icon: User,
    color: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600',
    category: 'data',
    fields: ['fields', 'tags', 'notes']
  },
  { 
    id: 'add_tag',
    name: 'Add Tag',
    icon: Tag,
    color: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600',
    category: 'data',
    fields: ['tag_name', 'tag_color']
  },
  { 
    id: 'create_invoice',
    name: 'Create Invoice',
    icon: FileText,
    color: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600',
    category: 'financial',
    fields: ['items', 'due_date', 'payment_terms']
  },
  { 
    id: 'send_invoice',
    name: 'Send Invoice',
    icon: Send,
    color: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600',
    category: 'financial',
    fields: ['delivery_method', 'message']
  },
  { 
    id: 'webhook_call',
    name: 'Call Webhook',
    icon: Webhook,
    color: 'bg-gray-50 dark:bg-gray-950/30 text-gray-600',
    category: 'integration',
    fields: ['url', 'method', 'headers', 'body']
  },
  { 
    id: 'ai_action',
    name: 'AI Action',
    icon: Bot,
    color: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 text-purple-600',
    category: 'ai',
    fields: ['prompt', 'model', 'temperature']
  },
  { 
    id: 'calculate',
    name: 'Calculate',
    icon: Calculator,
    color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600',
    category: 'data',
    fields: ['formula', 'variables', 'output_field']
  }
];

// Condition types
const CONDITION_TYPES = [
  { 
    id: 'if_else',
    name: 'If/Else',
    icon: GitBranch,
    color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
    description: 'Branch based on conditions'
  },
  { 
    id: 'switch',
    name: 'Switch',
    icon: Layers,
    color: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600',
    description: 'Multiple branches'
  },
  { 
    id: 'filter',
    name: 'Filter',
    icon: Filter,
    color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600',
    description: 'Continue only if conditions met'
  }
];

// Workflow Node Component
const WorkflowNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const getNodeStyle = () => {
    switch (data.nodeType) {
      case 'trigger':
        return 'border-2 border-primary/50 bg-primary/5';
      case 'action':
        return 'border-2 border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/30';
      case 'condition':
        return 'border-2 border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/30';
      case 'delay':
        return 'border-2 border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/30';
      default:
        return 'border-2 border-gray-300 bg-white dark:bg-gray-900';
    }
  };

  const Icon = data.icon || Zap;

  return (
    <div
      className={cn(
        "rounded-lg shadow-lg transition-all duration-200 min-w-[250px]",
        getNodeStyle(),
        selected && "ring-2 ring-primary ring-offset-2",
        isHovered && "shadow-xl transform scale-105"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-primary border-2 border-white"
      />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              data.color || "bg-gray-100 dark:bg-gray-800"
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{data.label}</h3>
              {data.description && (
                <p className="text-xs text-muted-foreground">{data.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && data.config && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 overflow-hidden"
            >
              {/* Node configuration preview */}
              {data.nodeType === 'delay' && (
                <div className="text-xs bg-background/50 rounded p-2">
                  Wait: {data.config.value} {data.config.unit}
                </div>
              )}
              {data.nodeType === 'action' && data.config.template && (
                <div className="text-xs bg-background/50 rounded p-2 line-clamp-2">
                  {data.config.template}
                </div>
              )}
              {data.nodeType === 'condition' && data.config.conditions && (
                <div className="text-xs bg-background/50 rounded p-2">
                  {data.config.conditions.length} condition(s)
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Edit3 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Copy className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-primary border-2 border-white"
      />
    </div>
  );
};

// Custom edge component
const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const edgePath = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path stroke-2 stroke-primary/50"
        d={edgePath}
        markerEnd={markerEnd}
      />
    </>
  );
};

// Node types for React Flow
const nodeTypes = {
  workflow: WorkflowNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Draggable component for the sidebar
const DraggableItem: React.FC<{
  type: string;
  data: any;
  children: React.ReactNode;
}> = ({ type, data, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WORKFLOW_NODE,
    item: { type, data },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={cn(
        "cursor-move transition-all",
        isDragging && "opacity-50"
      )}
    >
      {children}
    </div>
  );
};

// Main Workflow Builder Component
export const DragDropWorkflowBuilder: React.FC<{
  workflowId?: string;
  onSave?: (workflow: any) => void;
}> = ({ workflowId, onSave }) => {
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [activeTab, setActiveTab] = useState('triggers');
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Handle drop
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (!type || !reactFlowBounds) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const nodeData = JSON.parse(event.dataTransfer.getData('nodeData'));
      const newNode = {
        id: `${nodeData.nodeType}-${Date.now()}`,
        type: 'workflow',
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'custom',
            animated: true,
            style: { stroke: '#3b82f6' },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Save workflow
  const handleSave = () => {
    const workflow = {
      name: workflowName,
      description: workflowDescription,
      isActive,
      nodes,
      edges,
    };
    
    onSave?.(workflow);
    toast.success('Workflow saved successfully');
  };

  // Test workflow
  const handleTest = () => {
    setShowTestModal(true);
    // Implement test logic
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[calc(100vh-200px)] flex gap-4">
        {/* Sidebar */}
        <div className="w-80 bg-background border rounded-lg overflow-hidden flex flex-col">
          {/* Workflow Info */}
          <div className="p-4 border-b">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="font-semibold text-lg mb-2"
              placeholder="Workflow Name"
            />
            <Textarea
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="text-sm resize-none"
              placeholder="Workflow Description"
              rows={2}
            />
            <div className="flex items-center justify-between mt-3">
              <Label className="text-sm">Active</Label>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
            <TabsList className="w-full rounded-none">
              <TabsTrigger value="triggers" className="flex-1">Triggers</TabsTrigger>
              <TabsTrigger value="actions" className="flex-1">Actions</TabsTrigger>
              <TabsTrigger value="logic" className="flex-1">Logic</TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto h-full">
              {/* Triggers Tab */}
              <TabsContent value="triggers" className="p-4 space-y-2">
                {Object.entries(
                  TRIGGER_TYPES.reduce((acc, trigger) => {
                    const category = trigger.category || 'other';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(trigger);
                    return acc;
                  }, {} as Record<string, typeof TRIGGER_TYPES>)
                ).map(([category, triggers]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      {category}
                    </h4>
                    <div className="space-y-2 mb-4">
                      {triggers.map((trigger) => {
                        const Icon = trigger.icon;
                        return (
                          <div
                            key={trigger.id}
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.setData('application/reactflow', 'trigger');
                              event.dataTransfer.setData(
                                'nodeData',
                                JSON.stringify({
                                  nodeType: 'trigger',
                                  label: trigger.name,
                                  description: trigger.description,
                                  icon: trigger.icon,
                                  color: trigger.color,
                                  triggerId: trigger.id,
                                  config: {},
                                })
                              );
                              event.dataTransfer.effectAllowed = 'move';
                            }}
                            className={cn(
                              "p-3 rounded-lg border cursor-move hover:shadow-md transition-all",
                              trigger.color
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{trigger.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {trigger.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions" className="p-4 space-y-2">
                {Object.entries(
                  ACTION_TYPES.reduce((acc, action) => {
                    const category = action.category || 'other';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(action);
                    return acc;
                  }, {} as Record<string, typeof ACTION_TYPES>)
                ).map(([category, actions]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      {category}
                    </h4>
                    <div className="space-y-2 mb-4">
                      {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <div
                            key={action.id}
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.setData('application/reactflow', 'action');
                              event.dataTransfer.setData(
                                'nodeData',
                                JSON.stringify({
                                  nodeType: 'action',
                                  label: action.name,
                                  icon: action.icon,
                                  color: action.color,
                                  actionId: action.id,
                                  config: {},
                                })
                              );
                              event.dataTransfer.effectAllowed = 'move';
                            }}
                            className={cn(
                              "p-3 rounded-lg border cursor-move hover:shadow-md transition-all",
                              action.color
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <p className="text-sm font-medium">{action.name}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Delay Action */}
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  timing
                </h4>
                <div
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', 'delay');
                    event.dataTransfer.setData(
                      'nodeData',
                      JSON.stringify({
                        nodeType: 'delay',
                        label: 'Delay',
                        icon: Clock,
                        color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600',
                        config: { value: 1, unit: 'hours' },
                      })
                    );
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  className="p-3 rounded-lg border cursor-move hover:shadow-md transition-all bg-orange-50 dark:bg-orange-950/30 text-orange-600"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <p className="text-sm font-medium">Delay</p>
                  </div>
                </div>
              </TabsContent>

              {/* Logic Tab */}
              <TabsContent value="logic" className="p-4 space-y-2">
                {CONDITION_TYPES.map((condition) => {
                  const Icon = condition.icon;
                  return (
                    <div
                      key={condition.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow', 'condition');
                        event.dataTransfer.setData(
                          'nodeData',
                          JSON.stringify({
                            nodeType: 'condition',
                            label: condition.name,
                            description: condition.description,
                            icon: condition.icon,
                            color: condition.color,
                            conditionId: condition.id,
                            config: { conditions: [] },
                          })
                        );
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      className={cn(
                        "p-3 rounded-lg border cursor-move hover:shadow-md transition-all",
                        condition.color
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">{condition.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {condition.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background variant="dot" gap={12} size={1} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.data.nodeType) {
                  case 'trigger': return '#3b82f6';
                  case 'action': return '#10b981';
                  case 'condition': return '#8b5cf6';
                  case 'delay': return '#f59e0b';
                  default: return '#6b7280';
                }
              }}
            />
          </ReactFlow>

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Layers className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Start Building Your Workflow
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Drag and drop triggers, actions, and conditions from the left panel
                </p>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleTest}>
              <Play className="w-4 h-4 mr-2" />
              Test
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Node Configuration Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-96 bg-background border rounded-lg overflow-hidden"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Configure {selectedNode.data.label}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedNode(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]">
                {/* Configuration fields based on node type */}
                {selectedNode.data.nodeType === 'trigger' && (
                  <TriggerConfiguration node={selectedNode} />
                )}
                {selectedNode.data.nodeType === 'action' && (
                  <ActionConfiguration node={selectedNode} />
                )}
                {selectedNode.data.nodeType === 'condition' && (
                  <ConditionConfiguration node={selectedNode} />
                )}
                {selectedNode.data.nodeType === 'delay' && (
                  <DelayConfiguration node={selectedNode} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
};

// Configuration Components
const TriggerConfiguration: React.FC<{ node: Node }> = ({ node }) => {
  const trigger = TRIGGER_TYPES.find(t => t.id === node.data.triggerId);
  
  return (
    <div className="space-y-4">
      <div>
        <Label>Trigger Type</Label>
        <p className="text-sm text-muted-foreground">{trigger?.description}</p>
      </div>
      
      {trigger?.fields.includes('job_type') && (
        <div>
          <Label>Job Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Any job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any job type</SelectItem>
              <SelectItem value="hvac">HVAC</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {trigger?.fields.includes('amount_range') && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Min Amount</Label>
            <Input type="number" placeholder="0" />
          </div>
          <div>
            <Label>Max Amount</Label>
            <Input type="number" placeholder="No limit" />
          </div>
        </div>
      )}
      
      {trigger?.fields.includes('schedule_type') && (
        <div>
          <Label>Schedule Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">Once</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

const ActionConfiguration: React.FC<{ node: Node }> = ({ node }) => {
  const action = ACTION_TYPES.find(a => a.id === node.data.actionId);
  
  return (
    <div className="space-y-4">
      {action?.fields.includes('to') && (
        <div>
          <Label>Recipient</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="technician">Assigned Technician</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="custom">Custom Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {action?.fields.includes('template') && (
        <div>
          <Label>Message Template</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
              <SelectItem value="job_complete">Job Complete</SelectItem>
              <SelectItem value="invoice_sent">Invoice Sent</SelectItem>
              <SelectItem value="custom">Custom Message</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {action?.fields.includes('message') && (
        <div>
          <Label>Message</Label>
          <Textarea 
            placeholder="Enter your message here..." 
            rows={4}
            className="resize-none"
          />
          <div className="flex flex-wrap gap-1 mt-2">
            {['{{client_name}}', '{{job_date}}', '{{amount}}'].map((variable) => (
              <Badge 
                key={variable} 
                variant="outline" 
                className="text-xs cursor-pointer hover:bg-secondary"
              >
                {variable}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ConditionConfiguration: React.FC<{ node: Node }> = ({ node }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Condition Type</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="field">Field Value</SelectItem>
            <SelectItem value="time">Time-based</SelectItem>
            <SelectItem value="count">Count-based</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Field</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="job_status">Job Status</SelectItem>
            <SelectItem value="client_type">Client Type</SelectItem>
            <SelectItem value="invoice_amount">Invoice Amount</SelectItem>
            <SelectItem value="payment_status">Payment Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Operator</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select operator" />
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
        <Input placeholder="Enter value" />
      </div>
    </div>
  );
};

const DelayConfiguration: React.FC<{ node: Node }> = ({ node }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Delay Duration</Label>
        <div className="flex gap-2">
          <Input type="number" defaultValue={1} className="flex-1" />
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
      </div>
      
      <div className="space-y-2">
        <Label>Delay Options</Label>
        <div className="flex items-center space-x-2">
          <Switch id="business-hours" />
          <Label htmlFor="business-hours" className="font-normal">
            Only during business hours
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="skip-weekends" />
          <Label htmlFor="skip-weekends" className="font-normal">
            Skip weekends
          </Label>
        </div>
      </div>
    </div>
  );
};

export default DragDropWorkflowBuilder;
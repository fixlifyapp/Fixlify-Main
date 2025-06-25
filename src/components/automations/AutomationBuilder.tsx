
import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  ReactFlowProvider,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAutomationBuilder } from '@/hooks/automations/useAutomationBuilder';
import { AutomationBuilderSidebar } from './builder/AutomationBuilderSidebar';
import { AutomationBuilderToolbar } from './builder/AutomationBuilderToolbar';
import { AutomationNodeEditor } from './builder/AutomationNodeEditor';
import { AIMessageComposer } from './builder/AIMessageComposer';
import { TriggerNode } from './builder/nodes/TriggerNode';
import { ActionNode } from './builder/nodes/ActionNode';
import { ConditionNode } from './builder/nodes/ConditionNode';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Badge } from '@/components/ui/badge';
import { Play, Save, TestTube, Zap, AlertCircle, CheckCircle2, Bot, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

interface AutomationBuilderProps {
  template?: any;
  onSave: (workflow: any) => void;
  onCancel: () => void;
}

const AutomationBuilderContent = ({ template, onSave, onCancel }: AutomationBuilderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState(template?.name || 'New Automation');
  const [workflowDescription, setWorkflowDescription] = useState(template?.description || '');
  const [isTestMode, setIsTestMode] = useState(false);
  const [showAIComposer, setShowAIComposer] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const {
    validateWorkflow,
    testWorkflow,
    convertToWorkflow,
    isValidating,
    validationErrors
  } = useAutomationBuilder();

  // Load template data if provided
  React.useEffect(() => {
    if (template?.visual_config?.nodes && template?.visual_config?.edges) {
      setNodes(template.visual_config.nodes);
      setEdges(template.visual_config.edges);
    }
  }, [template, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: `New ${type}`,
          type: type,
          config: getDefaultConfig(type)
        },
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success(`${type} node added to workflow`);
    },
    [reactFlowInstance, setNodes]
  );

  const getDefaultConfig = (nodeType: string) => {
    switch (nodeType) {
      case 'trigger':
        return {
          trigger_type: 'event',
          event_type: 'job_created',
          conditions: {}
        };
      case 'action':
        return {
          action_type: 'send_sms',
          message: 'Hello {{client_name}}, your job {{job_title}} has been scheduled for {{scheduled_date}}.',
          delay: 0
        };
      case 'condition':
        return {
          field: 'job_status',
          operator: 'equals',
          value: 'completed'
        };
      default:
        return {};
    }
  };

  const handleNodeUpdate = (nodeId: string, updates: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  };

  const handleNodeDelete = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    toast.success('Node removed from workflow');
  };

  const handleTestWorkflow = async () => {
    try {
      setIsTestMode(true);
      const testData = {
        client_name: 'John Smith',
        client_phone: '(555) 123-4567',
        client_email: 'john@example.com',
        job_title: 'HVAC Repair',
        job_id: 'JOB-001',
        job_status: 'scheduled',
        scheduled_date: new Date().toLocaleDateString(),
        total_amount: '$450.00'
      };

      const success = await testWorkflow(testData);
      if (success) {
        toast.success('Workflow test completed successfully');
      }
    } catch (error) {
      toast.error('Workflow test failed');
    } finally {
      setIsTestMode(false);
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      const isValid = await validateWorkflow();
      if (!isValid) {
        toast.error('Please fix validation errors before saving');
        return;
      }

      const workflowData = convertToWorkflow();
      await onSave({
        ...workflowData,
        name: workflowName,
        description: workflowDescription,
        visual_config: { nodes, edges }
      });
      toast.success('Automation saved successfully');
    } catch (error) {
      toast.error('Failed to save automation');
    }
  };

  const triggerCount = nodes.filter(n => n.type === 'trigger').length;
  const actionCount = nodes.filter(n => n.type === 'action').length;
  const conditionCount = nodes.filter(n => n.type === 'condition').length;

  const isWorkflowValid = triggerCount > 0 && actionCount > 0 && validationErrors.length === 0;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-purple-500/20 rounded px-2 py-1 flex-1"
                placeholder="Automation Name"
              />
            </div>
            <input
              type="text"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="text-gray-600 bg-transparent border-none outline-none focus:ring-2 focus:ring-purple-500/20 rounded px-2 py-1 w-full"
              placeholder="Add description..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={isWorkflowValid ? "default" : "destructive"} className={cn(
              "flex items-center gap-1",
              isWorkflowValid && "bg-gradient-to-r from-green-500 to-green-600"
            )}>
              {isWorkflowValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {isWorkflowValid ? 'Valid' : 'Invalid'}
            </Badge>
            
            <Button 
              variant="outline" 
              onClick={() => setShowAIComposer(!showAIComposer)}
              className={cn(
                "border-purple-200 hover:border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50",
                showAIComposer && "bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-300"
              )}
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            
            <Button variant="outline" onClick={handleTestWorkflow} disabled={isTestMode} className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300">
              <TestTube className="w-4 h-4 mr-2" />
              {isTestMode ? 'Testing...' : 'Test'}
            </Button>
            
            <Button variant="outline" onClick={onCancel} className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <GradientButton onClick={handleSaveWorkflow} disabled={!isWorkflowValid} className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Save Automation
            </GradientButton>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"></div>
            {triggerCount} Triggers
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-sm"></div>
            {actionCount} Actions
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-sm"></div>
            {conditionCount} Conditions
          </span>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-xl p-3 backdrop-blur-sm shadow-sm">
            <h4 className="text-red-800 font-medium mb-2">Validation Errors:</h4>
            <ul className="text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Composer */}
        {showAIComposer && (
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-xl p-4 backdrop-blur-sm shadow-lg">
            <AIMessageComposer 
              onMessageGenerated={(message) => {
                // Apply the generated message to selected node if it's an action
                if (selectedNode && selectedNode.type === 'action') {
                  handleNodeUpdate(selectedNode.id, { 
                    ...selectedNode.data,
                    config: { 
                      ...selectedNode.data.config, 
                      message: message 
                    }
                  });
                  toast.success('AI message applied to selected action');
                } else {
                  toast.info('Select an action node first to apply the AI message');
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AutomationBuilderSidebar onNodeDrag={() => {}} />

        {/* Flow Canvas */}
        <div className="flex-1 relative">
          <div className="h-full react-flow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gradient-to-br from-gray-50/50 via-purple-50/20 to-blue-50/10"
            >
              <Background gap={20} size={1} color="#e5e7eb" className="opacity-50" />
              <Controls className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg" />
              <MiniMap 
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg"
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'trigger': return '#3b82f6';
                    case 'action': return '#10b981';
                    case 'condition': return '#f59e0b';
                    default: return '#8b5cf6';
                  }
                }}
              />
              
              <Panel position="top-right">
                <AutomationBuilderToolbar
                  nodes={nodes}
                  edges={edges}
                  onClear={() => {
                    setNodes([]);
                    setEdges([]);
                    setSelectedNode(null);
                    toast.success('Workflow cleared');
                  }}
                />
              </Panel>
            </ReactFlow>
          </div>
        </div>

        {/* Node Editor Panel */}
        {selectedNode && (
          <div className="w-80 bg-white/90 backdrop-blur-sm border-l border-gray-200/50 overflow-y-auto shadow-xl">
            <AutomationNodeEditor
              node={selectedNode}
              onUpdate={(updates) => handleNodeUpdate(selectedNode.id, updates)}
              onDelete={() => handleNodeDelete(selectedNode.id)}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const AutomationBuilder = (props: AutomationBuilderProps) => {
  return (
    <ReactFlowProvider>
      <AutomationBuilderContent {...props} />
    </ReactFlowProvider>
  );
};

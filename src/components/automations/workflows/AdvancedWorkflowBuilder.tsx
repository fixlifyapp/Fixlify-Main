import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Controls, 
  Background,
  Connection,
  Edge,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Zap, 
  Plus, 
  Save, 
  Play, 
  Settings, 
  Mail, 
  MessageSquare, 
  Bell,
  Clock,
  Filter,
  GitBranch
} from 'lucide-react';

// Custom node types for different automation steps
const TriggerNode = ({ data }: { data: any }) => (
  <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 min-w-[150px]">
    <div className="flex items-center gap-2 mb-2">
      <Zap className="h-4 w-4 text-blue-600" />
      <span className="font-semibold text-blue-800">Trigger</span>
    </div>
    <div className="text-sm text-blue-700">{data.label}</div>
    <Badge variant="outline" className="mt-1 text-xs">{data.triggerType}</Badge>
  </div>
);

const ActionNode = ({ data }: { data: any }) => {
  const getIcon = () => {
    switch (data.actionType) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'notification': return <Bell className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 min-w-[150px]">
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="font-semibold text-green-800">Action</span>
      </div>
      <div className="text-sm text-green-700">{data.label}</div>
      <Badge variant="outline" className="mt-1 text-xs">{data.actionType}</Badge>
    </div>
  );
};

const ConditionNode = ({ data }: { data: any }) => (
  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 min-w-[150px]">
    <div className="flex items-center gap-2 mb-2">
      <Filter className="h-4 w-4 text-yellow-600" />
      <span className="font-semibold text-yellow-800">Condition</span>
    </div>
    <div className="text-sm text-yellow-700">{data.label}</div>
    <Badge variant="outline" className="mt-1 text-xs">if/then</Badge>
  </div>
);

const DelayNode = ({ data }: { data: any }) => (
  <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-3 min-w-[150px]">
    <div className="flex items-center gap-2 mb-2">
      <Clock className="h-4 w-4 text-purple-600" />
      <span className="font-semibold text-purple-800">Delay</span>
    </div>
    <div className="text-sm text-purple-700">{data.label}</div>
    <Badge variant="outline" className="mt-1 text-xs">{data.duration}</Badge>
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

interface AdvancedWorkflowBuilderProps {
  onSave?: (workflow: any) => void;
  initialWorkflow?: any;
}

export const AdvancedWorkflowBuilder: React.FC<AdvancedWorkflowBuilderProps> = ({
  onSave,
  initialWorkflow
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflow?.edges || []);
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || '');
  const [workflowDescription, setWorkflowDescription] = useState(initialWorkflow?.description || '');
  const [selectedNodeType, setSelectedNodeType] = useState<string>('trigger');
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `New ${type}`,
        ...(type === 'trigger' && { triggerType: 'job_status_changed' }),
        ...(type === 'action' && { actionType: 'email' }),
        ...(type === 'delay' && { duration: '5 minutes' }),
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const handleSave = async () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    if (nodes.length === 0) {
      toast.error('Please add at least one node to the workflow');
      return;
    }

    setIsSaving(true);
    try {
      const workflow = {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
        workflow_type: 'advanced',
        status: 'active',
        created_at: new Date().toISOString(),
      };

      await onSave?.(workflow);
      toast.success('Advanced workflow saved successfully!');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = () => {
    if (nodes.length === 0) {
      toast.error('Please add nodes to test the workflow');
      return;
    }
    toast.info('Testing workflow... (This would trigger a test execution)');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              placeholder="Workflow Name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg font-semibold border-none shadow-none p-0 mb-2"
            />
            <Textarea
              placeholder="Describe what this workflow does..."
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="border-none shadow-none p-0 resize-none"
              rows={1}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTest}>
              <Play className="h-4 w-4 mr-2" />
              Test
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 border-r bg-gray-50 p-4">
          <h3 className="font-semibold mb-4">Add Components</h3>
          
          <div className="space-y-2">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => addNode('trigger')}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Trigger</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Start the workflow</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => addNode('condition')}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Condition</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Branch logic</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => addNode('delay')}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Delay</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Wait period</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => addNode('action')}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Action</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Execute action</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Quick Actions</h4>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start" 
                      onClick={() => addNode('action')}>
                <Mail className="h-3 w-3 mr-2" />
                Send Email
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" 
                      onClick={() => addNode('action')}>
                <MessageSquare className="h-3 w-3 mr-2" />
                Send SMS
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" 
                      onClick={() => addNode('action')}>
                <Bell className="h-3 w-3 mr-2" />
                Notification
              </Button>
            </div>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <Background />
          </ReactFlow>

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-500">
                <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">Start Building Your Workflow</h3>
                <p className="text-sm">Add components from the sidebar to create your automation flow</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
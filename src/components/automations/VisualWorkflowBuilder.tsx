import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { DelayNode } from './nodes/DelayNode';
import { WorkflowToolbar } from './WorkflowToolbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: {
      label: 'Job Created',
      triggerType: 'When a new job is created',
    },
  },
];

const initialEdges: Edge[] = [];

interface VisualWorkflowBuilderProps {
  onSave?: (workflow: any) => void;
  onBack?: () => void;
  initialWorkflow?: any[];
}

export const VisualWorkflowBuilder: React.FC<VisualWorkflowBuilderProps> = ({
  onSave,
  onBack,
  initialWorkflow = []
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeAdd = useCallback((type: string, position: { x: number; y: number }) => {
    const id = `${Date.now()}`;
    let newNode: Node;

    switch (type) {
      case 'trigger':
        newNode = {
          id,
          type: 'trigger',
          position,
          data: {
            label: 'New Trigger',
            triggerType: 'Select trigger type',
          },
        };
        break;
      case 'action':
        newNode = {
          id,
          type: 'action',
          position,
          data: {
            label: 'New Action',
            actionType: 'Select action type',
          },
        };
        break;
      case 'condition':
        newNode = {
          id,
          type: 'condition',
          position,
          data: {
            label: 'New Condition',
            condition: 'Select condition',
          },
        };
        break;
      case 'delay':
        newNode = {
          id,
          type: 'delay',
          position,
          data: {
            label: 'Wait',
            duration: 'Select duration',
          },
        };
        break;
      default:
        return;
    }

    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeType(null);
  }, [setNodes]);

  const onCanvasClick = useCallback((event: React.MouseEvent) => {
    if (selectedNodeType) {
      const bounds = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 50,
      };
      onNodeAdd(selectedNodeType, position);
    }
  }, [selectedNodeType, onNodeAdd]);

  const handleSave = () => {
    const workflowData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
    };
    
    if (onSave) {
      onSave(workflowData);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold">Visual Workflow Builder</h1>
              <p className="text-sm text-gray-600">
                {selectedNodeType ? `Click anywhere to add a ${selectedNodeType}` : 'Drag and drop to create your workflow'}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Workflow
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-64 bg-white border-r p-4">
          <WorkflowToolbar 
            selectedNodeType={selectedNodeType}
            onNodeTypeSelect={setSelectedNodeType}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            onClick={onCanvasClick}
            className="bg-gray-50"
          >
            <Controls />
            <MiniMap 
              nodeStrokeColor="#374151"
              nodeColor="#fff"
              nodeBorderRadius={8}
              className="bg-white"
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="#e5e7eb"
            />
          </ReactFlow>

          {/* Instructions overlay */}
          {nodes.length === 1 && (
            <div className="absolute top-4 left-4 z-10">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Get Started:</p>
                  <p className="text-blue-700">
                    1. Select a node type from the left panel<br/>
                    2. Click on the canvas to add it<br/>
                    3. Connect nodes by dragging from handles
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
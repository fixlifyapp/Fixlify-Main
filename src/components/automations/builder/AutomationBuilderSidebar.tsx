
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, MessageSquare, GitBranch, Clock, Mail, Phone } from 'lucide-react';

interface AutomationBuilderSidebarProps {
  onNodeDrag: () => void;
}

const nodeCategories = [
  {
    title: 'Triggers',
    icon: Zap,
    nodes: [
      { type: 'trigger', label: 'Event Trigger', icon: Zap, description: 'Start automation when event occurs' },
    ]
  },
  {
    title: 'Actions',
    icon: MessageSquare,
    nodes: [
      { type: 'action', label: 'Send SMS', icon: MessageSquare, description: 'Send text message' },
      { type: 'action', label: 'Send Email', icon: Mail, description: 'Send email message' },
      { type: 'action', label: 'Make Call', icon: Phone, description: 'Make phone call' },
      { type: 'action', label: 'Wait', icon: Clock, description: 'Add delay' },
    ]
  },
  {
    title: 'Logic',
    icon: GitBranch,
    nodes: [
      { type: 'condition', label: 'Condition', icon: GitBranch, description: 'Branch based on condition' },
    ]
  }
];

export const AutomationBuilderSidebar = ({ onNodeDrag }: AutomationBuilderSidebarProps) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    onNodeDrag();
  };

  return (
    <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 overflow-y-auto shadow-lg">
      <div className="p-4 space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Automation Builder
          </h2>
          <p className="text-sm text-gray-600 mt-1">Drag nodes to create your workflow</p>
        </div>

        {nodeCategories.map((category) => (
          <Card key={category.title} className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <category.icon className="w-4 h-4" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.nodes.map((node) => (
                <Button
                  key={node.label}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto cursor-grab active:cursor-grabbing hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 border border-transparent hover:border-purple-200"
                  draggable
                  onDragStart={(event) => onDragStart(event, node.type)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                      <node.icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{node.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{node.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-blue-800">Quick Tips</div>
              <div className="text-xs text-blue-600 space-y-1">
                <p>• Drag nodes onto the canvas</p>
                <p>• Connect nodes by dragging from handles</p>
                <p>• Click nodes to edit properties</p>
                <p>• Use variables like {{client_name}}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

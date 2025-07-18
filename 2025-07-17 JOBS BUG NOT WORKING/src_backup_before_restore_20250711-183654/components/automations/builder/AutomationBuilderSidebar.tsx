
import React from 'react';
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from '@/components/ui/modern-card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Play, 
  GitBranch, 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock, 
  Calculator,
  Webhook,
  Plus
} from 'lucide-react';

interface AutomationBuilderSidebarProps {
  onNodeDrag: (nodeType: string) => void;
}

export const AutomationBuilderSidebar = ({ onNodeDrag }: AutomationBuilderSidebarProps) => {
  const triggerTypes = [
    {
      type: 'trigger',
      subType: 'job_created',
      icon: Plus,
      label: 'New Job Created',
      description: 'Triggers when a new job is created',
      color: 'from-blue-500 to-blue-600'
    },
    {
      type: 'trigger',
      subType: 'missed_call',
      icon: Phone,
      label: 'Missed Call',
      description: 'Triggers when a call is missed',
      color: 'from-red-500 to-red-600'
    },
    {
      type: 'trigger',
      subType: 'job_completed',
      icon: Zap,
      label: 'Job Completed',
      description: 'Triggers when a job is marked complete',
      color: 'from-green-500 to-green-600'
    },
    {
      type: 'trigger',
      subType: 'schedule_reminder',
      icon: Clock,
      label: 'Schedule Reminder',
      description: 'Triggers at specific times',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const actionTypes = [
    {
      type: 'action',
      subType: 'send_sms',
      icon: MessageSquare,
      label: 'Send SMS',
      description: 'Send text message to client',
      color: 'from-green-500 to-green-600'
    },
    {
      type: 'action',
      subType: 'send_email',
      icon: Mail,
      label: 'Send Email',
      description: 'Send email to client',
      color: 'from-blue-500 to-blue-600'
    },
    {
      type: 'action',
      subType: 'make_call',
      icon: Phone,
      label: 'Make Call',
      description: 'Place automated call',
      color: 'from-purple-500 to-purple-600'
    },
    {
      type: 'action',
      subType: 'create_task',
      icon: Plus,
      label: 'Create Task',
      description: 'Create internal task',
      color: 'from-orange-500 to-orange-600'
    },
    {
      type: 'action',
      subType: 'webhook',
      icon: Webhook,
      label: 'Send Webhook',
      description: 'Send data to external system',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const conditionTypes = [
    {
      type: 'condition',
      subType: 'job_status',
      icon: GitBranch,
      label: 'Job Status',
      description: 'Check job status condition',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      type: 'condition',
      subType: 'client_type',
      icon: GitBranch,
      label: 'Client Type',
      description: 'Check client type condition',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      type: 'condition',
      subType: 'time_based',
      icon: Clock,
      label: 'Time Condition',
      description: 'Check time-based condition',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const onDragStart = (event: React.DragEvent, nodeType: string, subType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-subtype', subType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const NodeItem = ({ item, dragType }) => {
    const IconComponent = item.icon;
    
    return (
      <div
        className="p-3 border border-gray-200 rounded-lg cursor-move hover:border-fixlyfy hover:shadow-md transition-all duration-200 bg-white group"
        draggable
        onDragStart={(event) => onDragStart(event, item.type, item.subType)}
      >
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm group-hover:text-fixlyfy transition-colors">
              {item.label}
            </h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="workflow-sidebar bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-fixlyfy to-fixlyfy-light bg-clip-text text-transparent">
            Workflow Builder
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Drag components to canvas
          </p>
        </div>

        <Separator />

        {/* Triggers */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Triggers</h4>
            <Badge variant="secondary" className="text-xs">
              {triggerTypes.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {triggerTypes.map((trigger, index) => (
              <NodeItem key={index} item={trigger} dragType="trigger" />
            ))}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
              <Play className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Actions</h4>
            <Badge variant="secondary" className="text-xs">
              {actionTypes.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {actionTypes.map((action, index) => (
              <NodeItem key={index} item={action} dragType="action" />
            ))}
          </div>
        </div>

        <Separator />

        {/* Conditions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-yellow-600" />
            </div>
            <h4 className="font-medium text-gray-900">Conditions</h4>
            <Badge variant="secondary" className="text-xs">
              {conditionTypes.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {conditionTypes.map((condition, index) => (
              <NodeItem key={index} item={condition} dragType="condition" />
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-fixlyfy/5 border border-fixlyfy/20 rounded-lg p-3 text-xs text-gray-600">
          <p className="font-medium text-fixlyfy mb-1">💡 Tips:</p>
          <ul className="space-y-1">
            <li>• Drag components to the canvas</li>
            <li>• Connect nodes with arrows</li>
            <li>• Click nodes to configure them</li>
            <li>• Test your workflow before saving</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

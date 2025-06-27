import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  Webhook,
  Clock
} from 'lucide-react';

interface ActionNodeProps {
  data: {
    label: string;
    config?: {
      action_type?: string;
      delay?: number;
    };
  };
  selected: boolean;
}

export const ActionNode = ({ data, selected }: ActionNodeProps) => {
  const getActionIcon = () => {
    switch (data.config?.action_type) {
      case 'send_sms':
        return MessageSquare;
      case 'send_email':
        return Mail;
      case 'create_task':
        return CheckSquare;
      case 'notify_team':
        return Users;
      case 'webhook':
        return Webhook;
      case 'wait':
        return Clock;
      default:
        return Send;
    }
  };

  const Icon = getActionIcon();

  return (
    <div
      className={`
        workflow-node action
        px-4 py-3 rounded-lg border-2 bg-white shadow-sm
        min-w-[180px] transition-all duration-200
        ${selected ? 'border-green-500 shadow-lg' : 'border-gray-300 hover:border-green-400'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white"
      />
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">{data.label}</h3>
          {data.config?.action_type && (
            <p className="text-xs text-gray-500 mt-0.5">
              {data.config.action_type.replace(/_/g, ' ')}
            </p>
          )}
          {data.config?.delay && data.config.delay > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              Delay: {data.config.delay} min
            </p>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white"
      />
    </div>
  );
}; 
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Clock, Webhook } from 'lucide-react';

interface TriggerNodeProps {
  data: {
    label: string;
    config?: {
      trigger_type?: string;
      event_type?: string;
    };
  };
  selected: boolean;
}

export const TriggerNode = ({ data, selected }: TriggerNodeProps) => {
  const getTriggerIcon = () => {
    switch (data.config?.trigger_type) {
      case 'schedule':
        return Clock;
      case 'webhook':
        return Webhook;
      default:
        return Zap;
    }
  };

  const Icon = getTriggerIcon();

  return (
    <div
      className={`
        workflow-node trigger
        px-4 py-3 rounded-lg border-2 bg-white shadow-sm
        min-w-[180px] transition-all duration-200
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-300 hover:border-blue-400'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">{data.label}</h3>
          {data.config?.event_type && (
            <p className="text-xs text-gray-500 mt-0.5">
              {data.config.event_type.replace(/_/g, ' ')}
            </p>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
    </div>
  );
}; 
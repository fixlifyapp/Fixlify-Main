import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

interface ConditionNodeProps {
  data: {
    label: string;
    config?: {
      field?: string;
      operator?: string;
      value?: string;
    };
  };
  selected: boolean;
}

export const ConditionNode = ({ data, selected }: ConditionNodeProps) => {
  const getConditionText = () => {
    if (!data.config?.field || !data.config?.operator) return 'Configure condition';
    
    const { field, operator, value } = data.config;
    const operatorText = operator.replace(/_/g, ' ');
    
    if (operator === 'is_empty' || operator === 'is_not_empty') {
      return `${field} ${operatorText}`;
    }
    
    return `${field} ${operatorText} ${value || '...'}`;
  };

  return (
    <div
      className={`
        workflow-node condition
        px-4 py-3 rounded-lg border-2 bg-white shadow-sm
        min-w-[180px] transition-all duration-200
        ${selected ? 'border-yellow-500 shadow-lg' : 'border-gray-300 hover:border-yellow-400'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-yellow-500 !border-2 !border-white"
      />
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm">{data.label}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {getConditionText()}
          </p>
        </div>
      </div>
      
      {/* True output */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '30%' }}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white"
      />
      
      {/* False output */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '70%' }}
        className="w-3 h-3 !bg-red-500 !border-2 !border-white"
      />
      
      {/* Labels for outputs */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-4 text-xs">
        <span className="text-green-600">Yes</span>
        <span className="text-red-600">No</span>
      </div>
    </div>
  );
}; 
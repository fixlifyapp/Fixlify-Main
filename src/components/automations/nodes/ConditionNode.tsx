import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Settings } from 'lucide-react';

interface ConditionNodeProps {
  data: {
    label: string;
    condition: string;
    config?: any;
    onEdit?: () => void;
  };
}

export const ConditionNode: React.FC<ConditionNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[200px] border-2 border-orange-500 bg-orange-50">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-orange-500 !border-2 !border-white !w-3 !h-3"
      />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-4 h-4 text-orange-600" />
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
            CONDITION
          </Badge>
          {data.onEdit && (
            <Settings 
              className="w-3 h-3 text-gray-500 cursor-pointer hover:text-gray-700 ml-auto"
              onClick={data.onEdit}
            />
          )}
        </div>
        <div className="font-medium text-sm mb-1">{data.label}</div>
        <div className="text-xs text-gray-600">{data.condition}</div>
      </div>
      <div className="flex justify-between">
        <Handle
          type="source"
          position={Position.Bottom}
          id="yes"
          className="!bg-green-500 !border-2 !border-white !w-3 !h-3 !left-[25%]"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="no"
          className="!bg-red-500 !border-2 !border-white !w-3 !h-3 !left-[75%]"
        />
      </div>
      <div className="flex justify-between px-3 pb-1 text-xs">
        <span className="text-green-600 font-medium">YES</span>
        <span className="text-red-600 font-medium">NO</span>
      </div>
    </Card>
  );
};
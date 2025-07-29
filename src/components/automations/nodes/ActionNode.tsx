import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Settings } from 'lucide-react';

interface ActionNodeProps {
  data: {
    label: string;
    actionType: string;
    config?: any;
    onEdit?: () => void;
  };
}

export const ActionNode: React.FC<ActionNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[200px] border-2 border-green-500 bg-green-50">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-green-500 !border-2 !border-white !w-3 !h-3"
      />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Play className="w-4 h-4 text-green-600" />
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
            ACTION
          </Badge>
          {data.onEdit && (
            <Settings 
              className="w-3 h-3 text-gray-500 cursor-pointer hover:text-gray-700 ml-auto"
              onClick={data.onEdit}
            />
          )}
        </div>
        <div className="font-medium text-sm mb-1">{data.label}</div>
        <div className="text-xs text-gray-600">{data.actionType}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-2 !border-white !w-3 !h-3"
      />
    </Card>
  );
};
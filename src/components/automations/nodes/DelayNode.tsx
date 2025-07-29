import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Settings } from 'lucide-react';

interface DelayNodeProps {
  data: {
    label: string;
    duration: string;
    config?: any;
    onEdit?: () => void;
  };
}

export const DelayNode: React.FC<DelayNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[200px] border-2 border-purple-500 bg-purple-50">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !border-2 !border-white !w-3 !h-3"
      />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
            DELAY
          </Badge>
          {data.onEdit && (
            <Settings 
              className="w-3 h-3 text-gray-500 cursor-pointer hover:text-gray-700 ml-auto"
              onClick={data.onEdit}
            />
          )}
        </div>
        <div className="font-medium text-sm mb-1">{data.label}</div>
        <div className="text-xs text-gray-600">{data.duration}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !border-2 !border-white !w-3 !h-3"
      />
    </Card>
  );
};
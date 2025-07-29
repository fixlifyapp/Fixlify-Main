import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Settings } from 'lucide-react';

interface TriggerNodeProps {
  data: {
    label: string;
    triggerType: string;
    config?: any;
    onEdit?: () => void;
  };
}

export const TriggerNode: React.FC<TriggerNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[200px] border-2 border-blue-500 bg-blue-50">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
            TRIGGER
          </Badge>
          {data.onEdit && (
            <Settings 
              className="w-3 h-3 text-gray-500 cursor-pointer hover:text-gray-700 ml-auto"
              onClick={data.onEdit}
            />
          )}
        </div>
        <div className="font-medium text-sm mb-1">{data.label}</div>
        <div className="text-xs text-gray-600">{data.triggerType}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !border-2 !border-white !w-3 !h-3"
      />
    </Card>
  );
};
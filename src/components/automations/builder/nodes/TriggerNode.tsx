
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Phone, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TriggerNodeData {
  label: string;
  type: string;
  config: any;
}

interface TriggerNodeProps {
  data: TriggerNodeData;
  selected?: boolean;
}

export const TriggerNode = memo(({ data, selected }: TriggerNodeProps) => {
  const getTriggerIcon = () => {
    switch (data.config?.trigger_type) {
      case 'schedule':
        return Clock;
      case 'missed_call':
        return Phone;
      case 'appointment':
        return Calendar;
      default:
        return Zap;
    }
  };

  const getTriggerColor = () => {
    switch (data.config?.trigger_type) {
      case 'schedule':
        return 'from-blue-500 to-blue-600';
      case 'missed_call':
        return 'from-red-500 to-red-600';
      case 'appointment':
        return 'from-green-500 to-green-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const Icon = getTriggerIcon();

  return (
    <Card className={cn(
      "min-w-[200px] shadow-lg border-2 transition-all duration-200",
      selected ? "border-blue-500 shadow-blue-200" : "border-gray-200 hover:border-blue-300"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-md",
            getTriggerColor()
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{data.label}</h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              Trigger
            </Badge>
          </div>
        </div>
        
        {data.config?.event_type && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">
              Event: {data.config.event_type.replace('_', ' ')}
            </p>
          </div>
        )}
      </CardContent>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-white bg-blue-500"
      />
    </Card>
  );
});

TriggerNode.displayName = 'TriggerNode';

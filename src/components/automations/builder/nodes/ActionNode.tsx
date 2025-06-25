
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Phone, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionNodeData {
  label: string;
  type: string;
  config: any;
}

interface ActionNodeProps {
  data: ActionNodeData;
  selected?: boolean;
}

export const ActionNode = memo(({ data, selected }: ActionNodeProps) => {
  const getActionIcon = () => {
    switch (data.config?.action_type) {
      case 'send_sms':
        return MessageSquare;
      case 'send_email':
        return Mail;
      case 'make_call':
        return Phone;
      case 'send_invoice':
        return DollarSign;
      case 'wait':
        return Clock;
      default:
        return MessageSquare;
    }
  };

  const getActionColor = () => {
    switch (data.config?.action_type) {
      case 'send_sms':
        return 'from-green-500 to-green-600';
      case 'send_email':
        return 'from-purple-500 to-purple-600';
      case 'make_call':
        return 'from-blue-500 to-blue-600';
      case 'send_invoice':
        return 'from-yellow-500 to-yellow-600';
      case 'wait':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-green-500 to-green-600';
    }
  };

  const Icon = getActionIcon();

  return (
    <Card className={cn(
      "min-w-[200px] shadow-lg border-2 transition-all duration-200",
      selected ? "border-green-500 shadow-green-200" : "border-gray-200 hover:border-green-300"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-md",
            getActionColor()
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{data.label}</h3>
            <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-800">
              Action
            </Badge>
          </div>
        </div>
        
        {data.config?.message && (
          <div className="mt-3 p-2 bg-green-50 rounded-lg">
            <p className="text-xs text-green-700 font-medium truncate">
              {data.config.message.substring(0, 50)}...
            </p>
          </div>
        )}

        {data.config?.delay > 0 && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {data.config.delay}m delay
            </Badge>
          </div>
        )}
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-white bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-white bg-green-500"
      />
    </Card>
  );
});

ActionNode.displayName = 'ActionNode';

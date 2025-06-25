
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConditionNodeData {
  label: string;
  type: string;
  config: any;
}

interface ConditionNodeProps {
  data: ConditionNodeData;
  selected?: boolean;
}

export const ConditionNode = memo(({ data, selected }: ConditionNodeProps) => {
  return (
    <Card className={cn(
      "min-w-[200px] shadow-lg border-2 transition-all duration-200",
      selected ? "border-yellow-500 shadow-yellow-200" : "border-gray-200 hover:border-yellow-300"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{data.label}</h3>
            <Badge variant="secondary" className="mt-1 text-xs bg-yellow-100 text-yellow-800">
              Condition
            </Badge>
          </div>
        </div>
        
        {data.config?.field && data.config?.operator && data.config?.value && (
          <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-700 font-medium">
              {data.config.field} {data.config.operator} {data.config.value}
            </p>
          </div>
        )}

        {/* Branch indicators */}
        <div className="flex gap-2 mt-3">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-xs text-gray-600">Yes</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-gray-600">No</span>
          </div>
        </div>
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-white bg-yellow-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        style={{ top: '60%' }}
        className="w-3 h-3 border-2 border-white bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        style={{ top: '80%' }}
        className="w-3 h-3 border-2 border-white bg-red-500"
      />
    </Card>
  );
});

ConditionNode.displayName = 'ConditionNode';

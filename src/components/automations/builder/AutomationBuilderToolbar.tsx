
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Download, Upload, Grid3X3, Maximize2 } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface AutomationBuilderToolbarProps {
  nodes: Node[];
  edges: Edge[];
  onClear: () => void;
}

export const AutomationBuilderToolbar = ({ nodes, edges, onClear }: AutomationBuilderToolbarProps) => {
  const exportWorkflow = () => {
    const workflowData = {
      nodes,
      edges,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importWorkflow = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            // This would need to be implemented to actually import the data
            console.log('Imported workflow:', data);
          } catch (error) {
            console.error('Failed to import workflow:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <CardContent className="p-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportWorkflow}
            className="hover:bg-gray-100"
            title="Export Workflow"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={importWorkflow}
            className="hover:bg-gray-100"
            title="Import Workflow"
          >
            <Upload className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-4 bg-gray-300 mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="hover:bg-red-50 hover:text-red-600"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

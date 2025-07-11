import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid3x3,
  Download,
  Upload,
  Undo,
  Redo
} from 'lucide-react';
import { toast } from 'sonner';

interface AutomationBuilderToolbarProps {
  nodes: any[];
  edges: any[];
  onClear: () => void;
}

export const AutomationBuilderToolbar = ({ 
  nodes, 
  edges, 
  onClear 
}: AutomationBuilderToolbarProps) => {
  const handleExport = () => {
    const workflow = {
      nodes,
      edges,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation-workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Workflow exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const workflow = JSON.parse(text);
        
        if (!workflow.nodes || !workflow.edges) {
          throw new Error('Invalid workflow file');
        }
        
        // TODO: Load the workflow
        toast.success('Workflow imported successfully');
      } catch (error) {
        toast.error('Failed to import workflow');
      }
    };
    input.click();
  };

  const handleClearConfirm = () => {
    if (nodes.length === 0 && edges.length === 0) {
      toast.info('Canvas is already empty');
      return;
    }
    
    if (window.confirm('Are you sure you want to clear the entire workflow?')) {
      onClear();
      toast.success('Workflow cleared');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClearConfirm}
        title="Clear canvas"
        className="hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      
      <div className="w-px h-6 bg-gray-200" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExport}
        title="Export workflow"
      >
        <Download className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleImport}
        title="Import workflow"
      >
        <Upload className="w-4 h-4" />
      </Button>
    </div>
  );
}; 
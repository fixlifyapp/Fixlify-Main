import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const TestWorkflowPage = () => {
  const [showBuilder, setShowBuilder] = React.useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Workflow Builder Test</h1>
      
      {!showBuilder ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="mb-4">Click to test the workflow builder</p>
          <Button onClick={() => setShowBuilder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Open Workflow Builder
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Workflow Builder Active</h2>
            <Button variant="outline" onClick={() => setShowBuilder(false)}>
              Close
            </Button>
          </div>
          <p className="text-green-600">✓ If you see this, the basic setup is working!</p>
          <p className="mt-2">Now check the Automations → Workflows tab for the full builder.</p>
        </div>
      )}
    </div>
  );
};

export default TestWorkflowPage;
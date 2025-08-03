import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wrench, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Play,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fixAutomationTriggers,
  processPendingAutomationLogs,
  createJobCreationAutomation
} from '@/utils/automation-fixes/fix-automation-triggers';
import { fixAllWorkflowStructures } from '@/utils/automation-fixes/fix-workflow-structures';
import { useAuth } from '@/hooks/use-auth';

export const FixAutomationButton: React.FC = () => {
  const [fixing, setFixing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [fixingStructures, setFixingStructures] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const { user } = useAuth();

  const handleFixAutomations = async () => {
    setFixing(true);
    setStatus({ type: null, message: '' });
    
    try {
      const result = await fixAutomationTriggers();
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: `✅ ${result.message}. Found ${result.pendingCount} pending automations.`
        });
        toast.success('Automation triggers fixed successfully');
      } else {
        setStatus({
          type: 'error',
          message: `❌ Error: ${result.error}`
        });
        toast.error('Failed to fix automation triggers');
      }
    } catch (error) {
      console.error('Error fixing automations:', error);
      setStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
      toast.error('An unexpected error occurred');
    } finally {
      setFixing(false);
    }
  };

  const handleProcessPending = async () => {
    setProcessing(true);
    setStatus({ type: null, message: '' });
    
    try {
      const result = await processPendingAutomationLogs();
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: `✅ Processed ${result.processed} automations, ${result.failed} failed`
        });
        toast.success(`Processed ${result.processed} pending automations`);
      } else {
        setStatus({
          type: 'error',
          message: `❌ Error: ${result.error}`
        });
        toast.error('Failed to process pending automations');
      }
    } catch (error) {
      console.error('Error processing pending:', error);
      setStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
      toast.error('An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateJobAutomation = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to create automations');
      return;
    }
    
    setCreating(true);
    setStatus({ type: null, message: '' });
    
    try {
      const result = await createJobCreationAutomation(user.id);
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: `✅ Created "Welcome New Job" automation successfully`
        });
        toast.success('Job creation automation created');
      } else {
        setStatus({
          type: 'error',
          message: `❌ Error: ${result.error}`
        });
        toast.error('Failed to create automation');
      }
    } catch (error) {
      console.error('Error creating automation:', error);
      setStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
      toast.error('An unexpected error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleFixStructures = async () => {
    setFixingStructures(true);
    setStatus({ type: null, message: '' });
    
    try {
      const result = await fixAllWorkflowStructures();
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: `✅ Fixed ${result.fixed} workflow structures`
        });
        toast.success('Workflow structures fixed');
      } else {
        setStatus({
          type: 'error',
          message: `❌ Error: ${result.error}`
        });
        toast.error('Failed to fix workflow structures');
      }
    } catch (error) {
      console.error('Error fixing structures:', error);
      setStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
      toast.error('An unexpected error occurred');
    } finally {
      setFixingStructures(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleFixAutomations}
          disabled={fixing || processing || creating || fixingStructures}
          variant="outline"
          className="flex items-center gap-2"
        >
          {fixing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wrench className="h-4 w-4" />
          )}
          Fix Automation Triggers
        </Button>
        
        <Button
          onClick={handleFixStructures}
          disabled={fixing || processing || creating || fixingStructures}
          variant="outline"
          className="flex items-center gap-2"
        >
          {fixingStructures ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
          Fix Workflow Steps
        </Button>
        
        <Button
          onClick={handleProcessPending}
          disabled={fixing || processing || creating || fixingStructures}
          variant="outline"
          className="flex items-center gap-2"
        >
          {processing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Process Pending
        </Button>
        
        <Button
          onClick={handleCreateJobAutomation}
          disabled={fixing || processing || creating || fixingStructures}
          variant="outline"
          className="flex items-center gap-2"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Create Job Automation
        </Button>
      </div>
      
      {status.type && (
        <Alert className={
          status.type === 'success' ? 'border-green-500' :
          status.type === 'error' ? 'border-red-500' :
          'border-blue-500'
        }>
          <AlertDescription className="flex items-center gap-2">
            {status.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {status.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
            {status.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

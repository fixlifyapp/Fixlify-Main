import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StopCircle, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { automationProcessor } from '@/services/automationProcessorService';

export const EmergencyAutomationStop: React.FC = () => {
  const [stopping, setStopping] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleEmergencyStop = async () => {
    if (!confirm('This will stop the automation processor and clear old pending logs. Continue?')) {
      return;
    }

    setStopping(true);
    try {
      // Stop the processor
      automationProcessor.stop();
      
      // Clear old pending logs
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('automation_execution_logs')
        .update({
          status: 'expired',
          error_message: 'Expired - emergency stop',
          completed_at: new Date().toISOString()
        })
        .eq('status', 'pending')
        .lt('created_at', oneHourAgo);

      if (error) {
        throw error;
      }

      toast.success('Automation processor stopped and old logs cleared');
    } catch (error) {
      console.error('Error stopping automations:', error);
      toast.error('Failed to stop automations');
    } finally {
      setStopping(false);
    }
  };

  const handleClearAllPending = async () => {
    if (!confirm('This will cancel ALL pending automations. This cannot be undone. Continue?')) {
      return;
    }

    setClearing(true);
    try {
      const { error } = await supabase
        .from('automation_execution_logs')
        .update({
          status: 'cancelled',
          error_message: 'Manually cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('status', 'pending');

      if (error) {
        throw error;
      }

      toast.success('All pending automations cancelled');
    } catch (error) {
      console.error('Error clearing pending:', error);
      toast.error('Failed to clear pending automations');
    } finally {
      setClearing(false);
    }
  };

  return (
    <Alert className="border-red-500">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-semibold">Emergency Automation Controls</p>
          <div className="flex gap-2">
            <Button
              onClick={handleEmergencyStop}
              disabled={stopping}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              {stopping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <StopCircle className="h-4 w-4" />
              )}
              Stop & Clear Old
            </Button>
            
            <Button
              onClick={handleClearAllPending}
              disabled={clearing}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              {clearing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <StopCircle className="h-4 w-4" />
              )}
              Cancel ALL Pending
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

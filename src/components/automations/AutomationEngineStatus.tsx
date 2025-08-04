import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, PlayCircle, AlertCircle } from 'lucide-react';
import { AutomationProcessor } from '@/services/automationProcessor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AutomationEngineStatus = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check engine status and pending automations
  const checkStatus = async () => {
    setIsRunning(AutomationProcessor.isRunning());
    
    // Check pending automations
    const { count } = await supabase
      .from('automation_execution_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    setPendingCount(count || 0);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleStartEngine = async () => {
    setLoading(true);
    try {
      await AutomationProcessor.startEngine();
      setIsRunning(true);
      toast.success('Automation engine started successfully');
    } catch (error) {
      console.error('Failed to start automation engine:', error);
      toast.error('Failed to start automation engine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Automation Engine Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-medium">
                {isRunning ? 'Running' : 'Stopped'}
              </span>
              {pendingCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({pendingCount} pending automations)
                </span>
              )}
            </div>
            
            {!isRunning && (
              <Button
                onClick={handleStartEngine}
                size="sm"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Start Engine
              </Button>
            )}
          </div>
          
          {!isRunning && pendingCount > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The automation engine is stopped. There are {pendingCount} pending automations waiting to be processed.
                Start the engine to process them.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
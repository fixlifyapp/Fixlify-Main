import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Clock, PlayCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { formatDistanceToNow } from 'date-fns';

interface ExecutionLog {
  id: string;
  workflow_id: string;
  status: string;
  trigger_type: string;
  trigger_data: any;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  automation_workflows?: {
    name: string;
  };
}

export const AutomationExecutionLogs = () => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { organization } = useOrganization();

  const fetchLogs = async () => {
    if (!user?.id || !organization?.id) return;

    setLoading(true);
    try {
      console.log('Fetching logs for organization:', organization.id);
      
      const { data, error } = await supabase
        .from('automation_execution_logs')
        .select(`
          *,
          automation_workflows (
            name
          )
        `)
        .eq('organization_id', organization.id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching logs:', error);
        throw error;
      }
      
      console.log('Fetched logs:', data);
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchLogs();

      // Subscribe to new logs for this organization
      const subscription = supabase
        .channel('automation-logs')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'automation_execution_logs',
          filter: `organization_id=eq.${organization.id}`
        }, () => {
          fetchLogs();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id, organization?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <PlayCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      failed: 'destructive',
      partial: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Execution History</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading execution logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No execution logs yet
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="mt-1">{getStatusIcon(log.status)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {log.automation_workflows?.name || 'Unknown Workflow'}
                      </span>
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>Triggered by: {log.trigger_type}</span>
                      {log.trigger_data?.entityType && (
                        <span> • {log.trigger_data.entityType}</span>
                      )}
                    </div>
                    {log.error_message && (
                      <div className="text-sm text-red-500 mt-1">
                        Error: {log.error_message}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export const RealtimeDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    websocketConnected: false,
    authStatus: 'checking',
    realtimeEnabled: false,
    testChannelStatus: 'idle',
    lastError: null as string | null,
    activeChannels: 0
  });

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data, error }) => {
      setDiagnostics(prev => ({
        ...prev,
        authStatus: error ? 'error' : data?.session ? 'authenticated' : 'anonymous'
      }));
    });

    // Check WebSocket connection
    const checkWebSocket = () => {
      const ws = (supabase as any).realtime?.socket;
      if (ws) {
        setDiagnostics(prev => ({
          ...prev,
          websocketConnected: ws.readyState === WebSocket.OPEN,
          activeChannels: (supabase as any).realtime?.channels?.length || 0
        }));
      }
    };

    checkWebSocket();
    const interval = setInterval(checkWebSocket, 2000);

    return () => clearInterval(interval);
  }, []);

  const runTest = async () => {
    setDiagnostics(prev => ({ ...prev, testChannelStatus: 'testing', lastError: null }));

    try {
      const testChannel = supabase
        .channel('diagnostic-test')
        .on('broadcast', { event: 'test' }, (payload) => {
          console.log('Test broadcast received:', payload);
        })
        .subscribe((status, err) => {
          if (err) {
            setDiagnostics(prev => ({
              ...prev,
              testChannelStatus: 'error',
              lastError: err.message
            }));
          } else if (status === 'SUBSCRIBED') {
            setDiagnostics(prev => ({
              ...prev,
              testChannelStatus: 'success',
              realtimeEnabled: true
            }));
            
            // Send test broadcast
            testChannel.send({
              type: 'broadcast',
              event: 'test',
              payload: { timestamp: new Date().toISOString() }
            });

            // Clean up after 2 seconds
            setTimeout(() => {
              supabase.removeChannel(testChannel);
            }, 2000);
          }
        });
    } catch (error: any) {
      setDiagnostics(prev => ({
        ...prev,
        testChannelStatus: 'error',
        lastError: error.message
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authenticated':
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'testing':
      case 'checking':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Real-time Diagnostics
          {diagnostics.websocketConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">WebSocket Status</p>
            <Badge className={diagnostics.websocketConnected ? 'bg-green-500' : 'bg-red-500'}>
              {diagnostics.websocketConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Auth Status</p>
            <Badge className={getStatusColor(diagnostics.authStatus)}>
              {diagnostics.authStatus}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Active Channels</p>
            <Badge variant="outline">{diagnostics.activeChannels}</Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Real-time Enabled</p>
            <Badge className={diagnostics.realtimeEnabled ? 'bg-green-500' : 'bg-gray-500'}>
              {diagnostics.realtimeEnabled ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Connection Test</p>
          <div className="flex items-center gap-4">
            <Button 
              onClick={runTest} 
              disabled={diagnostics.testChannelStatus === 'testing'}
              size="sm"
            >
              {diagnostics.testChannelStatus === 'testing' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Test'
              )}
            </Button>
            
            {diagnostics.testChannelStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Test passed</span>
              </div>
            )}
            
            {diagnostics.testChannelStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Test failed</span>
              </div>
            )}
          </div>
          
          {diagnostics.lastError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              Error: {diagnostics.lastError}
            </div>
          )}
        </div>

        <div className="border-t pt-4 text-xs text-muted-foreground">
          <p>Debug commands (run in console):</p>
          <code className="block mt-1 p-2 bg-gray-100 rounded">window.debugRealtime()</code>
        </div>
      </CardContent>
    </Card>
  );
};

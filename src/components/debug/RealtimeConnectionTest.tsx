import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const RealtimeConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    console.log('Setting up realtime connection test...');
    
    const channel = supabase
      .channel('connection-test')
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence sync');
        setConnectionStatus('connected');
        setLastUpdate(new Date());
      })
      .on('broadcast', { event: 'test' }, (payload) => {
        console.log('Broadcast received:', payload);
        setUpdateCount(prev => prev + 1);
        setLastUpdate(new Date());
      })
      .subscribe((status, err) => {
        console.log('Channel status:', status, err);
        
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          toast.success('Connected to real-time updates');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('disconnected');
          toast.error('Lost connection to real-time updates');
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

    // Send a test broadcast every 5 seconds
    const interval = setInterval(() => {
      if (connectionStatus === 'connected') {
        channel.send({
          type: 'broadcast',
          event: 'test',
          payload: { timestamp: new Date().toISOString() }
        });
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const reconnect = () => {
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Real-time Connection Test
          {connectionStatus === 'connected' ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : connectionStatus === 'disconnected' ? (
            <WifiOff className="h-5 w-5 text-red-500" />
          ) : (
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className={`font-medium ${
            connectionStatus === 'connected' ? 'text-green-600' : 
            connectionStatus === 'disconnected' ? 'text-red-600' : 
            'text-blue-600'
          }`}>
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'disconnected' ? 'Disconnected' :
             'Connecting...'}
          </p>
        </div>
        
        {lastUpdate && (
          <div>
            <p className="text-sm text-muted-foreground">Last Update</p>
            <p className="font-medium">{lastUpdate.toLocaleTimeString()}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm text-muted-foreground">Updates Received</p>
          <p className="font-medium">{updateCount}</p>
        </div>
        
        {connectionStatus === 'disconnected' && (
          <Button onClick={reconnect} className="w-full">
            Reconnect
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

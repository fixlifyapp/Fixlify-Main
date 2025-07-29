import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function TestRealtimePage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [testMessage, setTestMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔧 TestRealtimePage: Setting up real-time subscription');
    
    try {
      // Set up real-time subscription
      const channel = supabase
        .channel('test-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('📨 Real-time message update:', payload);
            toast.success('Real-time update received!');
            loadMessages();
          }
        )
        .subscribe((status) => {
          console.log('📡 Real-time status:', status);
          setIsConnected(status === 'SUBSCRIBED');
          if (status === 'SUBSCRIBED') {
            toast.success('Real-time connected!');
            setError(null);
          } else if (status === 'CLOSED') {
            setError('Real-time connection closed');
          }
        });

      // Load initial messages
      loadMessages();

      return () => {
        console.log('🔌 Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('❌ Error setting up real-time:', err);
      setError(`Setup error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const loadMessages = async () => {
    try {
      console.log('📥 Loading messages...');
      const { data, error } = await supabase
        .from('sms_messages')
        .select(`
          id,
          body,
          direction,
          sender,
          recipient,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Error loading messages:', error);
        setError(`Database error: ${error.message}`);
        return;
      }
      
      console.log('✅ Messages loaded:', data?.length || 0);
      setMessages(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading messages:', err);
      setError(`Load error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const sendTestSMS = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a test message');
      return;
    }

    try {
      console.log('📤 Sending test SMS...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast.error('You must be logged in to send a test message.');
        setError('Authentication error: ' + (sessionError?.message || 'No active session'));
        return;
      }
      
      const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-receiver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          event_type: 'message.received',
          payload: {
            direction: 'inbound',
            from: { phone_number: '+1234567890' },
            to: [{ phone_number: '+14375249932' }],
            text: testMessage,
            id: 'test-' + Date.now()
          }
        })
      });

      const result = await response.json();
      console.log('SMS webhook response:', result);
      
      if (result.success) {
        toast.success('Test SMS sent successfully!');
        setTestMessage("");
        setError(null);
      } else {
        const errorMsg = result.error || 'Unknown error';
        toast.error('Failed to send test SMS: ' + errorMsg);
        setError(`SMS error: ${errorMsg}`);
      }
    } catch (err) {
      console.error('❌ Error sending test SMS:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Error sending test SMS: ' + errorMsg);
      setError(`Network error: ${errorMsg}`);
    }
  };

  const testOutboundSMS = async () => {
    try {
      console.log('📤 Testing outbound SMS...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('Please log in first');
        setError('Authentication required');
        return;
      }

      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone: '+1234567890',
          message: 'Test outbound message - ' + new Date().toLocaleTimeString(),
          client_id: 'ea2d7e55-e118-4883-9c4d-d3d146e03eff',
          job_id: '',
          user_id: user.id
        }
      });

      if (error) {
        console.error('❌ Function invocation error:', error);
        toast.error('Failed to invoke SMS function: ' + error.message);
        setError(`Function error: ${error.message}`);
        return;
      }
      
      if (data?.success) {
        toast.success('Test outbound SMS sent!');
        setError(null);
      } else {
        const errorMsg = data?.error || 'Unknown error';
        toast.error('Failed to send outbound SMS: ' + errorMsg);
        setError(`SMS error: ${errorMsg}`);
      }
    } catch (err) {
      console.error('❌ Error sending outbound SMS:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Error sending outbound SMS: ' + errorMsg);
      setError(`Network error: ${errorMsg}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Real-time Messaging Test</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">Error:</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Real-time Status
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected to real-time updates' : 'Disconnected'}
            </p>
            <Button onClick={loadMessages} variant="outline" size="sm" className="mt-2">
              Refresh Messages
            </Button>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter test message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendTestSMS()}
              />
              <Button onClick={sendTestSMS} className="w-full" disabled={!testMessage.trim()}>
                Send Test Inbound SMS
              </Button>
            </div>
            <Button onClick={testOutboundSMS} variant="outline" className="w-full">
              Send Test Outbound SMS
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${
                  message.direction === 'inbound' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">
                    {message.direction === 'inbound' ? '📥 Inbound' : '📤 Outbound'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{message.body}</p>
                <div className="text-xs text-gray-600 mt-1">
                  From: {message.sender} → To: {message.recipient}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-center text-gray-500 py-8">No messages found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
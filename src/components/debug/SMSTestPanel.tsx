import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SMSTestResult {
  success: boolean;
  error?: string;
  config?: any;
  testResult?: any;
}

export const SMSTestPanel = () => {
  const [testPhone, setTestPhone] = useState('+1234567890');
  const [testMessage, setTestMessage] = useState('Test message from Fixlify');
  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [isTestingSend, setIsTestingSend] = useState(false);
  const [configResult, setConfigResult] = useState<SMSTestResult | null>(null);
  const [sendResult, setSendResult] = useState<SMSTestResult | null>(null);

  const testSMSConfiguration = async () => {
    setIsTestingConfig(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-sms-send');
      
      if (error) {
        toast.error('SMS Test Failed: ' + error.message);
        setConfigResult({ success: false, error: error.message });
      } else {
        setConfigResult(data);
        if (data.success) {
          toast.success('SMS Configuration Valid!');
        } else {
          toast.error('SMS Config Issue: ' + data.error);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Test Error: ' + errorMsg);
      setConfigResult({ success: false, error: errorMsg });
    } finally {
      setIsTestingConfig(false);
    }
  };

  const testSMSSend = async () => {
    setIsTestingSend(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone: testPhone,
          message: testMessage,
          client_id: '',
          job_id: '',
        }
      });
      
      if (error) {
        toast.error('SMS Send Failed: ' + error.message);
        setSendResult({ success: false, error: error.message });
      } else {
        setSendResult(data);
        if (data.success) {
          toast.success('SMS Sent Successfully!');
        } else {
          toast.error('SMS Send Issue: ' + data.error);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Send Error: ' + errorMsg);
      setSendResult({ success: false, error: errorMsg });
    } finally {
      setIsTestingSend(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>SMS System Test Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Configuration Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">1. Test SMS Configuration</h3>
            <Button 
              onClick={testSMSConfiguration}
              disabled={isTestingConfig}
              variant="outline"
              className="w-full"
            >
              {isTestingConfig ? 'Testing Configuration...' : 'Test SMS Config'}
            </Button>
            
            {configResult && (
              <div className={`p-3 rounded text-sm ${
                configResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <p><strong>Result:</strong> {configResult.success ? 'SUCCESS' : 'FAILED'}</p>
                {configResult.error && <p><strong>Error:</strong> {configResult.error}</p>}
                {configResult.config && (
                  <div className="mt-2">
                    <p><strong>API Key:</strong> {configResult.config.hasApiKey ? '✅' : '❌'}</p>
                    <p><strong>Messaging Profile:</strong> {configResult.config.hasMessagingProfile ? '✅' : '❌'}</p>
                    <p><strong>From Phone:</strong> {configResult.config.fromPhone || 'Not found'}</p>
                    <p><strong>Active Numbers:</strong> {configResult.config.activeNumbers || 0}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Send Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">2. Test SMS Sending</h3>
            <Input
              placeholder="Test phone number (e.g., +1234567890)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
            <Textarea
              placeholder="Test message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={testSMSSend}
              disabled={isTestingSend || !testPhone || !testMessage}
              className="w-full"
            >
              {isTestingSend ? 'Sending SMS...' : 'Send Test SMS'}
            </Button>
            
            {sendResult && (
              <div className={`p-3 rounded text-sm ${
                sendResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <p><strong>Result:</strong> {sendResult.success ? 'SUCCESS' : 'FAILED'}</p>
                {sendResult.error && <p><strong>Error:</strong> {sendResult.error}</p>}
                {sendResult.success && (
                  <div className="mt-2">
                    <p><strong>Message ID:</strong> {(sendResult as any).messageId}</p>
                    <p><strong>From:</strong> {(sendResult as any).from}</p>
                    <p><strong>To:</strong> {(sendResult as any).to}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Note:</strong> This panel tests the SMS system configuration and sending capability.</p>
            <p>✅ Both TELNYX_API_KEY and TELNYX_MESSAGING_PROFILE_ID must be configured in Supabase secrets.</p>
            <p>✅ You must have active phone numbers in the telnyx_phone_numbers table.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
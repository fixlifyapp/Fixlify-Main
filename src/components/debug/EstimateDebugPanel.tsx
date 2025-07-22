
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EstimateDebugPanelProps {
  estimateId: string;
}

export const EstimateDebugPanel = ({ estimateId }: EstimateDebugPanelProps) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDebugInfo = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (error) throw error;
      setDebugInfo(data);
    } catch (error) {
      console.error('Debug fetch error:', error);
      toast.error('Failed to fetch debug info');
    } finally {
      setIsLoading(false);
    }
  };

  const testSendEmail = async () => {
    try {
      const result = await supabase.functions.invoke('send-estimate', {
        body: { estimateId, method: 'email' }
      });
      
      if (result.error) throw result.error;
      
      toast.success('Email sent successfully');
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send email');
    }
  };

  const testSendSMS = async () => {
    try {
      const result = await supabase.functions.invoke('send-estimate-sms', {
        body: { estimateId }
      });
      
      if (result.error) throw result.error;
      
      toast.success('SMS sent successfully');
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send SMS');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug Panel - Estimate {estimateId}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={fetchDebugInfo} disabled={isLoading}>
            Fetch Debug Info
          </Button>
          <Button onClick={testSendEmail} variant="outline">
            Test Email
          </Button>
          <Button onClick={testSendSMS} variant="outline">
            Test SMS
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-2">
            <Badge>Status: {debugInfo.status}</Badge>
            <div className="text-sm">
              <strong>ID:</strong> {debugInfo.id}
            </div>
            <div className="text-sm">
              <strong>Total:</strong> ${debugInfo.total}
            </div>
            <div className="text-sm">
              <strong>Created:</strong> {new Date(debugInfo.created_at).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

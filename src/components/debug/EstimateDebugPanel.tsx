import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const EstimateDebugPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: any = {
      auth: {},
      estimates: {},
      edgeFunction: {},
      secrets: {}
    };

    try {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      results.auth = {
        status: user ? '✅' : '❌',
        email: user?.email || 'Not authenticated'
      };

      // Get sample estimate
      const { data: estimate, error: estError } = await supabase
        .from('estimates')
        .select('*, jobs(*, clients(*))')
        .limit(1)
        .single();

      results.estimates = {
        status: estimate ? '✅' : '❌',
        sampleId: estimate?.id,
        estimateNumber: estimate?.estimate_number,
        clientEmail: estimate?.jobs?.clients?.email,
        error: estError?.message
      };

      // Test edge function directly
      if (estimate) {
        const { data: sendResult, error: sendError } = await supabase.functions
          .invoke('send-estimate', {
            body: {
              estimateId: estimate.id,
              recipientEmail: 'debug-test@example.com',
              customMessage: 'Debug test message'
            }
          });

        results.edgeFunction = {
          status: sendResult?.success ? '✅' : '❌',
          response: sendResult,
          error: sendError?.message,
          portalLink: sendResult?.portalLink
        };
      }

      // Check if PUBLIC_SITE_URL is being used correctly
      results.secrets.publicSiteUrl = sendResult?.portalLink?.includes('hub.fixlify.app') ? '✅ Correct domain' : '❌ Wrong domain';

    } catch (error) {
      results.error = error;
    }

    setDebugInfo(results);
    setIsLoading(false);
    
    console.log('🔍 Estimate Debug Results:', results);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Estimate Email Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isLoading}
        >
          {isLoading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Authentication</h3>
              <p>{debugInfo.auth.status} {debugInfo.auth.email}</p>
            </div>

            <div>
              <h3 className="font-semibold">Estimates</h3>
              <p>{debugInfo.estimates.status} Sample: {debugInfo.estimates.estimateNumber}</p>
              {debugInfo.estimates.error && (
                <p className="text-red-600">Error: {debugInfo.estimates.error}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold">Edge Function</h3>
              <p>{debugInfo.edgeFunction.status} Response: {JSON.stringify(debugInfo.edgeFunction.response)}</p>
              {debugInfo.edgeFunction.error && (
                <p className="text-red-600">Error: {debugInfo.edgeFunction.error}</p>
              )}
              {debugInfo.edgeFunction.portalLink && (
                <p className="text-green-600">Portal: {debugInfo.edgeFunction.portalLink}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold">Domain Check</h3>
              <p>{debugInfo.secrets.publicSiteUrl}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
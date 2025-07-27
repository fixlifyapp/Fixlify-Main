import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PortalAccessTest {
  clientId: string;
  clientName: string;
  clientEmail: string;
  accessToken?: string;
  portalUrl?: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  error?: string;
  testResult?: {
    dataLoaded: boolean;
    estimatesCount?: number;
    invoicesCount?: number;
    jobsCount?: number;
  };
}

export default function TestPortalAccessPage() {
  const [tests, setTests] = useState<PortalAccessTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  // Load all clients
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTests(
        (clients || []).map(client => ({
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          status: 'pending'
        }))
      );
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: 'Error loading clients',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePortalAccess = async (test: PortalAccessTest) => {
    try {
      // Update status
      setTests(prev => prev.map(t => 
        t.clientId === test.clientId ? { ...t, status: 'generating' } : t
      ));

      // Generate portal access token using RPC function
      const { data, error } = await supabase.rpc('generate_portal_access', {
        p_client_id: test.clientId,
        p_permissions: {
          view_estimates: true,
          view_invoices: true,
          view_jobs: true,
          pay_invoices: true,
          approve_estimates: true
        },
        p_hours_valid: 72
      });

      if (error) throw error;

      const accessToken = data;
      const portalUrl = `https://hub.fixlify.app/portal/${accessToken}`;

      // Test the portal data edge function
      const testResult = await testPortalData(accessToken);

      // Update test with results
      setTests(prev => prev.map(t => 
        t.clientId === test.clientId 
          ? { 
              ...t, 
              status: 'success',
              accessToken,
              portalUrl,
              testResult
            } 
          : t
      ));

      return { success: true, accessToken, portalUrl };
    } catch (error) {
      console.error(`Error generating portal access for ${test.clientName}:`, error);
      setTests(prev => prev.map(t => 
        t.clientId === test.clientId 
          ? { ...t, status: 'error', error: error.message } 
          : t
      ));
      return { success: false, error: error.message };
    }
  };

  const testPortalData = async (accessToken: string) => {
    try {
      const response = await supabase.functions.invoke('portal-data', {
        body: { accessToken }
      });

      if (response.error) throw response.error;

      const data = response.data;
      return {
        dataLoaded: true,
        estimatesCount: data.estimates?.length || 0,
        invoicesCount: data.invoices?.length || 0,
        jobsCount: data.jobs?.length || 0
      };
    } catch (error) {
      console.error('Error testing portal data:', error);
      return { dataLoaded: false };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    
    // Process tests in batches to avoid overwhelming the system
    const batchSize = 5;
    const pendingTests = tests.filter(t => t.status === 'pending' || t.status === 'error');
    
    for (let i = 0; i < pendingTests.length; i += batchSize) {
      const batch = pendingTests.slice(i, i + batchSize);
      await Promise.all(batch.map(test => generatePortalAccess(test)));
      
      // Small delay between batches
      if (i + batchSize < pendingTests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setTesting(false);
    
    const successCount = tests.filter(t => t.status === 'success').length;
    const errorCount = tests.filter(t => t.status === 'error').length;
    
    toast({
      title: 'Portal Access Test Complete',
      description: `Success: ${successCount}, Errors: ${errorCount}`,
      variant: errorCount > 0 ? 'destructive' : 'default'
    });
  };

  const resetTests = () => {
    setTests(prev => prev.map(t => ({ ...t, status: 'pending', error: undefined, accessToken: undefined, portalUrl: undefined, testResult: undefined })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const stats = {
    total: tests.length,
    success: tests.filter(t => t.status === 'success').length,
    error: tests.filter(t => t.status === 'error').length,
    pending: tests.filter(t => t.status === 'pending').length
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Portal Access System Test</CardTitle>
          <p className="text-muted-foreground">
            Test portal access generation for all clients in the system
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.success}</div>
              <div className="text-sm text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.error}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={testing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
            <Button onClick={resetTests} variant="outline" disabled={testing}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Tests
            </Button>
            <Button onClick={loadClients} variant="outline" disabled={testing}>
              Reload Clients
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tests.map(test => (
          <Card key={test.clientId} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{test.clientName}</h3>
                    <Badge variant="outline">{test.clientId}</Badge>
                    {test.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                    {test.status === 'generating' && <Badge className="bg-blue-500">Generating...</Badge>}
                    {test.status === 'success' && <Badge className="bg-green-500">Success</Badge>}
                    {test.status === 'error' && <Badge variant="destructive">Error</Badge>}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{test.clientEmail}</p>
                  
                  {test.status === 'success' && test.portalUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 p-1 rounded flex-1">
                          {test.portalUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(test.portalUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {test.testResult && (
                        <div className="flex items-center gap-4 text-sm">
                          {test.testResult.dataLoaded ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Data loaded successfully</span>
                              <Badge variant="outline">Estimates: {test.testResult.estimatesCount}</Badge>
                              <Badge variant="outline">Invoices: {test.testResult.invoicesCount}</Badge>
                              <Badge variant="outline">Jobs: {test.testResult.jobsCount}</Badge>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span>Failed to load portal data</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {test.status === 'error' && test.error && (
                    <p className="text-sm text-red-600 mt-2">{test.error}</p>
                  )}
                </div>
                
                <div className="ml-4">
                  {test.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => generatePortalAccess(test)}
                      disabled={testing}
                    >
                      Generate Access
                    </Button>
                  )}
                  {test.status === 'generating' && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                  {test.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {test.status === 'error' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generatePortalAccess(test)}
                      disabled={testing}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

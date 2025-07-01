import React, { useState, useEffect } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Bot,
  Zap,
  History,
  Phone
} from 'lucide-react';

const TestAutomationPage = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState('sms');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchWorkflows();
      fetchClients();
      fetchRecentLogs();
    }
  }, [profile?.organization_id]);

  const fetchWorkflows = async () => {
    if (!profile?.organization_id) return;
    
    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching workflows:', error);
      return;
    }

    setWorkflows(data || []);
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, email, phone')
      .eq('status', 'active')
      .order('name')
      .limit(50);

    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }

    setClients(data || []);
  };

  const fetchRecentLogs = async () => {
    const { data, error } = await supabase
      .from('automation_communication_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching logs:', error);
      return;
    }

    setLogs(data || []);
  };

  const handleTestSMS = async () => {
    if (!recipientPhone || !message) {
      toast.error('Please enter phone number and message');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone,
          message,
          client_id: selectedClient || undefined,
          metadata: {
            test: true,
            testType: 'manual'
          }
        }
      });

      if (error) throw error;

      toast.success('SMS sent successfully!');
      fetchRecentLogs();
    } catch (error) {
      console.error('SMS test error:', error);
      toast.error('Failed to send SMS: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!recipientEmail || !emailSubject || !message) {
      toast.error('Please fill in all email fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipientEmail,
          subject: emailSubject,
          html: message,
          client_id: selectedClient || undefined,
          metadata: {
            test: true,
            testType: 'manual'
          }
        }
      });

      if (error) throw error;

      toast.success('Email sent successfully!');
      fetchRecentLogs();
    } catch (error) {
      console.error('Email test error:', error);
      toast.error('Failed to send email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWorkflow = async () => {
    if (!selectedWorkflow || !selectedClient) {
      toast.error('Please select a workflow and client');
      return;
    }

    setLoading(true);
    try {
      // Get client details
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', selectedClient)
        .single();

      if (!client) throw new Error('Client not found');

      // Execute workflow via edge function
      const { data, error } = await supabase.functions.invoke('automation-executor', {
        body: {
          workflowId: selectedWorkflow,
          triggeredBy: 'manual_test',
          entityId: selectedClient,
          entityType: 'client',
          context: {
            clientId: client.id,
            clientName: client.name,
            clientEmail: client.email,
            clientPhone: client.phone,
            userId: user?.id,
            testMode: true
          }
        }
      });

      if (error) throw error;

      toast.success('Workflow executed successfully!');
      fetchRecentLogs();
    } catch (error) {
      console.error('Workflow test error:', error);
      toast.error('Failed to execute workflow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Automation Testing"
        description="Test automation workflows and communication channels"
        icon={<Bot className="h-8 w-8 text-indigo-600" />}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        <Tabs defaultValue="sms" onValueChange={setTestType}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sms">
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS Testing
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email Testing
            </TabsTrigger>
            <TabsTrigger value="workflow">
              <Zap className="h-4 w-4 mr-2" />
              Workflow Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test SMS Messaging</CardTitle>
                <CardDescription>
                  Send a test SMS message via Telnyx
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="phone">Recipient Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="client">Associate with Client (Optional)</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.phone && `(${client.phone})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your test message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={handleTestSMS} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Test SMS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Email Messaging</CardTitle>
                <CardDescription>
                  Send a test email via Mailgun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="email">Recipient Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="test@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Test Email Subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="client-email">Associate with Client (Optional)</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.email && `(${client.email})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email-message">Message (HTML supported)</Label>
                    <Textarea
                      id="email-message"
                      placeholder="Enter your test message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <Button 
                    onClick={handleTestEmail} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Send Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Automation Workflow</CardTitle>
                <CardDescription>
                  Execute a complete automation workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="workflow">Select Workflow</Label>
                    <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a workflow to test" />
                      </SelectTrigger>
                      <SelectContent>
                        {workflows.map((workflow) => (
                          <SelectItem key={workflow.id} value={workflow.id}>
                            {workflow.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="workflow-client">Select Client</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a client for testing" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedWorkflow && (
                    <Alert>
                      <AlertDescription>
                        This will execute the selected workflow with the chosen client's data.
                        Any configured actions (SMS, Email, etc.) will be performed.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={handleTestWorkflow} 
                    disabled={loading || !selectedWorkflow || !selectedClient}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Execute Test Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Communication Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No recent logs found
                </p>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {log.communication_type === 'sms' ? (
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Mail className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {log.communication_type?.toUpperCase()} to {log.recipient}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={log.status === 'sent' ? 'default' : 'destructive'}
                    >
                      {log.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TestAutomationPage;
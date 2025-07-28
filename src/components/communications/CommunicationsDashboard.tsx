import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CommunicationStats {
  totalEmails: number;
  successfulEmails: number;
  failedEmails: number;
  totalSMS: number;
  successfulSMS: number;
  failedSMS: number;
  pendingSMS: number;
  pendingEmails: number;
  successRate: {
    email: number;
    sms: number;
  };
}

interface CommunicationLog {
  id: string;
  type: 'email' | 'sms';
  to_address: string;
  from_address: string;
  content: string;
  status: 'sent' | 'failed' | 'pending';
  created_at: string;
  metadata: any;
  error_message?: string;
}

export function CommunicationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CommunicationStats>({
    totalEmails: 0,
    successfulEmails: 0,
    failedEmails: 0,
    totalSMS: 0,
    successfulSMS: 0,
    failedSMS: 0,
    pendingSMS: 0,
    pendingEmails: 0,
    successRate: { email: 0, sms: 0 }
  });
  const [recentLogs, setRecentLogs] = useState<CommunicationLog[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load communication logs
      const { data: logs, error } = await supabase
        .from('communication_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const communications = (logs || []).map(log => ({
        ...log,
        type: log.type as 'email' | 'sms'
      })) as CommunicationLog[];
      setRecentLogs(communications);

      // Calculate statistics
      const emailLogs = communications.filter(log => log.type === 'email');
      const smsLogs = communications.filter(log => log.type === 'sms');

      const emailStats = {
        total: emailLogs.length,
        successful: emailLogs.filter(log => log.status === 'sent').length,
        failed: emailLogs.filter(log => log.status === 'failed').length,
        pending: emailLogs.filter(log => log.status === 'pending').length
      };

      const smsStats = {
        total: smsLogs.length,
        successful: smsLogs.filter(log => log.status === 'sent').length,
        failed: smsLogs.filter(log => log.status === 'failed').length,
        pending: smsLogs.filter(log => log.status === 'pending').length
      };

      setStats({
        totalEmails: emailStats.total,
        successfulEmails: emailStats.successful,
        failedEmails: emailStats.failed,
        pendingEmails: emailStats.pending,
        totalSMS: smsStats.total,
        successfulSMS: smsStats.successful,
        failedSMS: smsStats.failed,
        pendingSMS: smsStats.pending,
        successRate: {
          email: emailStats.total > 0 ? (emailStats.successful / emailStats.total) * 100 : 0,
          sms: smsStats.total > 0 ? (smsStats.successful / smsStats.total) * 100 : 0
        }
      });

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load communication data');
    } finally {
      setLoading(false);
    }
  };

  const testEmailSystem = async () => {
    try {
      toast.info('Testing email system...');
      const response = await supabase.functions.invoke('check-email-config');
      
      if (response.data?.configuration?.mailgun?.configured) {
        toast.success('Email system is properly configured');
      } else {
        toast.error('Email system configuration issue detected');
      }
    } catch (error) {
      toast.error('Failed to test email system');
    }
  };

  const testSMSSystem = async () => {
    try {
      toast.info('Testing SMS system...');
      const response = await supabase.functions.invoke('telnyx-sms', {
        body: {
          to: '+1234567890',
          message: 'Test message - please ignore',
          userId: 'test',
          test: true
        }
      });
      
      if (!response.error) {
        toast.success('SMS system is responding');
      } else {
        toast.error('SMS system test failed');
      }
    } catch (error) {
      toast.error('Failed to test SMS system');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    change?: number; 
    changeType?: 'positive' | 'negative' 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground">
            {changeType === 'positive' ? (
              <TrendingUp className="inline h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="inline h-4 w-4 text-red-500" />
            )}
            {change.toFixed(1)}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communications Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor email and SMS delivery performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testEmailSystem} variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Test Email
          </Button>
          <Button onClick={testSMSSystem} variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Test SMS
          </Button>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emails">Email Logs</TabsTrigger>
          <TabsTrigger value="sms">SMS Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Statistics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Emails"
              value={stats.totalEmails}
              icon={Mail}
            />
            <StatCard
              title="Email Success Rate"
              value={Math.round(stats.successRate.email)}
              icon={CheckCircle}
            />
            <StatCard
              title="Total SMS"
              value={stats.totalSMS}
              icon={MessageSquare}
            />
            <StatCard
              title="SMS Success Rate"
              value={Math.round(stats.successRate.sms)}
              icon={Activity}
            />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
              <CardDescription>
                Latest email and SMS activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {log.type === 'email' ? (
                        <Mail className="h-4 w-4 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{log.type.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">To: {log.to_address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(log.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Communications</CardTitle>
              <CardDescription>
                All email sending attempts and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLogs
                  .filter(log => log.type === 'email')
                  .map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">To: {log.to_address}</p>
                        <p className="text-xs text-muted-foreground">From: {log.from_address}</p>
                        {log.error_message && (
                          <p className="text-xs text-red-500 mt-1">{log.error_message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Communications</CardTitle>
              <CardDescription>
                All SMS sending attempts and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLogs
                  .filter(log => log.type === 'sms')
                  .map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">To: {log.to_address}</p>
                        <p className="text-xs text-muted-foreground">
                          Content: {log.content.substring(0, 50)}...
                        </p>
                        {log.error_message && (
                          <p className="text-xs text-red-500 mt-1">{log.error_message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Email Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Successful</span>
                    <span className="text-green-600">{stats.successfulEmails}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed</span>
                    <span className="text-red-600">{stats.failedEmails}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="text-yellow-600">{stats.pendingEmails}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Success Rate</span>
                      <span>{stats.successRate.email.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Successful</span>
                    <span className="text-green-600">{stats.successfulSMS}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed</span>
                    <span className="text-red-600">{stats.failedSMS}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="text-yellow-600">{stats.pendingSMS}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Success Rate</span>
                      <span>{stats.successRate.sms.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
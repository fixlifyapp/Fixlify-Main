import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Save, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EmailService } from '@/services/email-service';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export const MailgunSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [domain, setDomain] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Set company email
        setCompanyEmail(data.company_email || '');
        setFromName(data.company_name || '');
        
        // Set Mailgun config
        if (data.mailgun_config) {
          const config = data.mailgun_config as any;
          setApiKey(config.api_key || '');
          setDomain(config.domain || '');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const mailgunConfig = {
        api_key: apiKey,
        domain: domain
      };

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          mailgun_config: mailgunConfig,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Mailgun settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // First save the settings
      await saveSettings();

      // Then test the connection
      const success = await EmailService.testMailgunConnection();
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading settings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Mailgun Email Settings
        </CardTitle>
        <CardDescription>
          Configure your Mailgun account to send automated emails to clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            You need a Mailgun account to send emails. Sign up at{' '}
            <a href="https://mailgun.com" target="_blank" rel="noopener noreferrer" className="underline">
              mailgun.com
            </a>{' '}
            and get your API credentials from the dashboard.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <Label>Auto-Generated Email Address</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your company name, your email will be:
            </p>
            <p className="font-medium text-blue-700 mt-2">
              {companyEmail || 'Set your company name in Company Settings to generate an email'}
            </p>
          </div>

          <div>
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Mailgun API key"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Found in Mailgun Dashboard → Settings → API Security
            </p>
          </div>

          <div>
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="mg.yourdomain.com"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Your verified Mailgun domain
            </p>
          </div>
        </div>

        {testResult && (
          <Alert variant={testResult === 'success' ? 'default' : 'destructive'}>
            <AlertDescription className="flex items-center gap-2">
              {testResult === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Mailgun connection test successful!
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Mailgun connection test failed. Please check your credentials.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button 
            variant="outline" 
            onClick={testConnection} 
            disabled={testing || !apiKey || !domain}
          >
            <TestTube className="w-4 h-4 mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, ExternalLink, TestTube, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const MailgunConfig = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    mailgun_domain: "",
    email_from_name: "Support Team",
    email_from_address: "",
    domain_verification_status: "pending"
  });
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('mailgun_domain, email_from_name, email_from_address, domain_verification_status')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          mailgun_domain: data.mailgun_domain || "",
          email_from_name: data.email_from_name || "Support Team",
          email_from_address: data.email_from_address || "",
          domain_verification_status: data.domain_verification_status || "pending"
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load Mailgun settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          ...settings
        });

      if (error) throw error;
      toast.success('Mailgun settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save Mailgun settings');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDomain = async () => {
    if (!settings.mailgun_domain) {
      toast.error('Please enter a domain first');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-mailgun-domains', {
        body: {
          action: 'verify',
          domain: settings.mailgun_domain
        }
      });

      if (error) throw error;

      if (data?.success) {
        setSettings(prev => ({ ...prev, domain_verification_status: 'verified' }));
        toast.success('Domain verified successfully');
      } else {
        toast.error('Domain verification failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast.error('Failed to verify domain');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Please enter an email address to test');
      return;
    }

    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmailAddress,
          subject: 'Test Email from Fixlyfy',
          text: 'This is a test email to verify your Mailgun configuration is working correctly!',
          html: '<p>This is a test email to verify your <strong>Mailgun configuration</strong> is working correctly!</p>'
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error('Failed to send test email: ' + (data?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Mailgun Email Configuration
        </CardTitle>
        <CardDescription>
          Configure Mailgun for sending emails and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="domain">Mailgun Domain</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="domain"
              value={settings.mailgun_domain}
              onChange={(e) => setSettings(prev => ({ ...prev, mailgun_domain: e.target.value }))}
              placeholder="mg.yourcompany.com"
              disabled={isLoading}
            />
            <Button onClick={verifyDomain} disabled={isLoading} variant="outline">
              Verify
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={settings.domain_verification_status === 'verified' ? 'default' : 'secondary'}>
              {settings.domain_verification_status}
            </Badge>
            {settings.domain_verification_status !== 'verified' && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Domain needs verification</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="fromName">From Name</Label>
          <Input
            id="fromName"
            value={settings.email_from_name}
            onChange={(e) => setSettings(prev => ({ ...prev, email_from_name: e.target.value }))}
            placeholder="Support Team"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="fromEmail">From Email Address</Label>
          <Input
            id="fromEmail"
            value={settings.email_from_address}
            onChange={(e) => setSettings(prev => ({ ...prev, email_from_address: e.target.value }))}
            placeholder="support@yourcompany.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="testEmailInput">Test Email</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="testEmailInput"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="test@example.com"
              disabled={isTesting}
            />
            <Button 
              onClick={sendTestEmail} 
              disabled={isTesting || !testEmailAddress}
              variant="outline"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isTesting ? 'Sending...' : 'Test'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Send a test email to verify your Mailgun configuration
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveSettings} disabled={isLoading}>
            Save Settings
          </Button>
          <Button variant="outline" asChild>
            <a href="https://app.mailgun.com/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Mailgun Dashboard
            </a>
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Setup Instructions:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Create a Mailgun account and add your domain</li>
            <li>Verify your domain by adding DNS records</li>
            <li>Add your Mailgun API key in the secrets section</li>
            <li>Configure the domain and from email above</li>
            <li>Use the test function to verify email functionality</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

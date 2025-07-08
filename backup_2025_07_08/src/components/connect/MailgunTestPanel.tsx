
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, CheckCircle, AlertCircle, Globe, Info, ExternalLink, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { formatCompanyNameForEmail, generateFromEmail } from '@/utils/emailUtils';

export const MailgunTestPanel = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [useSandbox, setUseSandbox] = useState(false);
  const { settings } = useCompanySettings();
  
  const [formData, setFormData] = useState({
    to: '',
    subject: 'Test Email from Fixlify',
    text: 'This is a test email sent via Mailgun integration to verify your email configuration is working properly.',
    html: '<h1>Test Email</h1><p>This is a test email sent via <strong>Mailgun integration</strong> to verify your email configuration is working properly.</p><p>If you received this email, your setup is working correctly!</p>'
  });

  const sendTestEmail = async () => {
    if (!formData.to) {
      toast.error('Please enter a recipient email address');
      return;
    }

    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('MailgunTestPanel - Sending test email with settings:', settings);
      console.log('MailgunTestPanel - company_name:', settings.company_name);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: formData.to,
          subject: formData.subject,
          text: formData.text,
          html: formData.html,
          useSandbox: useSandbox
        }
      });

      if (error) throw error;

      setTestResult(data);
      if (data.success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      setTestResult({ error: error.message, details: error.details });
      toast.error('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const getEmailAddress = () => {
    if (useSandbox) {
      return 'postmaster@sandbox.mailgun.org';
    }
    // Use the current company name from settings
    const companyName = settings.company_name?.trim() || 'Fixlify Services';
    return generateFromEmail(companyName);
  };

  const getFormattedCompanyName = () => {
    const companyName = settings.company_name?.trim() || 'Fixlify Services';
    return formatCompanyNameForEmail(companyName);
  };

  const getCurrentCompanyName = () => {
    return settings.company_name?.trim() || 'Fixlify Services';
  };

  return (
    <div className="space-y-4">
      {/* Email Configuration Status */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 mt-0.5 text-green-600" />
          <div className="flex-1">
            <h4 className="font-medium">Email Configuration Status</h4>
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">
                Domain: <strong>{useSandbox ? 'sandbox.mailgun.org' : 'fixlify.app'}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Your email address: <strong>{getEmailAddress()}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Company name: <strong>{getCurrentCompanyName()}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Formatted for email: <strong>{getFormattedCompanyName()}</strong>
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Auto-Generated
                </Badge>
                {useSandbox && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <TestTube className="h-3 w-3 mr-1" />
                    Sandbox Mode
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Generation Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-800">Automatic Email Generation</h4>
            <p className="text-sm text-blue-700 mt-1 mb-3">
              Your email address is automatically generated from your company name. 
              Update your company name in Company Settings to change your email address.
            </p>
            <div className="text-sm text-blue-700">
              <p><strong>Current setup:</strong></p>
              <p>Company: "{getCurrentCompanyName()}" → Email: "{getEmailAddress()}"</p>
              <p><strong>Examples:</strong></p>
              <p>"Fixlify AI Services" → "fixlify_ai_services@fixlify.app"</p>
              <p>"Bob's Plumbing & HVAC" → "bobs_plumbing_hvac@fixlify.app"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sandbox Testing Option */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <TestTube className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-800">Testing Options</h4>
            <p className="text-sm text-yellow-700 mt-1 mb-3">
              If you're experiencing issues with the main domain, try testing with Mailgun's sandbox first.
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sandbox"
                checked={useSandbox}
                onCheckedChange={(checked) => setUseSandbox(checked === true)}
              />
              <Label htmlFor="sandbox" className="text-sm">
                Use Mailgun sandbox domain for testing
              </Label>
            </div>
            {useSandbox && (
              <p className="text-xs text-yellow-600 mt-2">
                Note: Sandbox emails are not actually delivered but will test API connectivity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Test Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="test-to">To Email *</Label>
          <Input
            id="test-to"
            value={formData.to}
            onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
            placeholder="your-email@example.com"
            type="email"
          />
          <p className="text-xs text-muted-foreground">
            Enter any valid email address to test the system
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-subject">Subject</Label>
          <Input
            id="test-subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Test Subject"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="test-text">Text Content</Label>
        <Textarea
          id="test-text"
          value={formData.text}
          onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
          placeholder="Plain text content..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="test-html">HTML Content</Label>
        <Textarea
          id="test-html"
          value={formData.html}
          onChange={(e) => setFormData(prev => ({ ...prev, html: e.target.value }))}
          placeholder="<h1>HTML content...</h1>"
          rows={3}
        />
      </div>

      <Button onClick={sendTestEmail} disabled={loading || !formData.to} className="w-full">
        <Send className="h-4 w-4 mr-2" />
        {loading ? 'Sending Test Email...' : useSandbox ? 'Send Test Email (Sandbox)' : 'Send Test Email'}
      </Button>

      {/* Test Result Display */}
      {testResult && (
        <div className="mt-4 p-4 rounded-lg border">
          {testResult.error ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error:</span>
              </div>
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {testResult.error}
              </div>
              {testResult.details && (
                <div className="text-sm space-y-2">
                  <div className="font-medium">Debug Details:</div>
                  <div className="bg-gray-100 p-3 rounded text-xs">
                    <div><strong>Status:</strong> {testResult.details.status}</div>
                    <div><strong>Response:</strong> {testResult.details.response}</div>
                    <div><strong>Domain:</strong> {testResult.details.domain}</div>
                    {testResult.details.troubleshooting && (
                      <div><strong>Suggestion:</strong> {testResult.details.troubleshooting}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Email sent successfully!</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Message ID:</span> 
                  <code className="bg-gray-100 px-1 rounded text-xs ml-1">{testResult.messageId}</code>
                </div>
                <div>
                  <span className="font-medium">From:</span> 
                  <code className="bg-gray-100 px-1 rounded text-xs ml-1">{testResult.from}</code>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Domain:</span> 
                  <code className="bg-gray-100 px-1 rounded text-xs ml-1">{testResult.domain}</code>
                  <Badge variant="default" className="ml-2">
                    <Globe className="h-3 w-3 mr-1" />
                    {testResult.usedSandbox ? 'Sandbox' : 'Verified Domain'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>
                </div>
                {testResult.companyName && (
                  <div>
                    <span className="font-medium">Company:</span>
                    <code className="bg-gray-100 px-1 rounded text-xs ml-1">{testResult.companyName}</code>
                  </div>
                )}
              </div>
              {testResult.usedSandbox && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> This was sent using sandbox mode. The email was not actually delivered but confirms your API key is working.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Help Links */}
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" asChild>
          <a href="https://app.mailgun.com/mg/domains" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 mr-1" />
            Mailgun Dashboard
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="https://documentation.mailgun.com/en/latest/api-intro.html" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 mr-1" />
            API Documentation
          </a>
        </Button>
      </div>
    </div>
  );
};

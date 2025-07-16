
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Mail, Globe, Copy, Info, ExternalLink, Loader2 } from 'lucide-react';
import { useCompanyEmailSettings } from '@/hooks/useCompanyEmailSettings';
import { MailgunTestPanel } from '@/components/connect/MailgunTestPanel';
import { toast } from 'sonner';

export const CompanyEmailSettings = () => {
  const { settings, loading, saving, addDomain, verifyDomain, updateEmailSettings } = useCompanyEmailSettings();
  const [newDomain, setNewDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState<any[]>([]);
  const [verifying, setVerifying] = useState(false);

  const handleAddDomain = async () => {
    if (!newDomain) {
      toast.error('Please enter a company name');
      return;
    }

    // Validate company name (letters, numbers, hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(newDomain)) {
      toast.error('Company name can only contain letters, numbers, and hyphens');
      return;
    }

    try {
      const result = await addDomain(newDomain);
      if (result.dns_records) {
        setDnsRecords(result.dns_records);
      }
      setNewDomain('');
      toast.success(`Domain ${newDomain}@fixlyfy.app has been added to Mailgun!`);
    } catch (error) {
      console.error('Error adding domain:', error);
    }
  };

  const handleVerifyDomain = async () => {
    if (!settings.custom_domain) return;

    setVerifying(true);
    try {
      const result = await verifyDomain(settings.custom_domain);
      if (result.verified) {
        toast.success('Domain verified successfully!');
      } else {
        toast.error('Domain verification failed. Please check your DNS records.');
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle size={14} className="mr-1" />Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle size={14} className="mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle size={14} className="mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading email settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Configuration
        </h3>
        <p className="text-muted-foreground">
          Configure your company email domain to send professional emails from your own domain using Mailgun
        </p>
      </div>

      {/* Domain Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Email Domain Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!settings.custom_domain ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Professional Email Setup</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Set up your company email to send from <strong>yourcompany@fixlyfy.app</strong>
                    </p>
                    <p className="text-sm text-blue-700">
                      This will create a real Mailgun domain that you can verify and use for production emails.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Company Name</Label>
                <div className="flex gap-2">
                  <div className="flex-1 flex">
                    <Input
                      id="domain"
                      placeholder="yourcompany"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-100 border border-l-0 px-3 py-2 rounded-r-md text-sm text-gray-600 flex items-center">
                      @fixlyfy.app
                    </div>
                  </div>
                  <Button onClick={handleAddDomain} disabled={saving || !newDomain}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      'Add Domain'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your company name (letters, numbers, and hyphens only)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-lg">{settings.custom_domain}@fixlyfy.app</div>
                  <div className="text-sm text-muted-foreground">
                    Mailgun Domain: {settings.mailgun_domain}
                  </div>
                </div>
                {getStatusBadge(settings.domain_verification_status)}
              </div>

              {settings.domain_verification_status !== 'verified' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Domain Verification Required</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Your domain has been added to Mailgun but needs DNS verification.
                        </p>
                        <p className="text-sm text-amber-700">
                          Please configure the DNS records below, then click verify.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DNS Records Display */}
                  {dnsRecords.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">DNS Records to Configure:</h4>
                      <div className="space-y-2">
                        {dnsRecords.map((record, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Type:</span> {record.record_type}
                              </div>
                              <div className="md:col-span-2">
                                <span className="font-medium">Name:</span> {record.name}
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(record.value)}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy Value
                                </Button>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-600 break-all">
                              <span className="font-medium">Value:</span> {record.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button onClick={handleVerifyDomain} disabled={verifying}>
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Domain'
                      )}
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="https://app.mailgun.com/mg/domains" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Mailgun Dashboard
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {settings.domain_verification_status === 'verified' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Domain verified successfully!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    You can now send emails from your custom domain to any email address.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                value={settings.email_from_name || ''}
                onChange={(e) => updateEmailSettings({ email_from_name: e.target.value })}
                placeholder="Support Team"
              />
            </div>
            
            {settings.domain_verification_status === 'verified' && (
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  value={settings.email_from_address || ''}
                  onChange={(e) => updateEmailSettings({ email_from_address: e.target.value })}
                  placeholder={`noreply@${settings.mailgun_domain}`}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Test Email Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <MailgunTestPanel />
        </CardContent>
      </Card>
    </div>
  );
};

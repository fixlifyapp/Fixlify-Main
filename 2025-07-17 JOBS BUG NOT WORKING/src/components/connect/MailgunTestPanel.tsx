
import React from 'react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MailgunTestPanel: React.FC = () => {
  const { companySettings, isLoading, updateCompanySettings } = useCompanySettings();

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle save logic here
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Mailgun Configuration</h3>
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div>
          <Label htmlFor="mailgun_api_key">API Key</Label>
          <Input
            id="mailgun_api_key"
            type="password"
            value={companySettings?.mailgun_api_key || ''}
            placeholder="Enter Mailgun API key"
          />
        </div>
        <div>
          <Label htmlFor="mailgun_domain">Domain</Label>
          <Input
            id="mailgun_domain"
            value={companySettings?.mailgun_domain || ''}
            placeholder="Enter Mailgun domain"
          />
        </div>
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  );
};

export default MailgunTestPanel;

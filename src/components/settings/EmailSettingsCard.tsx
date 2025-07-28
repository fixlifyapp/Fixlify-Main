import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Mail, Settings, Check } from 'lucide-react';
import { toast } from 'sonner';
import { generatePersonalizedEmail } from '@/services/emailDomainService';

interface EmailSettingsCardProps {
  companyName: string;
  userName?: string;
  onSave?: (settings: EmailSettings) => void;
}

interface EmailSettings {
  default_from_email: string;
  default_from_name: string;
  email_enabled: boolean;
  custom_domain?: string;
}

export function EmailSettingsCard({ companyName, userName, onSave }: EmailSettingsCardProps) {
  const [settings, setSettings] = useState<EmailSettings>({
    default_from_email: generatePersonalizedEmail(companyName, userName),
    default_from_name: companyName,
    email_enabled: true,
    custom_domain: 'fixlify.app'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [previewEmail, setPreviewEmail] = useState('');

  const handleGenerateEmail = () => {
    const newEmail = generatePersonalizedEmail(companyName, userName);
    setSettings(prev => ({ ...prev, default_from_email: newEmail }));
    setPreviewEmail(newEmail);
    toast.success('Email address generated!');
  };

  const handleCustomEmailChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9@.]/g, '');
    setSettings(prev => ({ ...prev, default_from_email: cleanValue }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settings.default_from_email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Call parent save function
      if (onSave) {
        await onSave(settings);
      }
      
      toast.success('Email settings saved successfully!');
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Failed to save email settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>Email Settings</CardTitle>
        </div>
        <CardDescription>
          Configure how your emails appear to clients. Your personalized email address helps build trust and brand recognition.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Email Generation Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-primary">Automatic Email Generation</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Based on your company name, your email will be:
          </p>
          <div className="bg-background p-3 rounded border">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">
                {generatePersonalizedEmail(companyName, userName)}
              </span>
              <Check className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateEmail}
            className="mt-3"
          >
            Use Generated Email
          </Button>
        </div>

        {/* Email Settings Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from-email">From Email Address</Label>
            <Input
              id="from-email"
              type="email"
              value={settings.default_from_email}
              onChange={(e) => handleCustomEmailChange(e.target.value)}
              placeholder="your-name@fixlify.app"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              This is the email address your clients will see when receiving estimates and invoices.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="from-name">From Name</Label>
            <Input
              id="from-name"
              value={settings.default_from_name}
              onChange={(e) => setSettings(prev => ({ ...prev, default_from_name: e.target.value }))}
              placeholder="Your Company Name"
            />
            <p className="text-xs text-muted-foreground">
              This is the name that will appear alongside your email address.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled">Enable Email Sending</Label>
              <p className="text-xs text-muted-foreground">
                Allow the system to send emails for estimates and invoices.
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={settings.email_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_enabled: checked }))}
            />
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-muted/50 p-4 rounded-lg border">
          <h4 className="font-medium mb-2">Email Preview</h4>
          <div className="text-sm">
            <p><strong>From:</strong> {settings.default_from_name} &lt;{settings.default_from_email}&gt;</p>
            <p><strong>Subject:</strong> Invoice #12345 from {settings.default_from_name}</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Email Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
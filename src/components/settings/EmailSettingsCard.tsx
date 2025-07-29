import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail } from "lucide-react";
import { useState } from "react";

interface EmailSettings {
  email_enabled: boolean;
  default_from_email: string;
  default_from_name: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  mailgun_domain?: string;
}

interface EmailSettingsCardProps {
  settings: EmailSettings;
  onUpdate: (settings: EmailSettings) => void;
}

export const EmailSettingsCard = ({ settings, onUpdate }: EmailSettingsCardProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdate(localSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-enabled">Enable Email</Label>
          <Switch
            id="email-enabled"
            checked={localSettings.email_enabled}
            onCheckedChange={(checked) =>
              setLocalSettings({ ...localSettings, email_enabled: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="from-email">Default From Email</Label>
          <Input
            id="from-email"
            value={localSettings.default_from_email}
            onChange={(e) =>
              setLocalSettings({ ...localSettings, default_from_email: e.target.value })
            }
            placeholder="noreply@yourcompany.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="from-name">Default From Name</Label>
          <Input
            id="from-name"
            value={localSettings.default_from_name}
            onChange={(e) =>
              setLocalSettings({ ...localSettings, default_from_name: e.target.value })
            }
            placeholder="Your Company"
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Email Settings
        </Button>
      </CardContent>
    </Card>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  default_from_email: string;
  default_from_name: string;
  email_enabled: boolean;
  sms_enabled: boolean;
}

interface EmailSettingsCardProps {
  settings: EmailSettings;
  onUpdate: (settings: EmailSettings) => void;
}

export const EmailSettingsCard: React.FC<EmailSettingsCardProps> = ({ settings, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Email configuration panel</p>
      </CardContent>
    </Card>
  );
};
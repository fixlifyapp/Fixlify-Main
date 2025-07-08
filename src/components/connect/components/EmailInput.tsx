
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanySettings } from '@/hooks/useCompanySettings';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  label = "Email",
  placeholder = "Enter email address"
}) => {
  const { companySettings } = useCompanySettings();

  return (
    <div className="space-y-2">
      <Label htmlFor="email-input">{label}</Label>
      <Input
        id="email-input"
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {companySettings?.email_from_address && (
        <p className="text-sm text-gray-500">
          From: {companySettings.email_from_address}
        </p>
      )}
    </div>
  );
};

export default EmailInput;

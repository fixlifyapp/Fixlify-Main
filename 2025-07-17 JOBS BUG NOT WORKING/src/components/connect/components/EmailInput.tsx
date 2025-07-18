
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

export const EmailInput = ({ recipientEmail = "", onSent }: EmailInputProps) => {
  const { companySettings, isLoading } = useCompanySettings();
  const [to, setTo] = useState(recipientEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = () => { console.log("Email functionality not implemented"); }

    try {
      setIsSending(true);
      
      const { data, error } = await supabase.functions.invoke('mailgun-email', {
        body: {
          to: to.trim(),
          subject: subject.trim(),
          html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
          text: message.trim(),
          userId: (await supabase.auth.getUser()).data.user?.id,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Email sent successfully!");
        setTo("");
        setSubject("");
        setMessage("");
        onSent?.();
      } else {
        throw new Error(data?.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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


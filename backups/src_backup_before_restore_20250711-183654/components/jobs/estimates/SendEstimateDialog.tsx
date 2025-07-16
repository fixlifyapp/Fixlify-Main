import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Phone, Mail, Loader2 } from "lucide-react";
import { Estimate } from "@/hooks/useEstimates";

interface SendEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate;
  clientEmail?: string;
  clientPhone?: string;
  onSendEmail: () => Promise<void>;
  onSendSMS: (phoneNumber: string) => Promise<void>;
}

export const SendEstimateDialog = ({
  open,
  onOpenChange,
  estimate,
  clientEmail,
  clientPhone,
  onSendEmail,
  onSendSMS,
}: SendEstimateDialogProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [phoneNumber, setPhoneNumber] = useState(clientPhone || "");
  const [message, setMessage] = useState(
    `Hi! Your estimate ${estimate.estimate_number} is ready. Total: $${estimate.total.toFixed(2)}`
  );
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      if (sendMethod === "email") {
        await onSendEmail();
      } else {
        await onSendSMS(phoneNumber);
      }
      onOpenChange(false);
    } finally {
      setIsSending(false);
    }
  };

  const canSend = sendMethod === "email" ? !!clientEmail : !!phoneNumber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Estimate</DialogTitle>
          <DialogDescription>
            Choose how to send estimate {estimate.estimate_number} to your client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={sendMethod} onValueChange={(v) => setSendMethod(v as "email" | "sms")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" disabled={!clientEmail} />
              <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                <Mail className="h-4 w-4" />
                Email {clientEmail ? `(${clientEmail})` : "(No email on file)"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sms" id="sms" />
              <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                <Phone className="h-4 w-4" />
                SMS
              </Label>
            </div>
          </RadioGroup>

          {sendMethod === "sms" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <div className="space-y-2">
                <Label htmlFor="message">Message (160 characters)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 160))}
                  placeholder="Enter SMS message..."
                  rows={3}
                  maxLength={160}
                />
                <p className="text-sm text-muted-foreground text-right">
                  {message.length}/160 characters
                </p>
              </div>
            </div>
          )}

          {sendMethod === "email" && !clientEmail && (
            <p className="text-sm text-red-500">
              No email address found for this client. Please update client information first.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!canSend || isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send {sendMethod === "email" ? "Email" : "SMS"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

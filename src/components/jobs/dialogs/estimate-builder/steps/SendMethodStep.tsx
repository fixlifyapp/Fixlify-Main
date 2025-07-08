
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, MessageSquare, ArrowLeft } from "lucide-react";

interface SendMethodStepProps {
  sendMethod: "email" | "sms";
  setSendMethod: (method: "email" | "sms") => void;
  sendTo: string;
  setSendTo: (value: string) => void;
  validationError: string;
  setValidationError: (error: string) => void;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  hasValidEmail: boolean;
  hasValidPhone: boolean;
  estimateNumber: string;
  isProcessing: boolean;
  onSend: () => void;
  onBack: () => void;
}

export const SendMethodStep = ({
  sendMethod,
  setSendMethod,
  sendTo,
  setSendTo,
  validationError,
  setValidationError,
  contactInfo,
  hasValidEmail,
  hasValidPhone,
  estimateNumber,
  isProcessing,
  onSend,
  onBack
}: SendMethodStepProps) => {
  const handleSendMethodChange = (value: "email" | "sms") => {
    setSendMethod(value);
    setValidationError("");
    
    if (value === "email" && hasValidEmail) {
      setSendTo(contactInfo.email);
    } else if (value === "sms" && hasValidPhone) {
      setSendTo(contactInfo.phone);
    } else {
      setSendTo("");
    }
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="text-sm text-muted-foreground mb-4">
        Send estimate {estimateNumber} to {contactInfo.name}:
      </div>
      
      <div className="space-y-3">
        <Label className="text-sm font-medium">Choose sending method:</Label>
        
        <RadioGroup 
          value={sendMethod} 
          onValueChange={handleSendMethodChange}
          className="space-y-3"
        >
          <div className={`flex items-start space-x-3 border rounded-lg p-3 transition-colors hover:bg-muted/50 cursor-pointer ${
            sendMethod === "email" ? "border-primary bg-primary/5" : "border-input"
          } ${!hasValidEmail ? "opacity-60" : ""}`}>
            <RadioGroupItem 
              value="email" 
              id="email" 
              className="mt-1 flex-shrink-0" 
              disabled={!hasValidEmail} 
            />
            <div className="flex-1 min-w-0">
              <Label htmlFor="email" className="flex items-center gap-2 font-medium cursor-pointer text-sm">
                <Mail size={16} className="flex-shrink-0" />
                Send via Email
              </Label>
              {hasValidEmail ? (
                <p className="text-xs text-muted-foreground mt-1 break-all">{contactInfo.email}</p>
              ) : (
                <p className="text-xs text-amber-600 mt-1">No valid email available for this client</p>
              )}
              <p className="text-xs text-blue-600 mt-1">Includes secure portal access link</p>
            </div>
          </div>
          
          <div className={`flex items-start space-x-3 border rounded-lg p-3 transition-colors hover:bg-muted/50 cursor-pointer ${
            sendMethod === "sms" ? "border-primary bg-primary/5" : "border-input"
          } ${!hasValidPhone ? "opacity-60" : ""}`}>
            <RadioGroupItem 
              value="sms" 
              id="sms" 
              className="mt-1 flex-shrink-0" 
              disabled={!hasValidPhone} 
            />
            <div className="flex-1 min-w-0">
              <Label htmlFor="sms" className="flex items-center gap-2 font-medium cursor-pointer text-sm">
                <MessageSquare size={16} className="flex-shrink-0" />
                Send via Text Message
              </Label>
              {hasValidPhone ? (
                <p className="text-xs text-muted-foreground mt-1">{contactInfo.phone}</p>
              ) : (
                <p className="text-xs text-amber-600 mt-1">No valid phone number available for this client</p>
              )}
              <p className="text-xs text-blue-600 mt-1">Includes secure portal access link</p>
            </div>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="send-to" className="text-sm font-medium">
          {sendMethod === "email" ? "Email Address" : "Phone Number"}
        </Label>
        <Input
          id="send-to"
          value={sendTo}
          onChange={(e) => {
            setSendTo(e.target.value);
            setValidationError("");
          }}
          placeholder={sendMethod === "email" ? "client@example.com" : "+1234567890 or (555) 123-4567"}
          className={`${validationError ? "border-red-500" : ""} text-sm`}
        />
        {validationError && (
          <p className="text-xs text-red-600 mt-1">{validationError}</p>
        )}
        {sendMethod === "sms" && (
          <p className="text-xs text-muted-foreground mt-1">
            Phone numbers will be automatically formatted for Telnyx delivery
          </p>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2 text-sm"
          disabled={isProcessing}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <Button 
          onClick={onSend} 
          disabled={!sendTo || isProcessing || !!validationError}
          className="flex-1 text-sm"
        >
          {isProcessing ? "Sending..." : "Send Estimate"}
        </Button>
      </div>
    </div>
  );
};

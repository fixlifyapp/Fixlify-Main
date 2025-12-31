
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, ArrowLeft } from "lucide-react";

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
  /** Document type for dynamic button text. Defaults to "estimate" for backwards compatibility */
  documentType?: "estimate" | "invoice";
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
  onBack,
  documentType = "estimate"
}: SendMethodStepProps) => {
  const documentLabel = documentType === "invoice" ? "Invoice" : "Estimate";
  const handleSendMethodChange = (value: "email" | "sms") => {
    setSendMethod(value);
    setValidationError("");
    
    if (value === "email" && hasValidEmail) {
      setSendTo(contactInfo.email);
    } else {
      setSendTo("");
    }
  };

  return (
    <div className="space-y-4 max-w-full">
      <div className="text-sm text-muted-foreground mb-4">
        Send {documentLabel.toLowerCase()} {estimateNumber} to {contactInfo.name}:
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
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="send-to" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="send-to"
          value={sendTo}
          onChange={(e) => {
            setSendTo(e.target.value);
            setValidationError("");
          }}
          placeholder="client@example.com"
          className={`${validationError ? "border-red-500" : ""} text-sm`}
        />
        {validationError && (
          <p className="text-xs text-red-600 mt-1">{validationError}</p>
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
          {isProcessing ? "Sending..." : `Send ${documentLabel}`}
        </Button>
      </div>
    </div>
  );
};


import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SendFormProps {
  sendMethod: "email" | "sms";
  sendTo: string;
  onSendToChange: (value: string) => void;
  customNote: string;
  onCustomNoteChange: (value: string) => void;
}

export const SendForm = ({
  sendMethod,
  sendTo,
  onSendToChange,
  customNote,
  onCustomNoteChange
}: SendFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sendTo">
          {sendMethod === "email" ? "Email Address" : "Phone Number"}
        </Label>
        <Input
          id="sendTo"
          type={sendMethod === "email" ? "email" : "tel"}
          placeholder={sendMethod === "email" ? "Enter email address" : "Enter phone number"}
          value={sendTo}
          onChange={(e) => onSendToChange(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="customNote">Custom Message (Optional)</Label>
        <Textarea
          id="customNote"
          placeholder="Add a custom message..."
          value={customNote}
          onChange={(e) => onCustomNoteChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

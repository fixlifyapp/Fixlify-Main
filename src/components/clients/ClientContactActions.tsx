
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Mail } from "lucide-react";
import { useState } from "react";
import { ConnectMessageDialog } from "@/components/connect/components/ConnectMessageDialog";

interface CallButtonProps {
  phoneNumber?: string;
  clientName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

const CallButton = ({ phoneNumber, clientName, variant = "outline", size = "sm", showText = true }: CallButtonProps) => {
  const handleCall = () => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCall}
      disabled={!phoneNumber}
      className="gap-2"
    >
      <Phone className="h-4 w-4" />
      {showText && "Call"}
    </Button>
  );
};

interface ClientContactActionsProps {
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  variant?: "default" | "compact";
}

export const ClientContactActions = ({ client, variant = "default" }: ClientContactActionsProps) => {
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  if (variant === "compact") {
    return (
      <>
        <div className="flex items-center gap-1">
          <CallButton
            phoneNumber={client.phone}
            clientName={client.name}
            variant="ghost"
            size="icon"
            showText={false}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMessageDialog(true)}
            disabled={!client.phone && !client.email}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        <ConnectMessageDialog
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
          client={client}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {client.phone && (
          <CallButton
            phoneNumber={client.phone}
            clientName={client.name}
            variant="outline"
            size="sm"
          />
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMessageDialog(true)}
          disabled={!client.phone && !client.email}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Message
        </Button>

        {client.email && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`mailto:${client.email}`, '_blank')}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        )}
      </div>

      <ConnectMessageDialog
        isOpen={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        client={client}
      />
    </>
  );
};

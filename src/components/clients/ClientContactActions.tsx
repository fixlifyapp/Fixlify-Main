import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CallButton } from "@/components/calling/CallButton";

interface ClientContactActionsProps {
  // Support both prop patterns
  client?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  // Legacy props
  clientId?: string;
  clientName?: string;
  phone?: string;
  email?: string;
  address?: string;
  compact?: boolean;
  size?: "sm" | "default";
}

export const ClientContactActions = ({ 
  client, 
  clientId,
  clientName,
  phone,
  email,
  address,
  compact = false,
  size = "default"
}: ClientContactActionsProps) => {
  const navigate = useNavigate();

  // Handle both prop patterns
  const clientData = client || {
    id: clientId || '',
    name: clientName || '',
    phone,
    email,
    address
  };

  if (!clientData.id) {
    return null;
  }

  const handleEmail = () => {
    if (!clientData.email) {
      toast.error('No email address available');
      return;
    }
    
    // Navigate to Connect Center with email tab and auto-open composer
    navigate(`/connect?tab=emails&clientId=${clientData.id}&clientName=${encodeURIComponent(clientData.name)}&clientEmail=${encodeURIComponent(clientData.email)}&autoOpen=true`);
  };

  const handleMessage = () => {
    if (!clientData.phone) {
      toast.error('No phone number available for messaging');
      return;
    }
    
    // Navigate to Connect Center with SMS tab and auto-open message dialog
    navigate(`/connect?tab=sms&clientId=${clientData.id}&clientName=${encodeURIComponent(clientData.name)}&clientPhone=${encodeURIComponent(clientData.phone)}&autoOpen=true`);
  };

  const handleDirections = () => {
    if (clientData.address) {
      const encodedAddress = encodeURIComponent(clientData.address);
      window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
      toast.success('Opening directions');
    } else {
      toast.error('No address available');
    }
  };

  const buttonSize = size === "sm" ? "sm" : "default";

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <CallButton
          phoneNumber={clientData.phone}
          clientId={clientData.id}
          clientName={clientData.name}
          variant="ghost"
          size="icon"
          showText={false}
        />
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={handleMessage}
          disabled={!clientData.phone}
          className="h-8 w-8 p-0"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={handleEmail}
          disabled={!clientData.email}
          className="h-8 w-8 p-0"
        >
          <Mail className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={handleDirections}
          disabled={!clientData.address}
          className="h-8 w-8 p-0"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
      <CallButton
        phoneNumber={clientData.phone}
        clientId={clientData.id}
        clientName={clientData.name}
        variant="outline"
        size={buttonSize}
      />
      <Button
        variant="outline"
        size={buttonSize}
        onClick={handleMessage}
        disabled={!clientData.phone}
        className="flex items-center justify-center gap-2 min-h-[40px] text-xs sm:text-sm"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Message</span>
      </Button>
      <Button
        variant="outline"
        size={buttonSize}
        onClick={handleEmail}
        disabled={!clientData.email}
        className="flex items-center justify-center gap-2 min-h-[40px] text-xs sm:text-sm"
      >
        <Mail className="h-4 w-4" />
        <span>Email</span>
      </Button>
      <Button
        variant="outline"
        size={buttonSize}
        onClick={handleDirections}
        disabled={!clientData.address}
        className="flex items-center justify-center gap-2 min-h-[40px] text-xs sm:text-sm"
      >
        <MapPin className="h-4 w-4" />
        <span className="hidden sm:inline">Directions</span>
        <span className="sm:hidden">Maps</span>
      </Button>
    </div>
  );
};

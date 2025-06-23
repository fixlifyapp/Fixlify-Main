import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CallButton } from "@/components/calling/CallButton";

interface ClientContactActionsProps {
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  compact?: boolean;
}

export const ClientContactActions = ({ client, compact = false }: ClientContactActionsProps) => {
  const navigate = useNavigate();

  const handleEmail = () => {
    if (!client.email) {
      toast.error('No email address available');
      return;
    }
    
    // Navigate to Connect Center with email tab and auto-open composer
    navigate(`/connect?tab=emails&clientId=${client.id}&clientName=${encodeURIComponent(client.name)}&clientEmail=${encodeURIComponent(client.email)}&autoOpen=true`);
  };

  const handleMessage = () => {
    if (!client.phone) {
      toast.error('No phone number available for messaging');
      return;
    }
    
    // Navigate to Connect Center with messages tab and auto-open message dialog
    navigate(`/connect?tab=messages&clientId=${client.id}&clientName=${encodeURIComponent(client.name)}&clientPhone=${encodeURIComponent(client.phone)}&autoOpen=true`);
  };

  const handleDirections = () => {
    if (client.address) {
      const encodedAddress = encodeURIComponent(client.address);
      window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
      toast.success('Opening directions');
    } else {
      toast.error('No address available');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <CallButton
          phoneNumber={client.phone}
          clientId={client.id}
          clientName={client.name}
          variant="ghost"
          size="icon"
          showText={false}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMessage}
          disabled={!client.phone}
          className="h-8 w-8 p-0"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEmail}
          disabled={!client.email}
          className="h-8 w-8 p-0"
        >
          <Mail className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDirections}
          disabled={!client.address}
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
        phoneNumber={client.phone}
        clientId={client.id}
        clientName={client.name}
        variant="outline"
        size="sm"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleMessage}
        disabled={!client.phone}
        className="flex items-center justify-center gap-2 min-h-[40px] text-xs sm:text-sm"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Message</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleEmail}
        disabled={!client.email}
        className="flex items-center justify-center gap-2 min-h-[40px] text-xs sm:text-sm"
      >
        <Mail className="h-4 w-4" />
        <span>Email</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDirections}
        disabled={!client.address}
        className="flex items-center justify-center gap-2 min-h-[40px] text-xs sm:text-sm"
      >
        <MapPin className="h-4 w-4" />
        <span className="hidden sm:inline">Directions</span>
        <span className="sm:hidden">Maps</span>
      </Button>
    </div>
  );
};

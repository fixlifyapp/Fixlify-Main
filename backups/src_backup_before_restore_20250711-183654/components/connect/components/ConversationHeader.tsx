
import { Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  name: string;
  phone?: string;
}

interface ConversationHeaderProps {
  client: Client;
  onCallClick: () => void;
}

export const ConversationHeader = ({ client, onCallClick }: ConversationHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-white to-fixlyfy-bg-interface border-b border-fixlyfy-border/50 p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-2 ring-fixlyfy/10">
          <AvatarFallback className="bg-gradient-to-br from-fixlyfy to-fixlyfy-light text-white font-semibold">
            {client.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-fixlyfy-text">{client.name}</h3>
          <div className="flex items-center gap-4 text-sm text-fixlyfy-text-secondary">
            {client.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-fixlyfy" />
                <span>{client.phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {client.phone && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-fixlyfy/30 text-fixlyfy hover:bg-gradient-to-r hover:from-fixlyfy hover:to-fixlyfy-light hover:text-white transition-all duration-200 shadow-sm"
              onClick={onCallClick}
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

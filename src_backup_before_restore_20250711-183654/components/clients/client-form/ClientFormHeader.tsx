
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ClientFormHeaderProps {
  client: any;
  isSaving: boolean;
  onCreateJob: () => void;
  onCreateInvoice: () => void;
  onSaveChanges: () => void;
}

export const ClientFormHeader = ({ 
  client, 
  isSaving, 
  onCreateJob, 
  onCreateInvoice, 
  onSaveChanges 
}: ClientFormHeaderProps) => {
  if (!client) return null;
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="" alt={client.name} />
          <AvatarFallback className="bg-fixlyfy/10 text-fixlyfy">
            {client.name && client.name.split(' ').map((n: string) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{client.name}</h2>
            <Badge className={
              client.status === "active" 
                ? "bg-fixlyfy-success/10 text-fixlyfy-success" 
                : "bg-fixlyfy-text-secondary/10 text-fixlyfy-text-secondary"
            }>
              {client.status || "Unknown"}
            </Badge>
          </div>
          <p className="text-fixlyfy-text-secondary">
            ID: {client.id || 'Unknown'} · {client.type || "Unknown type"}
          </p>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ModernCard } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Edit,
  User,
  Building,
  Calendar,
  ExternalLink,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { Client } from "@/types/client";

interface ClientsListProps {
  clients: Client[];
  isGridView?: boolean;
  selectedClients: string[];
  onSelectClient: (clientId: string, isSelected: boolean) => void;
  onSelectAllClients: (isSelected: boolean) => void;
  onRefresh?: () => void;
}

export function ClientsList({ 
  clients, 
  isGridView = false, 
  selectedClients = [], 
  onSelectClient, 
  onSelectAllClients,
  onRefresh
}: ClientsListProps) {
  const navigate = useNavigate();

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleEditClient = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    navigate(`/clients/${clientId}`);
  };

  const areAllClientsSelected = clients.length > 0 && clients.every(client => selectedClients.includes(client.id));

  const getClientTypeStyle = (type: string) => {
    const typeStyles: Record<string, any> = {
      "residential": { backgroundColor: "#10b98120", color: "#10b981", borderColor: "#10b981" },
      "commercial": { backgroundColor: "#3b82f620", color: "#3b82f6", borderColor: "#3b82f6" },
      "property_manager": { backgroundColor: "#8b5cf620", color: "#8b5cf6", borderColor: "#8b5cf6" }
    };
    
    return typeStyles[type?.toLowerCase()] || { backgroundColor: "#6b728020", color: "#6b7280", borderColor: "#6b7280" };
  };

  const getClientStatusStyle = (status: string) => {
    const statusStyles: Record<string, any> = {
      "active": { backgroundColor: "#10b98120", color: "#10b981", borderColor: "#10b981" },
      "inactive": { backgroundColor: "#6b728020", color: "#6b7280", borderColor: "#6b7280" },
      "lead": { backgroundColor: "#f59e0b20", color: "#f59e0b", borderColor: "#f59e0b" }
    };
    
    return statusStyles[status?.toLowerCase()] || { backgroundColor: "#10b98120", color: "#10b981", borderColor: "#10b981" };
  };

  if (clients.length === 0) {
    return (
      <ModernCard variant="elevated" className="p-12 text-center">
        <div className="text-muted-foreground">
          <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No clients found</h3>
          <p>No clients match your current filters.</p>
          {onRefresh && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onRefresh}
            >
              Refresh Clients
            </Button>
          )}
        </div>
      </ModernCard>
    );
  }

  if (isGridView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={areAllClientsSelected}
              onCheckedChange={onSelectAllClients}
            />
            <span className="text-sm text-muted-foreground">
              Select all ({clients.length})
            </span>
          </div>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const typeStyle = getClientTypeStyle(client.type || 'residential');
            const statusStyle = getClientStatusStyle(client.status || 'active');
            
            return (
              <div key={client.id} className="cursor-pointer" onClick={() => handleClientClick(client.id)}>
                <ModernCard 
                  variant="elevated" 
                  className="hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={(checked) => onSelectClient(client.id, !!checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="font-mono text-sm font-medium text-fixlyfy">{client.id}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditClient(e, client.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{client.name}</h3>
                      {client.company && (
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {client.company}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className="flex items-center gap-1"
                        style={statusStyle}
                      >
                        {client.status || 'active'}
                      </Badge>
                      
                      <Badge 
                        variant="outline"
                        style={typeStyle}
                      >
                        {client.type || 'residential'}
                      </Badge>
                    </div>
                    
                    {client.address && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {client.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                    </div>
                    
                    {client.created_at && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        Created {format(new Date(client.created_at), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                </ModernCard>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // List view (table format)
  return (
    <ModernCard variant="elevated">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 w-12">
                <Checkbox 
                  checked={areAllClientsSelected}
                  onCheckedChange={onSelectAllClients}
                />
              </th>
              <th className="text-left p-4 font-semibold">Client ID</th>
              <th className="text-left p-4 font-semibold">Name</th>
              <th className="text-left p-4 font-semibold">Contact</th>
              <th className="text-left p-4 font-semibold">Address</th>
              <th className="text-left p-4 font-semibold">Type</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-right p-4 w-32">
                Actions
                {onRefresh && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onRefresh}
                    className="ml-2"
                  >
                    Refresh
                  </Button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const typeStyle = getClientTypeStyle(client.type || 'residential');
              const statusStyle = getClientStatusStyle(client.status || 'active');
              
              return (
                <tr 
                  key={client.id} 
                  className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleClientClick(client.id)}
                >
                  <td className="p-4">
                    <Checkbox 
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={(checked) => onSelectClient(client.id, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm font-medium text-fixlyfy">{client.id}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{client.name}</div>
                      {client.company && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {client.company}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {client.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-2" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-2" />
                          <span className="truncate max-w-[200px]">{client.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {client.address ? (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate max-w-[200px]">{client.address}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={typeStyle}
                    >
                      {client.type || 'residential'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={statusStyle}
                    >
                      {client.status || 'active'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditClient(e, client.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ModernCard>
  );
}

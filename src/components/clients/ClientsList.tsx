import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit, 
  MapPin, 
  Calendar,
  Building,
  User,
  Trash2,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  MoreVertical,
  ExternalLink,
  Link,
  MessageSquare
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { ClientContactActions } from "./ClientContactActions";
import { ClientSegmentBadge } from "./ClientSegmentBadge";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { useClientStats } from "@/hooks/useClientStats";
import { formatCurrency } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/jobs/dialogs/DeleteConfirmDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePortalLink } from "@/hooks/usePortalLink";
import { format } from "date-fns";

interface ClientsListProps {
  isGridView?: boolean;
  clients?: any[];
  isLoading?: boolean;
  selectedClients?: string[];
  onSelectClient?: (clientId: string, isSelected: boolean) => void;
  onSelectAllClients?: (isSelected: boolean) => void;
  onRefresh?: () => void;
}

interface ClientWithStats {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  company?: string;
  type?: string;
  status?: string;
  created_at?: string;
  segment?: string;
  tags?: string[];
}

// Helper function for status badge styling
const getStatusBadgeStyle = (status: string) => {
  const statusStyles: Record<string, any> = {
    "active": { backgroundColor: "#10b98120", color: "#10b981", borderColor: "#10b981" },
    "inactive": { backgroundColor: "#6b728020", color: "#6b7280", borderColor: "#6b7280" }, 
    "lead": { backgroundColor: "#3b82f620", color: "#3b82f6", borderColor: "#3b82f6" },
    "prospect": { backgroundColor: "#f59e0b20", color: "#f59e0b", borderColor: "#f59e0b" }
  };
  
  return statusStyles[status?.toLowerCase()] || statusStyles["active"];
};

export const ClientsList = ({ 
  isGridView = false, 
  clients = [], 
  isLoading = false,
  selectedClients = [],
  onSelectClient,
  onSelectAllClients,
  onRefresh 
}: ClientsListProps) => {
  const navigate = useNavigate();
  const { deleteClient } = useClients();
  const { copyPortalLink, isGenerating } = usePortalLink();
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientWithStats | null>(null);

  // Only show selection UI if handlers are provided
  const showSelection = !!(onSelectClient && onSelectAllClients);

  const handleClientClick = (clientId: string) => {
    const encodedId = encodeURIComponent(clientId);
    navigate(`/clients/${encodedId}`);
  };

  const handleEditClient = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    const encodedId = encodeURIComponent(clientId);
    navigate(`/clients/${encodedId}`);
  };

  const handlePortalLink = async (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    await copyPortalLink(clientId);
  };

  const handleDeleteClick = (e: React.MouseEvent, client: ClientWithStats) => {
    e.stopPropagation();
    setClientToDelete(client);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    setDeletingClientId(clientToDelete.id);
    try {
      const success = await deleteClient(clientToDelete.id);
      if (success) {
        setShowDeleteDialog(false);
        setClientToDelete(null);
        if (onRefresh) {
          onRefresh();
        }
        window.dispatchEvent(new CustomEvent('clientsRefresh'));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setDeletingClientId(null);
    }
  };

  const formatAddress = (client: ClientWithStats) => {
    const parts = [client.address, client.city, client.state, client.zip].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const areAllClientsSelected = showSelection && clients.length > 0 && clients.every(client => selectedClients.includes(client.id));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <ModernCard key={i} variant="elevated" className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </ModernCard>
        ))}
      </div>
    );
  }

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
      <>
        <div className="space-y-4">
          {showSelection && (
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
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard 
                key={client.id} 
                client={client} 
                onRefresh={onRefresh}
                selectedClients={selectedClients}
                onSelectClient={onSelectClient}
                onPortalLink={handlePortalLink}
                onEditClient={handleEditClient}
                onDeleteClick={handleDeleteClick}
                isGenerating={isGenerating}
                showSelection={showSelection}
              />
            ))}
          </div>
        </div>

        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowDeleteDialog(false);
              setClientToDelete(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Client"
          description={`Are you sure you want to delete "${clientToDelete?.name}"? This action cannot be undone.`}
          isDeleting={deletingClientId === clientToDelete?.id}
        />
      </>
    );
  }

  // List view (table format) - matching Jobs list design
  return (
    <>
      <ModernCard variant="elevated">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {showSelection && (
                  <th className="text-left p-4 w-12">
                    <Checkbox 
                      checked={areAllClientsSelected}
                      onCheckedChange={onSelectAllClients}
                    />
                  </th>
                )}
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Company</th>
                <th className="text-left p-4 font-semibold">Contact</th>
                <th className="text-left p-4 font-semibold">Address</th>
                <th className="text-left p-4 font-semibold">Segment</th>
                <th className="text-left p-4 font-semibold">Jobs</th>
                <th className="text-left p-4 font-semibold">Revenue</th>
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
              {clients.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  isSelected={selectedClients.includes(client.id)}
                  onSelectClient={onSelectClient}
                  onClientClick={handleClientClick}
                  onPortalLink={handlePortalLink}
                  onEditClient={handleEditClient}
                  onDeleteClick={handleDeleteClick}
                  isGenerating={isGenerating}
                  showSelection={showSelection}
                />
              ))}
            </tbody>
          </table>
        </div>
      </ModernCard>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteDialog(false);
            setClientToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        description={`Are you sure you want to delete "${clientToDelete?.name}"? This action cannot be undone.`}
        isDeleting={deletingClientId === clientToDelete?.id}
      />
    </>
  );
};

// ClientCard component for grid view
const ClientCard = ({ 
  client, 
  selectedClients,
  onSelectClient,
  onPortalLink,
  onEditClient,
  onDeleteClick,
  isGenerating,
  onRefresh,
  showSelection
}: { 
  client: ClientWithStats;
  selectedClients: string[];
  onSelectClient?: (clientId: string, isSelected: boolean) => void;
  onPortalLink: (e: React.MouseEvent, clientId: string) => void;
  onEditClient: (e: React.MouseEvent, clientId: string) => void;
  onDeleteClick: (e: React.MouseEvent, client: ClientWithStats) => void;
  isGenerating: boolean;
  onRefresh?: () => void;
  showSelection: boolean;
}) => {
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading } = useClientStats(client.id);
  const statusStyle = getStatusBadgeStyle(client.status || 'active');

  const handleClientClick = () => {
    const encodedId = encodeURIComponent(client.id);
    navigate(`/clients/${encodedId}`);
  };

  const formatAddress = () => {
    const parts = [client.address, client.city, client.state, client.zip].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  return (
    <div className="cursor-pointer" onClick={handleClientClick}>
      <ModernCard 
        variant="elevated" 
        className="hover:shadow-lg transition-all duration-300 group"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {showSelection && onSelectClient && (
                <Checkbox 
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={(checked) => onSelectClient(client.id, !!checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{client.name}</h3>
                {client.company && (
                  <p className="text-sm text-muted-foreground">{client.company}</p>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onPortalLink(e, client.id)}
                disabled={isGenerating}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy portal link"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onEditClient(e, client.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onDeleteClick(e, client)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              style={statusStyle}
            >
              {client.status || 'Active'}
            </Badge>
            
            {client.segment && (
              <ClientSegmentBadge segment={client.segment} />
            )}
          </div>
          
          {(client.email || client.phone) && (
            <div className="py-2">
              <ClientContactActions
                client={client}
                compact={true}
                size="sm"
              />
            </div>
          )}
          
          {(client.address || client.city) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="truncate">{formatAddress()}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm">
              <span className="font-medium">{stats?.totalJobs || 0}</span>
              <span className="text-muted-foreground"> jobs</span>
            </div>
            <div className="text-sm font-medium text-green-600">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
};

// ClientRow component for table view
const ClientRow = ({
  client,
  isSelected,
  onSelectClient,
  onClientClick,
  onPortalLink,
  onEditClient,
  onDeleteClick,
  isGenerating,
  showSelection
}: {
  client: ClientWithStats;
  isSelected: boolean;
  onSelectClient?: (clientId: string, isSelected: boolean) => void;
  onClientClick: (clientId: string) => void;
  onPortalLink: (e: React.MouseEvent, clientId: string) => void;
  onEditClient: (e: React.MouseEvent, clientId: string) => void;
  onDeleteClick: (e: React.MouseEvent, client: ClientWithStats) => void;
  isGenerating: boolean;
  showSelection: boolean;
}) => {
  const { stats } = useClientStats(client.id);
  
  const formatAddress = () => {
    const parts = [client.address, client.city, client.state, client.zip].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const statusStyle = getStatusBadgeStyle(client.status || 'active');

  return (
    <tr 
      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => onClientClick(client.id)}
    >
      {showSelection && (
        <td className="p-4">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={(checked) => onSelectClient?.(client.id, !!checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium">{client.name}</div>
            {client.created_at && (
              <div className="text-xs text-muted-foreground">
                Added {format(new Date(client.created_at), 'MMM d, yyyy')}
              </div>
            )}
          </div>
          <Badge 
            variant="outline" 
            className="text-xs"
            style={statusStyle}
          >
            {client.status || 'Active'}
          </Badge>
        </div>
      </td>
      <td className="p-4">
        {client.company ? (
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
            {client.company}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="p-4">
        <div className="space-y-1">
          {client.email && (
            <div className="flex items-center text-sm">
              <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span className="truncate max-w-[200px]">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              {client.phone}
            </div>
          )}
          {!client.email && !client.phone && (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      </td>
      <td className="p-4">
        {formatAddress() ? (
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="truncate max-w-[250px]">{formatAddress()}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="p-4">
        {client.segment ? (
          <ClientSegmentBadge segment={client.segment} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="p-4">
        <div className="flex items-center text-sm">
          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">{stats?.totalJobs || 0}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center text-sm font-medium text-green-600">
          <DollarSign className="h-4 w-4 mr-1" />
          {formatCurrency(stats?.totalRevenue || 0)}
        </div>
      </td>
      <td className="p-4 text-right">
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => onPortalLink(e, client.id)}
            disabled={isGenerating}
            title="Copy portal link"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => onEditClient(e, client.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                if (client.phone) {
                  navigate(`/connect?tab=sms&clientId=${client.id}&clientName=${encodeURIComponent(client.name)}&clientPhone=${encodeURIComponent(client.phone)}&autoOpen=true`);
                } else {
                  toast.error('No phone number available');
                }
              }}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                if (client.email) {
                  navigate(`/connect?tab=emails&clientId=${client.id}&clientName=${encodeURIComponent(client.name)}&clientEmail=${encodeURIComponent(client.email)}&autoOpen=true`);
                } else {
                  toast.error('No email address available');
                }
              }}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(e, client);
              }} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
};
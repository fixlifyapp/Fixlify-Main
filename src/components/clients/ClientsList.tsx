
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, 
  MapPin, 
  Calendar,
  Building,
  User,
  Trash2
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { ClientContactActions } from "./ClientContactActions";
import { ClientSegmentBadge } from "./ClientSegmentBadge";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { useClientStats } from "@/hooks/useClientStats";
import { formatCurrency } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/jobs/dialogs/DeleteConfirmDialog";

interface ClientsListProps {
  isGridView?: boolean;
  clients?: any[];
  isLoading?: boolean;
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
}

const ClientCard = ({ client, onRefresh }: { client: ClientWithStats; onRefresh?: () => void }) => {
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading } = useClientStats(client.id);
  const { deleteClient } = useClients();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClientClick = () => {
    // Ensure client ID is properly encoded for URL
    const encodedId = encodeURIComponent(client.id);
    console.log('Navigating to client:', client.id, 'Encoded:', encodedId);
    navigate(`/clients/${encodedId}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Ensure client ID is properly encoded for URL
    const encodedId = encodeURIComponent(client.id);
    navigate(`/clients/${encodedId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteClient(client.id);
      if (success) {
        setShowDeleteDialog(false);
        // Trigger refresh of parent component
        if (onRefresh) {
          onRefresh();
        }
        // Also trigger global refresh event
        window.dispatchEvent(new CustomEvent('clientsRefresh'));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAddress = () => {
    const parts = [client.address, client.city, client.state, client.zip].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  if (statsLoading) {
    return (
      <ModernCard variant="elevated" className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </ModernCard>
    );
  }

  return (
    <>
      <div className="cursor-pointer" onClick={handleClientClick}>
        <ModernCard 
          variant="elevated" 
          className="hover:shadow-lg transition-all duration-300 group"
        >
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                  <ClientSegmentBadge stats={stats} />
                  <ClientStatusBadge status={client.status} />
                </div>
                {client.company && (
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <Building className="h-4 w-4 mr-1" />
                    {client.company}
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  {client.type || 'Residential'}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="truncate">{formatAddress()}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-3 border-t border-b">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">{stats.totalJobs}</div>
                <div className="text-xs text-muted-foreground">Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {formatCurrency(stats.averageJobValue)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Job</div>
              </div>
            </div>

            {/* Contact Actions */}
            <ClientContactActions client={client} compact />
          </div>
        </ModernCard>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Client"
        description={`Are you sure you want to delete "${client.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};

const ClientRow = ({ client, onRefresh }: { client: ClientWithStats; onRefresh?: () => void }) => {
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading } = useClientStats(client.id);
  const { deleteClient } = useClients();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClientClick = () => {
    // Ensure client ID is properly encoded for URL
    const encodedId = encodeURIComponent(client.id);
    console.log('Navigating to client:', client.id, 'Encoded:', encodedId);
    navigate(`/clients/${encodedId}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Ensure client ID is properly encoded for URL
    const encodedId = encodeURIComponent(client.id);
    navigate(`/clients/${encodedId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteClient(client.id);
      if (success) {
        setShowDeleteDialog(false);
        // Trigger refresh of parent component
        if (onRefresh) {
          onRefresh();
        }
        // Also trigger global refresh event
        window.dispatchEvent(new CustomEvent('clientsRefresh'));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAddress = () => {
    const parts = [client.address, client.city, client.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  if (statsLoading) {
    return (
      <tr className="border-b">
        <td className="p-4"><Skeleton className="h-5 w-32" /></td>
        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
        <td className="p-4"><Skeleton className="h-4 w-40" /></td>
        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
        <td className="p-4"><Skeleton className="h-8 w-24" /></td>
        <td className="p-4"><Skeleton className="h-8 w-8" /></td>
      </tr>
    );
  }

  return (
    <>
      <tr 
        className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={handleClientClick}
      >
        <td className="p-4">
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium">{client.name}</div>
              {client.company && (
                <div className="text-sm text-muted-foreground">{client.company}</div>
              )}
            </div>
            <ClientSegmentBadge stats={stats} />
          </div>
        </td>
        <td className="p-4">
          <Badge variant="outline">{client.type || 'Residential'}</Badge>
        </td>
        <td className="p-4">
          <ClientStatusBadge status={client.status} />
        </td>
        <td className="p-4">
          <div className="text-sm max-w-[200px] truncate">{formatAddress()}</div>
        </td>
        <td className="p-4">
          <div className="text-sm font-medium">{stats.totalJobs}</div>
        </td>
        <td className="p-4">
          <div className="text-sm font-medium text-green-600">
            {formatCurrency(stats.totalRevenue)}
          </div>
        </td>
        <td className="p-4">
          <div className="text-sm">
            {stats.lastServiceDate 
              ? new Date(stats.lastServiceDate).toLocaleDateString()
              : '—'
            }
          </div>
        </td>
        <td className="p-4" onClick={(e) => e.stopPropagation()}>
          <ClientContactActions client={client} compact />
        </td>
        <td className="p-4 text-right">
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Client"
        description={`Are you sure you want to delete "${client.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};

export const ClientsList = ({ isGridView = false, clients, isLoading, onRefresh }: ClientsListProps) => {
  // Use provided clients or fallback to hook (for backwards compatibility)
  const hookData = useClients();
  const clientsData = clients || hookData.clients;
  const loadingState = isLoading !== undefined ? isLoading : hookData.isLoading;

  if (loadingState) {
    return (
      <ModernCard variant="elevated" className="p-8 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span>Loading clients...</span>
        </div>
      </ModernCard>
    );
  }

  if (clientsData.length === 0) {
    return (
      <ModernCard variant="elevated" className="p-12 text-center">
        <div className="text-muted-foreground">
          <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No clients found</h3>
          <p>Start by adding your first client.</p>
        </div>
      </ModernCard>
    );
  }

  if (isGridView) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientsData.map((client) => (
          <ClientCard key={client.id} client={client} onRefresh={onRefresh} />
        ))}
      </div>
    );
  }

  return (
    <ModernCard variant="elevated">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-semibold w-[200px]">Client</th>
              <th className="text-left p-4 font-semibold w-[100px]">Type</th>
              <th className="text-left p-4 font-semibold w-[100px]">Status</th>
              <th className="text-left p-4 font-semibold w-[200px]">Address</th>
              <th className="text-left p-4 font-semibold w-[80px]">Jobs</th>
              <th className="text-left p-4 font-semibold w-[120px]">Revenue</th>
              <th className="text-left p-4 font-semibold w-[120px]">Last Service</th>
              <th className="text-left p-4 font-semibold w-[100px]">Contact</th>
              <th className="text-right p-4 w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clientsData.map((client) => (
              <ClientRow key={client.id} client={client} onRefresh={onRefresh} />
            ))}
          </tbody>
        </table>
      </div>
    </ModernCard>
  );
};

import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  Mail,
  MapPin,
  Edit2,
  User,
  Building,
  Calendar,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { Client } from "@/types/client";
import { cn } from "@/lib/utils";

interface ClientsListProps {
  clients: Client[];
  isGridView?: boolean;
  selectedClients: string[];
  onSelectClient: (clientId: string, isSelected: boolean) => void;
  onSelectAllClients: (isSelected: boolean) => void;
  onRefresh?: () => void;
}

type SortField = 'id' | 'name' | 'type' | 'status' | 'created';
type SortDirection = 'asc' | 'desc';

// Status config with modern colors
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  'active': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'inactive': { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
  'lead': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

// Type config with modern colors
const TYPE_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  'residential': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'commercial': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'property_manager': { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
};

// Modern status badge
const StatusBadge = memo(({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG['active'];

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      config.bg, config.text
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active'}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Modern type badge
const TypeBadge = memo(({ type }: { type: string }) => {
  const config = TYPE_CONFIG[type?.toLowerCase()] || TYPE_CONFIG['residential'];
  const displayName = type?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Residential';

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      config.bg, config.text
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {displayName}
    </span>
  );
});

TypeBadge.displayName = "TypeBadge";

// Table header with sort
const SortableHeader = memo(({
  label,
  field,
  currentSort,
  currentDirection,
  onSort,
  className
}: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}) => {
  const isActive = currentSort === field;

  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors",
        isActive && "text-slate-900",
        className
      )}
    >
      {label}
      {isActive && (
        currentDirection === 'asc'
          ? <ChevronUp className="h-3 w-3" />
          : <ChevronDown className="h-3 w-3" />
      )}
    </button>
  );
});

SortableHeader.displayName = "SortableHeader";

// Loading skeleton row
const TableRowSkeleton = memo(() => (
  <tr className="border-b border-slate-100">
    <td className="py-4 px-4"><Skeleton className="h-4 w-4" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-28" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-40" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-8" /></td>
  </tr>
));

TableRowSkeleton.displayName = "TableRowSkeleton";

// Main table row
const ClientRow = memo(({
  client,
  isSelected,
  onSelect,
  onEdit
}: {
  client: Client;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <tr
      className={cn(
        "border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors group",
        isSelected && "bg-blue-50/50"
      )}
      onClick={() => navigate(`/clients/${client.id}`)}
    >
      {/* Checkbox */}
      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="data-[state=checked]:bg-blue-600"
        />
      </td>

      {/* Client ID */}
      <td className="py-3 px-4">
        <span className="font-mono text-sm font-medium text-violet-600 hover:text-violet-800">
          {client.id.slice(0, 8)}
        </span>
      </td>

      {/* Client Name */}
      <td className="py-3 px-4">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 truncate max-w-[200px]">
            {client.name}
          </span>
          {client.company && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Building className="h-3 w-3" />
              {client.company}
            </span>
          )}
        </div>
      </td>

      {/* Contact */}
      <td className="py-3 px-4">
        <div className="space-y-1">
          {client.phone && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {client.phone}
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate max-w-[160px]">{client.email}</span>
            </div>
          )}
          {!client.phone && !client.email && (
            <span className="text-sm text-slate-400">—</span>
          )}
        </div>
      </td>

      {/* Address */}
      <td className="py-3 px-4">
        {client.address ? (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 max-w-[200px]">
            <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{client.address}</span>
          </div>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </td>

      {/* Type */}
      <td className="py-3 px-4">
        <TypeBadge type={client.type || 'residential'} />
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <StatusBadge status={client.status || 'active'} />
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="h-8 w-8 p-0"
            title="Edit client"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

ClientRow.displayName = "ClientRow";

// Mobile card view for smaller screens
const MobileClientCard = memo(({
  client,
  isSelected,
  onSelect,
  onEdit
}: {
  client: Client;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-all",
        isSelected && "border-blue-300 bg-blue-50/30"
      )}
      onClick={() => navigate(`/clients/${client.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={e => e.stopPropagation()}
            className="data-[state=checked]:bg-blue-600"
          />
          <div>
            <span className="font-mono text-sm font-medium text-violet-600">
              {client.id.slice(0, 8)}
            </span>
            <h3 className="font-medium text-slate-900">
              {client.name}
            </h3>
            {client.company && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Building className="h-3 w-3" />
                {client.company}
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={client.status || 'active'} />
      </div>

      <div className="space-y-2 mb-3">
        {client.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="h-4 w-4 text-slate-400" />
            {client.phone}
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="h-4 w-4 text-slate-400" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{client.address}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <TypeBadge type={client.type || 'residential'} />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

MobileClientCard.displayName = "MobileClientCard";

// Grid view card
const GridClientCard = memo(({
  client,
  isSelected,
  onSelect,
  onEdit
}: {
  client: Client;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg transition-all group",
        isSelected && "border-blue-300 bg-blue-50/30 ring-1 ring-blue-200"
      )}
      onClick={() => navigate(`/clients/${client.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={e => e.stopPropagation()}
            className="data-[state=checked]:bg-blue-600"
          />
          <span className="font-mono text-sm font-medium text-violet-600">
            {client.id.slice(0, 8)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-lg text-slate-900 mb-1">{client.name}</h3>
        {client.company && (
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Building className="h-3 w-3" />
            {client.company}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <StatusBadge status={client.status || 'active'} />
        <TypeBadge type={client.type || 'residential'} />
      </div>

      {client.address && (
        <div className="flex items-center text-sm text-slate-600 mb-3">
          <MapPin className="h-4 w-4 mr-2 text-slate-400" />
          <span className="truncate">{client.address}</span>
        </div>
      )}

      <div className="space-y-2">
        {client.phone && (
          <div className="flex items-center text-sm text-slate-600">
            <Phone className="h-4 w-4 mr-2 text-slate-400" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center text-sm text-slate-600">
            <Mail className="h-4 w-4 mr-2 text-slate-400" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
      </div>

      {client.created_at && (
        <div className="flex items-center text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
          <Calendar className="h-3 w-3 mr-1" />
          Created {format(new Date(client.created_at), "MMM d, yyyy")}
        </div>
      )}
    </div>
  );
});

GridClientCard.displayName = "GridClientCard";

// Main component
export const ClientsList = memo(({
  clients,
  isGridView = false,
  selectedClients = [],
  onSelectClient,
  onSelectAllClients,
  onRefresh
}: ClientsListProps) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort clients
  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'created':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [clients, sortField, sortDirection]);

  const areAllSelected = clients.length > 0 && clients.every(client => selectedClients.includes(client.id));
  const areSomeSelected = selectedClients.length > 0 && !areAllSelected;

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <User className="mx-auto h-12 w-12 mb-4 text-slate-300" />
        <div className="text-slate-600 font-medium mb-2">No clients found</div>
        <p className="text-sm text-slate-500">No clients match your current filters</p>
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
    );
  }

  if (isGridView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={areAllSelected}
              onCheckedChange={onSelectAllClients}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm text-slate-600">
              {selectedClients.length > 0
                ? `${selectedClients.length} selected`
                : `Select all (${clients.length})`
              }
            </span>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-slate-600"
            >
              Refresh
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedClients.map((client) => (
            <GridClientCard
              key={client.id}
              client={client}
              isSelected={selectedClients.includes(client.id)}
              onSelect={(checked) => onSelectClient(client.id, checked)}
              onEdit={() => navigate(`/clients/${client.id}`)}
            />
          ))}
        </div>
      </div>
    );
  }

  // List view (table format)
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="py-3 px-4 text-left w-10">
                  <Checkbox
                    checked={areAllSelected}
                    // @ts-expect-error - indeterminate is valid but not in types
                    data-state={areSomeSelected ? "indeterminate" : areAllSelected ? "checked" : "unchecked"}
                    onCheckedChange={onSelectAllClients}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </th>
                <th className="py-3 px-4 text-left">
                  <SortableHeader
                    label="Client #"
                    field="id"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-3 px-4 text-left">
                  <SortableHeader
                    label="Name"
                    field="name"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-3 px-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </span>
                </th>
                <th className="py-3 px-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Address
                  </span>
                </th>
                <th className="py-3 px-4 text-left">
                  <SortableHeader
                    label="Type"
                    field="type"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-3 px-4 text-left">
                  <SortableHeader
                    label="Status"
                    field="status"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-3 px-4 text-left w-20">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedClients.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  isSelected={selectedClients.includes(client.id)}
                  onSelect={(checked) => onSelectClient(client.id, checked)}
                  onEdit={() => navigate(`/clients/${client.id}`)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {selectedClients.length > 0
              ? `${selectedClients.length} of ${clients.length} selected`
              : `${clients.length} clients`
            }
          </span>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-slate-600"
            >
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={areAllSelected}
              onCheckedChange={onSelectAllClients}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm text-slate-600">
              {selectedClients.length > 0
                ? `${selectedClients.length} selected`
                : `${clients.length} clients`
              }
            </span>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-slate-600"
            >
              Refresh
            </Button>
          )}
        </div>
        {sortedClients.map((client) => (
          <MobileClientCard
            key={client.id}
            client={client}
            isSelected={selectedClients.includes(client.id)}
            onSelect={(checked) => onSelectClient(client.id, checked)}
            onEdit={() => navigate(`/clients/${client.id}`)}
          />
        ))}
      </div>
    </>
  );
});

ClientsList.displayName = "ClientsList";

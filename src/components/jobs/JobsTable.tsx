import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  Edit2,
  MapPin,
  Clock,
  ChevronUp,
  ChevronDown,
  Copy,
  Check,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Job } from "@/types/job";
import { useTags } from "@/hooks/useConfigItems";
import { usePortalLink } from "@/hooks/usePortalLink";
import { cn } from "@/lib/utils";

interface JobsTableProps {
  jobs: Job[];
  selectedJobs: string[];
  onSelectJob: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs: (isSelected: boolean) => void;
  isLoading?: boolean;
}

type SortField = 'id' | 'client' | 'date' | 'status' | 'revenue';
type SortDirection = 'asc' | 'desc';

// Status config with modern colors
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  'scheduled': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'in-progress': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'cancelled': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  'canceled': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  'pending': { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' },
};

// Modern status badge
const StatusBadge = memo(({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG['pending'];

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      config.bg, config.text
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Tag pill component
const TagPill = memo(({ name, color }: { name: string; color?: string }) => (
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
    style={color ? {
      backgroundColor: `${color}15`,
      color: color,
      borderColor: `${color}30`
    } : undefined}
  >
    {name}
  </span>
));

TagPill.displayName = "TagPill";

// Portal link button with copy feedback
const PortalLinkButton = memo(({ clientId, disabled }: { clientId: string; disabled?: boolean }) => {
  const { copyPortalLink, isGenerating } = usePortalLink();
  const [copied, setCopied] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyPortalLink(clientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (disabled) {
    return (
      <Button variant="ghost" size="sm" disabled className="h-8 w-8 p-0 opacity-30">
        <ExternalLink className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isGenerating}
      className={cn(
        "h-8 w-8 p-0 transition-all",
        copied && "text-emerald-600 bg-emerald-50"
      )}
      title="Copy portal link"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <ExternalLink className="h-4 w-4" />
      )}
    </Button>
  );
});

PortalLinkButton.displayName = "PortalLinkButton";

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
    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-40" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
  </tr>
));

TableRowSkeleton.displayName = "TableRowSkeleton";

// Main table row
const JobRow = memo(({
  job,
  isSelected,
  onSelect,
  onEdit,
  tagItems
}: {
  job: Job;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  tagItems: Array<{id: string, name: string, color?: string}>;
}) => {
  const navigate = useNavigate();

  // Format time
  const timeDisplay = useMemo(() => {
    if (job.schedule_start) {
      return format(new Date(job.schedule_start), "MMM d, HH:mm");
    }
    if (job.date) {
      return format(new Date(job.date), "MMM d, HH:mm");
    }
    return "—";
  }, [job.schedule_start, job.date]);

  // Resolve tags
  const resolvedTags = useMemo(() => {
    if (!job.tags || job.tags.length === 0) return [];

    return job.tags.slice(0, 2).map(tag => {
      if (typeof tag === 'string' && tag.length === 36 && tag.includes('-')) {
        const tagItem = tagItems.find(t => t.id === tag);
        return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: tag.slice(0, 8), color: undefined };
      }
      const tagItem = tagItems.find(t => t.name === tag);
      return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: String(tag), color: undefined };
    });
  }, [job.tags, tagItems]);

  const extraTagsCount = (job.tags?.length || 0) - 2;

  return (
    <tr
      className={cn(
        "border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors group",
        isSelected && "bg-blue-50/50"
      )}
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      {/* Checkbox */}
      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="data-[state=checked]:bg-blue-600"
        />
      </td>

      {/* Job Number */}
      <td className="py-3 px-4">
        <span className="font-mono text-sm font-medium text-violet-600 hover:text-violet-800">
          {job.id.slice(0, 8)}
        </span>
      </td>

      {/* Client Name */}
      <td className="py-3 px-4">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 truncate max-w-[200px]">
            {job.client?.name || 'Unknown Client'}
          </span>
          {job.client?.phone && (
            <span className="text-xs text-slate-500">{job.client.phone}</span>
          )}
        </div>
      </td>

      {/* Time */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {timeDisplay}
        </div>
      </td>

      {/* Address */}
      <td className="py-3 px-4">
        {job.address ? (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 max-w-[200px]">
            <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{job.address}</span>
          </div>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </td>

      {/* Tags */}
      <td className="py-3 px-4">
        {resolvedTags.length > 0 ? (
          <div className="flex items-center gap-1 flex-wrap">
            {resolvedTags.map((tag, index) => (
              <TagPill key={index} name={tag.name} color={tag.color} />
            ))}
            {extraTagsCount > 0 && (
              <span className="text-xs text-slate-400 ml-1">+{extraTagsCount}</span>
            )}
          </div>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <StatusBadge status={job.status} />
      </td>

      {/* Revenue */}
      <td className="py-3 px-4">
        {job.revenue && job.revenue > 0 ? (
          <span className="font-medium text-emerald-600 tabular-nums">
            ${job.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <PortalLinkButton clientId={job.client_id} disabled={!job.client_id} />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="h-8 w-8 p-0"
            title="Edit job"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

JobRow.displayName = "JobRow";

// Mobile card view for smaller screens
const MobileJobCard = memo(({
  job,
  isSelected,
  onSelect,
  onEdit,
  tagItems
}: {
  job: Job;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  tagItems: Array<{id: string, name: string, color?: string}>;
}) => {
  const navigate = useNavigate();

  const timeDisplay = useMemo(() => {
    if (job.schedule_start) {
      return format(new Date(job.schedule_start), "MMM d, HH:mm");
    }
    if (job.date) {
      return format(new Date(job.date), "MMM d, HH:mm");
    }
    return "—";
  }, [job.schedule_start, job.date]);

  const resolvedTags = useMemo(() => {
    if (!job.tags || job.tags.length === 0) return [];
    return job.tags.slice(0, 2).map(tag => {
      if (typeof tag === 'string' && tag.length === 36 && tag.includes('-')) {
        const tagItem = tagItems.find(t => t.id === tag);
        return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: tag.slice(0, 8), color: undefined };
      }
      const tagItem = tagItems.find(t => t.name === tag);
      return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: String(tag), color: undefined };
    });
  }, [job.tags, tagItems]);

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-all",
        isSelected && "border-blue-300 bg-blue-50/30"
      )}
      onClick={() => navigate(`/jobs/${job.id}`)}
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
              {job.id.slice(0, 8)}
            </span>
            <h3 className="font-medium text-slate-900">
              {job.client?.name || 'Unknown Client'}
            </h3>
          </div>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4 text-slate-400" />
          {timeDisplay}
        </div>
        {job.address && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{job.address}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {resolvedTags.map((tag, index) => (
            <TagPill key={index} name={tag.name} color={tag.color} />
          ))}
          {job.revenue && job.revenue > 0 && (
            <span className="font-medium text-emerald-600 text-sm">
              ${job.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <PortalLinkButton clientId={job.client_id} disabled={!job.client_id} />
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

MobileJobCard.displayName = "MobileJobCard";

// Main component
export const JobsTable = memo(({
  jobs,
  selectedJobs,
  onSelectJob,
  onSelectAllJobs,
  isLoading = false
}: JobsTableProps) => {
  const navigate = useNavigate();
  const { items: tagItems } = useTags();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort jobs
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'client':
          comparison = (a.client?.name || '').localeCompare(b.client?.name || '');
          break;
        case 'date': {
          const dateA = a.schedule_start || a.date || '';
          const dateB = b.schedule_start || b.date || '';
          comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
          break;
        }
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'revenue':
          comparison = (a.revenue || 0) - (b.revenue || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [jobs, sortField, sortDirection]);

  const areAllSelected = jobs.length > 0 && jobs.every(job => selectedJobs.includes(job.id));
  const areSomeSelected = selectedJobs.length > 0 && !areAllSelected;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-left w-10"><Skeleton className="h-4 w-4" /></th>
                <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-12" /></th>
                <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-12" /></th>
                <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-12" /></th>
                <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-14" /></th>
                <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-16" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="text-slate-400 mb-2">No jobs found</div>
        <p className="text-sm text-slate-500">Try adjusting your filters or create a new job</p>
      </div>
    );
  }

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
                  onCheckedChange={onSelectAllJobs}
                  className="data-[state=checked]:bg-blue-600"
                />
              </th>
              <th className="py-3 px-4 text-left">
                <SortableHeader
                  label="Job #"
                  field="id"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="py-3 px-4 text-left">
                <SortableHeader
                  label="Client"
                  field="client"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="py-3 px-4 text-left">
                <SortableHeader
                  label="Time"
                  field="date"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="py-3 px-4 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Address
                </span>
              </th>
              <th className="py-3 px-4 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tags
                </span>
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
              <th className="py-3 px-4 text-left">
                <SortableHeader
                  label="Revenue"
                  field="revenue"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="py-3 px-4 text-left w-24">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                isSelected={selectedJobs.includes(job.id)}
                onSelect={(checked) => onSelectJob(job.id, checked)}
                onEdit={() => navigate(`/jobs/${job.id}`)}
                tagItems={tagItems}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {selectedJobs.length > 0
            ? `${selectedJobs.length} of ${jobs.length} selected`
            : `${jobs.length} jobs`
          }
        </span>
      </div>
    </div>

    {/* Mobile View */}
    <div className="md:hidden space-y-3">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={areAllSelected}
            onCheckedChange={onSelectAllJobs}
            className="data-[state=checked]:bg-blue-600"
          />
          <span className="text-sm text-slate-600">
            {selectedJobs.length > 0
              ? `${selectedJobs.length} selected`
              : `${jobs.length} jobs`
            }
          </span>
        </div>
      </div>
      {sortedJobs.map((job) => (
        <MobileJobCard
          key={job.id}
          job={job}
          isSelected={selectedJobs.includes(job.id)}
          onSelect={(checked) => onSelectJob(job.id, checked)}
          onEdit={() => navigate(`/jobs/${job.id}`)}
          tagItems={tagItems}
        />
      ))}
    </div>
    </>
  );
});

JobsTable.displayName = "JobsTable";

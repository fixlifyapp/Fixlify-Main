import { memo, useMemo, useState, useCallback } from "react";
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
  Loader2,
  MoreHorizontal,
  Phone,
  Mail,
  Eye
} from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { Job } from "@/types/job";
import { useTags } from "@/hooks/useConfigItems";
import { usePortalLink } from "@/hooks/usePortalLink";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface JobsTableProps {
  jobs: Job[];
  selectedJobs: string[];
  onSelectJob: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs: (isSelected: boolean) => void;
  isLoading?: boolean;
}

type SortField = 'id' | 'client' | 'date' | 'status' | 'revenue';
type SortDirection = 'asc' | 'desc';

// Status configuration with glowing effects
const STATUS_CONFIG: Record<string, {
  bg: string;
  text: string;
  glow: string;
  ring: string;
  label: string;
}> = {
  'scheduled': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    ring: 'ring-amber-500/30',
    label: 'Scheduled'
  },
  'in-progress': {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    glow: 'shadow-[0_0_12px_rgba(14,165,233,0.3)]',
    ring: 'ring-sky-500/30',
    label: 'In Progress'
  },
  'completed': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    ring: 'ring-emerald-500/30',
    label: 'Completed'
  },
  'cancelled': {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
    ring: 'ring-rose-500/30',
    label: 'Cancelled'
  },
  'canceled': {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
    ring: 'ring-rose-500/30',
    label: 'Cancelled'
  },
  'pending': {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    glow: '',
    ring: 'ring-slate-500/30',
    label: 'Pending'
  },
};

// Modern glowing status badge
const StatusBadge = memo(({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG['pending'];

  return (
    <span className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase",
      "ring-1 transition-all duration-300",
      config.bg, config.text, config.ring,
      "hover:scale-105"
    )}>
      <span className={cn(
        "w-2 h-2 rounded-full animate-pulse",
        status.toLowerCase() === 'in-progress' && "bg-sky-400",
        status.toLowerCase() === 'scheduled' && "bg-amber-400",
        status.toLowerCase() === 'completed' && "bg-emerald-400",
        status.toLowerCase() === 'cancelled' && "bg-rose-400",
        status.toLowerCase() === 'canceled' && "bg-rose-400",
        status.toLowerCase() === 'pending' && "bg-slate-400"
      )} />
      {config.label}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Compact tag pill with color
const TagPill = memo(({ name, color }: { name: string; color?: string }) => {
  const bgColor = color ? `${color}20` : undefined;
  const borderColor = color ? `${color}40` : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium",
        "bg-slate-800/50 text-slate-300 border border-slate-700/50",
        "transition-colors hover:bg-slate-700/50"
      )}
      style={color ? {
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: color
      } : undefined}
    >
      {name}
    </span>
  );
});

TagPill.displayName = "TagPill";

// Portal link with smooth copy feedback
const PortalLinkButton = memo(({ clientId, disabled }: { clientId: string; disabled?: boolean }) => {
  const { copyPortalLink, isGenerating } = usePortalLink();
  const [copied, setCopied] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyPortalLink(clientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (disabled) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            disabled={isGenerating}
            className={cn(
              "h-8 w-8 p-0 rounded-lg transition-all duration-200",
              "text-slate-500 hover:text-white hover:bg-slate-700",
              copied && "text-emerald-400 bg-emerald-500/10"
            )}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
          {copied ? "Copied!" : "Copy portal link"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

PortalLinkButton.displayName = "PortalLinkButton";

// Sortable header with visual feedback
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
        "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest",
        "text-slate-500 hover:text-slate-300 transition-colors",
        isActive && "text-slate-200",
        className
      )}
    >
      {label}
      <span className={cn(
        "transition-opacity",
        isActive ? "opacity-100" : "opacity-0"
      )}>
        {currentDirection === 'asc'
          ? <ChevronUp className="h-3 w-3" />
          : <ChevronDown className="h-3 w-3" />
        }
      </span>
    </button>
  );
});

SortableHeader.displayName = "SortableHeader";

// Loading skeleton with shimmer effect
const TableRowSkeleton = memo(() => (
  <tr className="border-b border-slate-800/50">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton className="h-4 w-full bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
));

TableRowSkeleton.displayName = "TableRowSkeleton";

// Time display with smart formatting
const TimeDisplay = memo(({ job }: { job: Job }) => {
  const dateString = job.schedule_start || job.date;

  if (!dateString) {
    return <span className="text-slate-600">—</span>;
  }

  const date = new Date(dateString);
  const isOverdue = isPast(date) && job.status !== 'completed' && job.status !== 'cancelled';

  let dayLabel = format(date, "MMM d");
  if (isToday(date)) dayLabel = "Today";
  else if (isTomorrow(date)) dayLabel = "Tomorrow";

  return (
    <div className={cn(
      "flex flex-col gap-0.5",
      isOverdue && "text-rose-400"
    )}>
      <span className="text-sm font-medium">{dayLabel}</span>
      <span className="text-xs text-slate-500">{format(date, "h:mm a")}</span>
    </div>
  );
});

TimeDisplay.displayName = "TimeDisplay";

// Revenue display with formatting
const RevenueDisplay = memo(({ amount }: { amount?: number }) => {
  if (!amount || amount === 0) {
    return <span className="text-slate-600 text-sm">—</span>;
  }

  return (
    <span className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
      ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
    </span>
  );
});

RevenueDisplay.displayName = "RevenueDisplay";

// Main job row component
const JobRow = memo(({
  job,
  isSelected,
  onSelect,
  tagItems
}: {
  job: Job;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  tagItems: Array<{id: string, name: string, color?: string}>;
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Resolve tags to display
  const resolvedTags = useMemo(() => {
    if (!job.tags || job.tags.length === 0) return [];

    return job.tags.slice(0, 3).map(tag => {
      if (typeof tag === 'string' && tag.length === 36 && tag.includes('-')) {
        const tagItem = tagItems.find(t => t.id === tag);
        return tagItem ? { name: tagItem.name, color: tagItem.color } : null;
      }
      const tagItem = tagItems.find(t => t.name === tag);
      return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: String(tag), color: undefined };
    }).filter(Boolean) as Array<{name: string, color?: string}>;
  }, [job.tags, tagItems]);

  const extraTagsCount = (job.tags?.length || 0) - 3;

  return (
    <tr
      className={cn(
        "border-b border-slate-800/50 transition-all duration-150 cursor-pointer group",
        "hover:bg-slate-800/30",
        isSelected && "bg-blue-500/10 hover:bg-blue-500/15"
      )}
      onClick={() => navigate(`/jobs/${job.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <td className="py-3 px-4 w-12" onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className={cn(
            "border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500",
            "transition-transform",
            isHovered && "scale-110"
          )}
        />
      </td>

      {/* Job ID */}
      <td className="py-3 px-4">
        <span className="font-mono text-sm font-semibold text-blue-400 tracking-tight">
          {job.id.slice(0, 8).toUpperCase()}
        </span>
      </td>

      {/* Client */}
      <td className="py-3 px-4">
        <div className="flex flex-col gap-0.5 max-w-[180px]">
          <span className="text-sm font-medium text-slate-200 truncate">
            {job.client?.name || 'Unknown Client'}
          </span>
          {job.client?.phone && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {job.client.phone}
            </span>
          )}
        </div>
      </td>

      {/* Time */}
      <td className="py-3 px-4">
        <TimeDisplay job={job} />
      </td>

      {/* Address */}
      <td className="py-3 px-4">
        {job.address ? (
          <div className="flex items-center gap-2 max-w-[200px]">
            <MapPin className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
            <span className="text-sm text-slate-400 truncate">{job.address}</span>
          </div>
        ) : (
          <span className="text-slate-600 text-sm">—</span>
        )}
      </td>

      {/* Tags */}
      <td className="py-3 px-4">
        {resolvedTags.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {resolvedTags.map((tag, index) => (
              <TagPill key={index} name={tag.name} color={tag.color} />
            ))}
            {extraTagsCount > 0 && (
              <span className="text-[11px] text-slate-500 font-medium">+{extraTagsCount}</span>
            )}
          </div>
        ) : (
          <span className="text-slate-600 text-sm">—</span>
        )}
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <StatusBadge status={job.status} />
      </td>

      {/* Revenue */}
      <td className="py-3 px-4">
        <RevenueDisplay amount={job.revenue} />
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <div className={cn(
          "flex items-center gap-1 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <PortalLinkButton clientId={job.client_id} disabled={!job.client_id} />

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/jobs/${job.id}`);
                  }}
                  className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                View details
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-slate-900 border-slate-800 text-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <DropdownMenuItem
                className="hover:bg-slate-800 cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Job
              </DropdownMenuItem>
              {job.client?.email && (
                <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Client
                </DropdownMenuItem>
              )}
              {job.client?.phone && (
                <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Client
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
                <Copy className="h-4 w-4 mr-2" />
                Copy Job ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
});

JobRow.displayName = "JobRow";

// Mobile card component
const MobileJobCard = memo(({
  job,
  isSelected,
  onSelect,
  tagItems
}: {
  job: Job;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  tagItems: Array<{id: string, name: string, color?: string}>;
}) => {
  const navigate = useNavigate();

  const resolvedTags = useMemo(() => {
    if (!job.tags || job.tags.length === 0) return [];
    return job.tags.slice(0, 2).map(tag => {
      if (typeof tag === 'string' && tag.length === 36 && tag.includes('-')) {
        const tagItem = tagItems.find(t => t.id === tag);
        return tagItem ? { name: tagItem.name, color: tagItem.color } : null;
      }
      const tagItem = tagItems.find(t => t.name === tag);
      return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: String(tag), color: undefined };
    }).filter(Boolean) as Array<{name: string, color?: string}>;
  }, [job.tags, tagItems]);

  return (
    <div
      className={cn(
        "bg-slate-900 rounded-xl border border-slate-800 p-4",
        "cursor-pointer transition-all duration-200",
        "hover:border-slate-700 hover:bg-slate-800/50",
        "active:scale-[0.99]",
        isSelected && "border-blue-500/50 bg-blue-500/5"
      )}
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={e => e.stopPropagation()}
            className="border-slate-600 data-[state=checked]:bg-blue-500"
          />
          <div>
            <span className="font-mono text-xs font-semibold text-blue-400 tracking-tight">
              {job.id.slice(0, 8).toUpperCase()}
            </span>
            <h3 className="text-sm font-medium text-slate-200 mt-0.5">
              {job.client?.name || 'Unknown Client'}
            </h3>
          </div>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3 ml-8">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <TimeDisplay job={job} />
        </div>
        {job.address && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate">{job.address}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between ml-8">
        <div className="flex items-center gap-2">
          {resolvedTags.map((tag, index) => (
            <TagPill key={index} name={tag.name} color={tag.color} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <RevenueDisplay amount={job.revenue} />
          <div className="flex items-center gap-1">
            <PortalLinkButton clientId={job.client_id} disabled={!job.client_id} />
          </div>
        </div>
      </div>
    </div>
  );
});

MobileJobCard.displayName = "MobileJobCard";

// Main component
export const JobsTableRedesigned = memo(({
  jobs,
  selectedJobs,
  onSelectJob,
  onSelectAllJobs,
  isLoading = false
}: JobsTableProps) => {
  const { items: tagItems } = useTags();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {Array.from({ length: 9 }).map((_, i) => (
                  <th key={i} className="py-4 px-4 text-left">
                    <Skeleton className="h-3 w-16 bg-slate-800" />
                  </th>
                ))}
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

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
          <Clock className="h-8 w-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No jobs found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Try adjusting your filters or create a new job to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="py-4 px-4 text-left w-12">
                  <Checkbox
                    checked={areAllSelected}
                    // @ts-expect-error - indeterminate is valid but not in types
                    data-state={areSomeSelected ? "indeterminate" : areAllSelected ? "checked" : "unchecked"}
                    onCheckedChange={onSelectAllJobs}
                    className="border-slate-600 data-[state=checked]:bg-blue-500"
                  />
                </th>
                <th className="py-4 px-4 text-left">
                  <SortableHeader
                    label="Job ID"
                    field="id"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-4 px-4 text-left">
                  <SortableHeader
                    label="Client"
                    field="client"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-4 px-4 text-left">
                  <SortableHeader
                    label="Scheduled"
                    field="date"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-4 px-4 text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    Location
                  </span>
                </th>
                <th className="py-4 px-4 text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    Tags
                  </span>
                </th>
                <th className="py-4 px-4 text-left">
                  <SortableHeader
                    label="Status"
                    field="status"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-4 px-4 text-left">
                  <SortableHeader
                    label="Revenue"
                    field="revenue"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="py-4 px-4 text-left w-28">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
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
                  tagItems={tagItems}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
          <span className="text-sm text-slate-500">
            {selectedJobs.length > 0 ? (
              <span className="text-blue-400 font-medium">
                {selectedJobs.length} of {jobs.length} selected
              </span>
            ) : (
              <span>{jobs.length} jobs</span>
            )}
          </span>
          <div className="text-xs text-slate-600">
            Sorted by {sortField} ({sortDirection === 'asc' ? 'ascending' : 'descending'})
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={areAllSelected}
              onCheckedChange={onSelectAllJobs}
              className="border-slate-600 data-[state=checked]:bg-blue-500"
            />
            <span className="text-sm text-slate-400">
              {selectedJobs.length > 0 ? (
                <span className="text-blue-400">{selectedJobs.length} selected</span>
              ) : (
                <span>{jobs.length} jobs</span>
              )}
            </span>
          </div>
        </div>
        {sortedJobs.map((job) => (
          <MobileJobCard
            key={job.id}
            job={job}
            isSelected={selectedJobs.includes(job.id)}
            onSelect={(checked) => onSelectJob(job.id, checked)}
            tagItems={tagItems}
          />
        ))}
      </div>
    </>
  );
});

JobsTableRedesigned.displayName = "JobsTableRedesigned";

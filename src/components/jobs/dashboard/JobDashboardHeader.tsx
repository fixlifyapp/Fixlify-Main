import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Copy,
  MoreHorizontal,
  ExternalLink,
  Phone,
  MessageSquare,
  Mail,
  Printer,
  Check,
  Clock,
  Loader2,
  Calendar,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useJobStatuses } from "@/hooks/useConfigItems";
import { useState } from "react";

interface JobDashboardHeaderProps {
  jobId: string;
  clientName: string;
  clientId?: string;
  jobType: string;
  status: string;
  onStatusChange: (status: string) => void;
  onCall?: () => void;
  onMessage?: () => void;
  onEmail?: () => void;
}

export const JobDashboardHeader = ({
  jobId,
  clientName,
  clientId,
  jobType,
  status,
  onStatusChange,
  onCall,
  onMessage,
  onEmail
}: JobDashboardHeaderProps) => {
  const navigate = useNavigate();
  const { items: jobStatuses, isLoading: statusesLoading } = useJobStatuses();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCopyJobId = () => {
    navigator.clipboard.writeText(jobId);
    toast.success('Job ID copied to clipboard');
  };

  const handleStatusChange = async (newStatus: string) => {
    if (status.toLowerCase() === newStatus.toLowerCase() || isUpdating) return;
    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue.toLowerCase()) {
      case "completed":
        return <Check className="h-3.5 w-3.5" />;
      case "new":
      case "scheduled":
        return <Calendar className="h-3.5 w-3.5" />;
      case "in progress":
        return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
      case "cancelled":
      case "canceled":
        return <XCircle className="h-3.5 w-3.5" />;
      case "on hold":
        return <AlertTriangle className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getStatusColor = (statusValue: string) => {
    switch (statusValue.toLowerCase()) {
      case "new":
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "in progress":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      case "cancelled":
      case "canceled":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      case "on hold":
        return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 -mx-2 sm:-mx-4 px-2 sm:px-4 py-4 mb-6 sticky top-0 z-30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left side: Back + Job Info */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/jobs')}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 -ml-2 h-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            {/* Job ID Badge */}
            <button
              onClick={handleCopyJobId}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors"
              title="Click to copy"
            >
              <span className="text-xs font-mono font-semibold text-slate-700">{jobId}</span>
              <Copy className="h-3 w-3 text-slate-500" />
            </button>

            {/* Status Badge Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs font-semibold transition-all",
                    getStatusColor(status),
                    isUpdating && "opacity-70"
                  )}
                  disabled={isUpdating || statusesLoading}
                >
                  {isUpdating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    getStatusIcon(status)
                  )}
                  <span>{status.toUpperCase()}</span>
                  <MoreHorizontal className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel className="text-xs">Change Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {jobStatuses
                  .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                  .map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onClick={() => handleStatusChange(s.name)}
                      className={cn(
                        "cursor-pointer text-sm",
                        status.toLowerCase() === s.name.toLowerCase() && "bg-slate-100"
                      )}
                    >
                      {getStatusIcon(s.name)}
                      <span className="ml-2">{s.name}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden sm:block border-l border-slate-200 pl-4 ml-1">
            <h1 className="text-sm font-semibold text-slate-900">{clientName}</h1>
            <p className="text-xs text-slate-500">{jobType}</p>
          </div>
        </div>

        {/* Right side: Quick Actions */}
        <div className="flex items-center gap-2">
          {onCall && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCall}
              className="h-8 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Phone className="h-3.5 w-3.5 mr-1.5" />
              Call
            </Button>
          )}
          {onMessage && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMessage}
              className="h-8 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Message
            </Button>
          )}
          {onEmail && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEmail}
              className="h-8 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Email
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200">
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleCopyJobId} className="cursor-pointer text-sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Job ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()} className="cursor-pointer text-sm">
                <Printer className="h-4 w-4 mr-2" />
                Print Details
              </DropdownMenuItem>
              {clientId && (
                <DropdownMenuItem onClick={() => navigate(`/clients/${clientId}`)} className="cursor-pointer text-sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Client
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile client name */}
      <div className="sm:hidden mt-3 pt-3 border-t border-slate-100">
        <h1 className="text-sm font-semibold text-slate-900">{clientName}</h1>
        <p className="text-xs text-slate-500">{jobType}</p>
      </div>
    </div>
  );
};

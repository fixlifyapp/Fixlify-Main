import { JobStatusBadge } from "./JobStatusBadge";
import {
  FileText,
  CreditCard,
  CheckCircle,
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobFinancials } from "@/hooks/useJobFinancials";
import { useState, useEffect } from "react";
import { useJobDetails } from "../context/JobDetailsContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface JobInfoSectionProps {
  job: {
    id: string;
    clientId: string;
    client: string;
    service: string;
    address: string;
    phone: string;
    email: string;
    total: number;
  };
  status: string;
  onStatusChange: (newStatus: string) => void;
  onCallClick?: () => void;
  onMessageClick?: () => void;
  onEditClient: () => void;
  clientName?: string;
  jobType?: string;
  scheduleStart?: string;
  scheduleEnd?: string;
}

export const JobInfoSection = ({
  job,
  status,
  onStatusChange,
  onCallClick,
  onMessageClick,
  onEditClient,
  clientName,
  jobType,
  scheduleStart,
  scheduleEnd
}: JobInfoSectionProps) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const { financialRefreshTrigger } = useJobDetails();

  useEffect(() => {
    if (status !== currentStatus) {
      setCurrentStatus(status);
    }
  }, [status]);

  const {
    invoiceAmount,
    balance,
    totalPaid,
    overdueAmount,
    paidInvoices,
    unpaidInvoices,
    isLoading: isLoadingFinancials,
    refreshFinancials
  } = useJobFinancials(job.id);

  useEffect(() => {
    if (financialRefreshTrigger > 0) {
      refreshFinancials();
    }
  }, [financialRefreshTrigger, refreshFinancials]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const handleAddressClick = () => {
    if (job.address) {
      const encodedAddress = encodeURIComponent(job.address);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (status === newStatus) return;
    setCurrentStatus(newStatus);
    try {
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Status change failed:', error);
      setCurrentStatus(status);
      throw error;
    }
  };

  const formatScheduleTime = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return null;
    }
  };

  if (isLoadingFinancials) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-fixlyfy/10 via-fixlyfy-light/10 to-blue-50 border border-fixlyfy/20 rounded-2xl p-6 shadow-sm">
          {/* Background blur elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-fixlyfy/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-fixlyfy-light/5 rounded-full blur-3xl" />
          <div className="relative animate-pulse space-y-4">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-fixlyfy/20 rounded-lg" />
              <div className="h-4 w-64 bg-fixlyfy/10 rounded-lg" />
            </div>
            <div className="flex gap-3 mt-4">
              <div className="h-9 w-20 bg-fixlyfy/10 rounded-lg" />
              <div className="h-9 w-24 bg-fixlyfy/10 rounded-lg" />
              <div className="h-9 w-20 bg-fixlyfy/10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Client Info Card - Fixlyfy Brand Style (matching ClientHeaderCard) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-fixlyfy/10 via-fixlyfy-light/10 to-blue-50 rounded-2xl border border-fixlyfy/20 shadow-sm">
        {/* Background blur elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fixlyfy/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-fixlyfy-light/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative p-6 space-y-5">
          {/* Header Row: Name + Status + Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {clientName || 'Unknown Client'}
              </h2>
              <JobStatusBadge
                status={currentStatus}
                onStatusChange={handleStatusChange}
                className="font-semibold text-xs"
              />
            </div>

            {/* Contact Info Row - Phone & Email */}
            {(job.phone || job.email) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {job.phone && (
                  <a
                    href={`tel:${job.phone}`}
                    className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-fixlyfy transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{job.phone}</span>
                  </a>
                )}
                {job.email && (
                  <a
                    href={`mailto:${job.email}`}
                    className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-fixlyfy transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{job.email}</span>
                  </a>
                )}
              </div>
            )}

            {/* Job Type & Schedule */}
            <p className="text-sm text-slate-600">
              {jobType && <span className="text-fixlyfy font-medium">{jobType}</span>}
              {jobType && scheduleStart && <span className="mx-2 text-slate-400">·</span>}
              {scheduleStart && <span>{formatScheduleTime(scheduleStart)}</span>}
              {!jobType && !scheduleStart && <span className="text-slate-400">Job details</span>}
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCallClick}
              className="bg-white/80 border-fixlyfy/30 text-fixlyfy hover:bg-fixlyfy/5 hover:border-fixlyfy/50 shadow-sm"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onMessageClick}
              className="bg-white/80 border-fixlyfy/30 text-fixlyfy hover:bg-fixlyfy/5 hover:border-fixlyfy/50 shadow-sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEditClient}
              className="bg-white/80 border-fixlyfy/30 text-fixlyfy hover:bg-fixlyfy/5 hover:border-fixlyfy/50 shadow-sm"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>

          {/* Address Section */}
          {job.address && (
            <button
              onClick={handleAddressClick}
              className="w-full text-left group"
            >
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-fixlyfy/20 rounded-xl p-3 transition-all duration-200 hover:bg-white/80 hover:border-fixlyfy/40 hover:shadow-sm">
                <div className="p-2 bg-fixlyfy/10 rounded-lg group-hover:bg-fixlyfy/20 transition-colors">
                  <MapPin className="h-4 w-4 text-fixlyfy" />
                </div>
                <p className="text-sm font-medium text-slate-700 flex-1 truncate">
                  {job.address}
                </p>
                <ArrowUpRight className="h-4 w-4 text-fixlyfy/50 group-hover:text-fixlyfy transition-colors flex-shrink-0" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary Cards - Client Management Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Invoice Card */}
        <div className="relative overflow-hidden bg-slate-50/80 border border-slate-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-md hover:border-slate-300">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-slate-100 rounded-xl">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              Invoice
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(invoiceAmount)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {paidInvoices > 0 || unpaidInvoices > 0
                ? `${paidInvoices} paid · ${unpaidInvoices} pending`
                : "Total Invoiced"}
            </p>
          </div>
        </div>

        {/* Received Card */}
        <div className="relative overflow-hidden bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-md hover:border-emerald-300">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Received
            </span>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(totalPaid)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {totalPaid > 0 ? "Payments Received" : "No Payments Yet"}
            </p>
          </div>
        </div>

        {/* Outstanding/Complete Card */}
        <div className={cn(
          "relative overflow-hidden border rounded-2xl p-5 transition-all duration-300 hover:shadow-md",
          balance > 0
            ? "bg-amber-50/50 border-amber-200 hover:border-amber-300"
            : "bg-sky-50/50 border-sky-200 hover:border-sky-300"
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-2.5 rounded-xl",
              balance > 0 ? "bg-amber-50" : "bg-sky-100"
            )}>
              <CheckCircle className={cn(
                "h-5 w-5",
                balance > 0 ? "text-amber-600" : "text-sky-600"
              )} />
            </div>
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              balance > 0
                ? "text-amber-600 bg-amber-50"
                : "text-sky-600 bg-sky-100"
            )}>
              {balance > 0 ? "Balance" : "Complete"}
            </span>
          </div>
          <div>
            <p className={cn(
              "text-3xl font-bold tracking-tight",
              balance > 0 ? "text-amber-600" : "text-sky-600"
            )}>
              {formatCurrency(balance)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {overdueAmount > 0
                ? `$${overdueAmount.toFixed(2)} overdue`
                : balance === 0
                ? "Fully Paid"
                : "Outstanding"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

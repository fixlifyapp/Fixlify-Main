import { Badge } from "@/components/ui/badge";
import { JobStatusBadge } from "./JobStatusBadge";
import { ClientContactButtons } from "./ClientContactButtons";
import { FileText, CreditCard, CheckCircle, MapPin, User, Phone, Mail, Home } from "lucide-react";
import { useJobFinancials } from "@/hooks/useJobFinancials";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useJobDetails } from "../context/JobDetailsContext";
import type { TenantInfo } from "../context/types";

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
  tenantInfo?: TenantInfo;
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
  tenantInfo
}: JobInfoSectionProps) => {
  const isMobile = useIsMobile();
  const [currentStatus, setCurrentStatus] = useState(status);
  const { financialRefreshTrigger } = useJobDetails();
  
  useEffect(() => {
    console.log('JobInfoSection: Status prop changed', { status, currentStatus });
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

  // Refresh financials when trigger changes
  useEffect(() => {
    if (financialRefreshTrigger > 0) {
      console.log('💰 Financial refresh triggered from context');
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
    console.log('JobInfoSection: Status change requested', {
      currentStatus: status,
      newStatus,
      jobId: job.id,
      hasJobStatus: 'status' in job
    });
    
    // Check if status is actually changing
    if (status === newStatus) {
      console.log('JobInfoSection: Status unchanged, skipping');
      return;
    }
    
    setCurrentStatus(newStatus);
    
    try {
      await onStatusChange(newStatus); // Pass new status
      console.log('JobInfoSection: Status change successful');
    } catch (error) {
      console.error('JobInfoSection: Status change failed, reverting', error);
      setCurrentStatus(status);
      throw error;
    }
  };

  if (isLoadingFinancials) {
    return (
      <div className="bg-gradient-to-br from-fixlyfy/5 to-fixlyfy-light/10 backdrop-blur-sm border border-fixlyfy/20 rounded-2xl p-3 sm:p-4 shadow-lg">
        <div className="space-y-3">
          <div className="h-6 sm:h-8 w-32 sm:w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 sm:h-10 w-48 sm:w-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-16 sm:h-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-16 sm:h-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-16 sm:h-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-fixlyfy/5 to-fixlyfy-light/10 backdrop-blur-sm border border-fixlyfy/20 rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="space-y-3 sm:space-y-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            {/* Status Badge Section with Client Name and Job Type */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-fixlyfy to-fixlyfy-light rounded-lg blur-sm opacity-30 transform translate-y-0.5"></div>
              <div className="relative bg-gradient-to-r from-fixlyfy to-fixlyfy-light p-3 rounded-lg shadow-lg border border-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium uppercase tracking-wide">Status</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <JobStatusBadge 
                      status={currentStatus} 
                      onStatusChange={handleStatusChange} 
                      className="bg-white/90 text-fixlyfy border-white/30 hover:bg-white shadow-md text-sm h-7 font-medium" 
                    />
                  </div>
                  {clientName && (
                    <div className="text-white text-base sm:text-lg font-semibold">
                      {clientName}
                    </div>
                  )}
                  {jobType && (
                    <div className="text-white/90 text-sm sm:text-base">
                      {jobType}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Actions - Now properly positioned */}
          <div className="bg-fixlyfy/5 border border-fixlyfy/20 rounded-lg p-2 shadow-sm w-full sm:w-auto">
            <ClientContactButtons onCallClick={onCallClick} onMessageClick={onMessageClick} onEditClient={onEditClient} />
          </div>
        </div>

        {/* Job Address - Made more mobile-friendly */}
        {job.address && (
          <div
            className="bg-fixlyfy/10 border border-fixlyfy/20 rounded-xl p-3 cursor-pointer hover:bg-fixlyfy/15 transition-colors duration-200 group"
            onClick={handleAddressClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAddressClick();
              }
            }}
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-fixlyfy mt-0.5 flex-shrink-0 group-hover:text-fixlyfy-dark transition-colors" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-fixlyfy mb-1 group-hover:text-fixlyfy-dark transition-colors">Service Address</p>
                <p className="text-fixlyfy/80 font-medium leading-relaxed text-sm group-hover:text-fixlyfy-dark transition-colors break-words">
                  {job.address}
                </p>
                <p className="text-xs text-fixlyfy/60 mt-1 group-hover:text-fixlyfy-dark transition-colors">
                  Click to open in Google Maps
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tenant Contact Section - Show if tenant info exists */}
        {tenantInfo && (tenantInfo.name || tenantInfo.phone) && (
          <div className="bg-purple-50/50 border border-purple-200/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Tenant Contact</span>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                For Access
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tenantInfo.name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-900">{tenantInfo.name}</span>
                </div>
              )}
              {tenantInfo.phone && (
                <a
                  href={`tel:${tenantInfo.phone}`}
                  className="flex items-center gap-2 hover:bg-purple-100 rounded-md px-2 py-1 -mx-2 transition-colors"
                >
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 hover:underline">{tenantInfo.phone}</span>
                </a>
              )}
              {tenantInfo.email && (
                <a
                  href={`mailto:${tenantInfo.email}`}
                  className="flex items-center gap-2 hover:bg-purple-100 rounded-md px-2 py-1 -mx-2 transition-colors"
                >
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 hover:underline truncate">{tenantInfo.email}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Financial Cards - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Invoice Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Invoice
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-lg sm:text-xl font-bold text-blue-900 break-words">
                {formatCurrency(invoiceAmount)}
              </div>
              {(paidInvoices > 0 || unpaidInvoices > 0) && (
                <div className="text-xs text-blue-700 font-medium">
                  {paidInvoices} paid • {unpaidInvoices} pending
                </div>
              )}
            </div>
          </div>

          {/* Received Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Received
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-lg sm:text-xl font-bold text-green-900 break-words">
                {formatCurrency(totalPaid)}
              </div>
              {totalPaid > 0 && (
                <div className="text-xs text-green-700 font-medium">
                  Payment received
                </div>
              )}
            </div>
          </div>
          
          {/* Outstanding/Complete Card */}
          <div className={`${balance > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"} border rounded-lg p-3 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-md ${balance > 0 ? "bg-amber-100" : "bg-emerald-100"}`}>
                <CheckCircle className={`h-4 w-4 ${balance > 0 ? "text-amber-600" : "text-emerald-600"}`} />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${balance > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                {balance > 0 ? "Outstanding" : "Complete"}
              </span>
            </div>
            <div className="space-y-1">
              <div className={`text-lg sm:text-xl font-bold ${balance > 0 ? "text-amber-900" : "text-emerald-900"} break-words`}>
                {formatCurrency(balance)}
              </div>
              {overdueAmount > 0 ? (
                <div className="text-xs text-red-600 font-medium">
                  ${overdueAmount.toFixed(2)} overdue
                </div>
              ) : balance === 0 ? (
                <div className="text-xs text-emerald-700 font-medium">
                  Fully paid
                </div>
              ) : (
                <div className="text-xs text-amber-700 font-medium">
                  Payment pending
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

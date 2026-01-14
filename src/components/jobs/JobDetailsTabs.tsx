import { useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  CreditCard,
  History,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface JobProgressStep {
  key: 'estimate' | 'invoice' | 'payment';
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
  count?: number;
}

interface JobDetailsTabsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children?: React.ReactNode;
  onEstimateTabClick?: () => void;
  // Progress tracking props
  estimateCount?: number;
  invoiceCount?: number;
  paymentCount?: number;
  hasApprovedEstimate?: boolean;
  hasSentInvoice?: boolean;
  hasPayments?: boolean;
  outstandingBalance?: number;
  // Financial summary props
  pendingEstimateCount?: number;
  approvedEstimateTotal?: number;
  totalInvoiceAmount?: number;
  totalPaidAmount?: number;
}

// Progress indicator showing job workflow status
const JobProgressIndicator = ({
  steps,
  isMobile
}: {
  steps: JobProgressStep[];
  isMobile: boolean;
}) => {
  const getStatusIcon = (status: JobProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-amber-500 animate-pulse" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-slate-300" />;
    }
  };

  const getStatusColor = (status: JobProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-amber-500';
      default:
        return 'bg-slate-200';
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-center gap-1 py-2 px-3 bg-slate-50 rounded-lg border border-slate-200",
      isMobile ? "flex-wrap" : ""
    )}>
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className="flex items-center gap-1.5">
            {getStatusIcon(step.status)}
            <span className={cn(
              "text-xs font-medium",
              step.status === 'completed' && "text-green-700",
              step.status === 'in_progress' && "text-amber-700",
              step.status === 'pending' && "text-slate-400"
            )}>
              {step.label}
            </span>
            {step.count !== undefined && step.count > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "h-5 px-1.5 text-[10px]",
                  step.status === 'completed' && "bg-green-100 text-green-700",
                  step.status === 'in_progress' && "bg-amber-100 text-amber-700",
                  step.status === 'pending' && "bg-slate-100 text-slate-500"
                )}
              >
                {step.count}
              </Badge>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "h-0.5 mx-2 transition-colors",
              isMobile ? "w-4" : "w-8",
              step.status === 'completed' ? getStatusColor('completed') : "bg-slate-200"
            )} />
          )}
        </div>
      ))}
    </div>
  );
};

// Format currency for display
const formatCurrency = (amount: number): string => {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toFixed(0)}`;
};

export const JobDetailsTabs = ({
  activeTab = "overview",
  onTabChange,
  children,
  onEstimateTabClick,
  estimateCount = 0,
  invoiceCount = 0,
  paymentCount = 0,
  hasApprovedEstimate = false,
  hasSentInvoice = false,
  hasPayments = false,
  outstandingBalance = 0,
  pendingEstimateCount = 0,
  approvedEstimateTotal = 0,
  totalInvoiceAmount = 0,
  totalPaidAmount = 0
}: JobDetailsTabsProps) => {
  const isMobile = useIsMobile();
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }

    // Scroll to tabs container after content loads - consistent landing point for all tabs
    // Use setTimeout to wait for lazy content to mount
    setTimeout(() => {
      if (tabsContainerRef.current) {
        const rect = tabsContainerRef.current.getBoundingClientRect();
        const offsetTop = window.scrollY + rect.top - 16; // Small offset from top
        window.scrollTo({ top: Math.max(0, offsetTop), behavior: 'instant' });
      }
    }, 50);
  };

  // Calculate progress steps
  const progressSteps: JobProgressStep[] = [
    {
      key: 'estimate',
      label: 'Estimate',
      status: hasApprovedEstimate ? 'completed' : estimateCount > 0 ? 'in_progress' : 'pending',
      count: estimateCount
    },
    {
      key: 'invoice',
      label: 'Invoice',
      status: hasSentInvoice ? (outstandingBalance <= 0 ? 'completed' : 'in_progress') : invoiceCount > 0 ? 'in_progress' : 'pending',
      count: invoiceCount
    },
    {
      key: 'payment',
      label: 'Paid',
      status: outstandingBalance <= 0 && hasPayments ? 'completed' : hasPayments ? 'in_progress' : 'pending',
      count: paymentCount
    }
  ];

  // Generate financial badge text
  const getEstimateBadge = () => {
    if (estimateCount === 0) return null;
    if (pendingEstimateCount > 0) {
      return { text: `${pendingEstimateCount} pending`, variant: 'warning' as const };
    }
    if (approvedEstimateTotal > 0) {
      return { text: formatCurrency(approvedEstimateTotal), variant: 'success' as const };
    }
    return { text: String(estimateCount), variant: 'default' as const };
  };

  const getInvoiceBadge = () => {
    if (invoiceCount === 0) return null;
    if (outstandingBalance > 0) {
      return { text: `${formatCurrency(outstandingBalance)} due`, variant: 'warning' as const };
    }
    if (totalInvoiceAmount > 0) {
      return { text: formatCurrency(totalInvoiceAmount), variant: 'success' as const };
    }
    return { text: String(invoiceCount), variant: 'default' as const };
  };

  const getPaymentBadge = () => {
    if (paymentCount === 0) return null;
    if (totalPaidAmount > 0) {
      return { text: formatCurrency(totalPaidAmount), variant: 'success' as const };
    }
    return { text: String(paymentCount), variant: 'default' as const };
  };

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      mobileLabel: "Overview",
      icon: LayoutDashboard,
      badge: null
    },
    {
      value: "estimates",
      label: "Estimates",
      mobileLabel: "Quotes",
      icon: FileText,
      badge: getEstimateBadge()
    },
    {
      value: "invoices",
      label: "Invoices",
      mobileLabel: "Bills",
      icon: Receipt,
      badge: getInvoiceBadge(),
      alert: outstandingBalance > 0
    },
    {
      value: "payments",
      label: "Payments",
      mobileLabel: "Pay",
      icon: CreditCard,
      badge: getPaymentBadge()
    },
    {
      value: "history",
      label: "History",
      mobileLabel: "Log",
      icon: History,
      badge: null
    },
  ];

  return (
    <div ref={tabsContainerRef} className="mb-4 sm:mb-6 space-y-3">
      {/* Progress Indicator - Shows workflow status */}
      <JobProgressIndicator steps={progressSteps} isMobile={isMobile} />

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Enhanced Tabs with badges and mobile scroll */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className={cn(
            "overflow-x-auto scrollbar-hide",
            isMobile && "-mx-1"
          )}>
            <TabsList className={cn(
              "bg-transparent p-0 h-auto border-b border-slate-200 rounded-none flex",
              isMobile ? "min-w-max w-full" : "w-full"
            )}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "relative flex items-center justify-center gap-1.5",
                      isMobile ? "px-3 py-3 text-xs min-w-[70px]" : "flex-1 px-4 py-4 text-sm",
                      "font-medium transition-all duration-200",
                      "border-b-2 -mb-[1px] rounded-none",
                      isActive
                        ? "border-violet-500 text-violet-600 bg-violet-50/50"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                      "data-[state=active]:shadow-none"
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn(
                        "flex-shrink-0",
                        isMobile ? "h-4 w-4" : "h-4 w-4"
                      )} />
                      {/* Alert dot for outstanding balance */}
                      {tab.alert && !isActive && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>

                    <span className={isMobile ? "text-[11px]" : ""}>
                      {isMobile ? tab.mobileLabel : tab.label}
                    </span>

                    {/* Badge with financial summary */}
                    {tab.badge !== null && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-5 min-w-[20px] px-1.5 text-[10px] font-semibold whitespace-nowrap",
                          isActive
                            ? "bg-violet-200 text-violet-700"
                            : tab.badge.variant === 'warning'
                            ? "bg-amber-100 text-amber-700"
                            : tab.badge.variant === 'success'
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {tab.badge.text}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        {children}
      </Tabs>
    </div>
  );
};

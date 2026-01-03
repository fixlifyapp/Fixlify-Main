import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Printer,
  Share2,
  CheckCircle,
  CreditCard,
  FileText,
  Receipt,
  Clock,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AccessibilityControls } from './AccessibilityControls';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export type DocumentType = 'estimate' | 'invoice';
export type DocumentStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'pending'
  | 'paid'
  | 'partial'
  | 'overdue';

// Helper function to validate and normalize status strings
export function normalizeDocumentStatus(status: string | undefined): DocumentStatus | undefined {
  if (!status) return undefined;
  const validStatuses: DocumentStatus[] = [
    'draft', 'sent', 'viewed', 'accepted', 'declined',
    'expired', 'pending', 'paid', 'partial', 'overdue'
  ];
  const normalized = status.toLowerCase() as DocumentStatus;
  return validStatuses.includes(normalized) ? normalized : undefined;
}

interface PortalActionBarProps {
  documentType: DocumentType;
  documentNumber: string;
  status?: DocumentStatus | string;
  companyName?: string;
  balance?: number;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  primaryActionDisabled?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  children?: ReactNode;
}

const STATUS_CONFIG: Record<DocumentStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
  icon?: typeof CheckCircle;
}> = {
  draft: {
    label: 'Draft',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  },
  sent: {
    label: 'Sent',
    variant: 'secondary',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
  },
  viewed: {
    label: 'Viewed',
    variant: 'secondary',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
  },
  accepted: {
    label: 'Accepted',
    variant: 'default',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    icon: CheckCircle
  },
  declined: {
    label: 'Declined',
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
  },
  expired: {
    label: 'Expired',
    variant: 'secondary',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    icon: Clock
  },
  pending: {
    label: 'Pending',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
  },
  paid: {
    label: 'Paid',
    variant: 'default',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    icon: CheckCircle
  },
  partial: {
    label: 'Partial',
    variant: 'secondary',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
  },
  overdue: {
    label: 'Overdue',
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    icon: AlertTriangle
  },
};

export function PortalActionBar({
  documentType,
  documentNumber,
  status,
  companyName,
  balance,
  onPrimaryAction,
  primaryActionLabel,
  primaryActionDisabled = false,
  showBackButton = false,
  onBack,
  children,
}: PortalActionBarProps) {
  const { toast } = useToast();
  const isEstimate = documentType === 'estimate';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info('PDF download feature coming soon. You can print this page using your browser print function.');
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${isEstimate ? 'Estimate' : 'Invoice'} #${documentNumber}`,
      text: `View ${isEstimate ? 'estimate' : 'invoice'} from ${companyName || 'our company'}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  // Normalize status to ensure it's a valid DocumentStatus
  const normalizedStatus = normalizeDocumentStatus(status);
  const statusConfig = normalizedStatus ? STATUS_CONFIG[normalizedStatus] : null;
  const StatusIcon = statusConfig?.icon;

  // Determine default primary action label
  const defaultPrimaryLabel = isEstimate
    ? 'Accept Estimate'
    : balance && balance > 0
      ? `Pay $${balance.toFixed(2)}`
      : 'Pay Now';

  const showPrimaryAction = onPrimaryAction && (
    isEstimate
      ? normalizedStatus !== 'accepted' && normalizedStatus !== 'declined' && normalizedStatus !== 'expired'
      : normalizedStatus !== 'paid' && balance && balance > 0
  );

  return (
    <header
      className={cn(
        'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
        'sticky top-0 z-50 print:hidden',
        'shadow-sm'
      )}
      role="banner"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4 gap-2">
          {/* Left side - Document info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="flex-shrink-0 -ml-2"
                aria-label="Go back"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            <div className={cn(
              'flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center',
              isEstimate
                ? 'bg-purple-100 dark:bg-purple-900/30'
                : 'bg-green-100 dark:bg-green-900/30'
            )}>
              {isEstimate ? (
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              ) : (
                <Receipt className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {isEstimate ? 'Estimate' : 'Invoice'} #{documentNumber}
              </h1>
              {statusConfig && (
                <Badge
                  className={cn(
                    'mt-0.5 text-xs font-medium px-2 py-0 h-5',
                    statusConfig.className
                  )}
                >
                  {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                  {statusConfig.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Primary CTA - Prominent on mobile */}
            {showPrimaryAction && (
              <Button
                onClick={onPrimaryAction}
                disabled={primaryActionDisabled}
                size="sm"
                className={cn(
                  'font-medium shadow-sm',
                  isEstimate
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                )}
                aria-label={primaryActionLabel || defaultPrimaryLabel}
              >
                {isEstimate ? (
                  <CheckCircle className="h-4 w-4 sm:mr-1.5" />
                ) : (
                  <CreditCard className="h-4 w-4 sm:mr-1.5" />
                )}
                <span className="hidden sm:inline">
                  {primaryActionLabel || defaultPrimaryLabel}
                </span>
              </Button>
            )}

            {/* Secondary actions */}
            <div className="hidden sm:flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                title="Share"
                aria-label="Share document"
              >
                <Share2 className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden lg:inline">Share</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                title="Print"
                aria-label="Print document"
              >
                <Printer className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden lg:inline">Print</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Download PDF"
                aria-label="Download PDF"
              >
                <Download className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden lg:inline">Download</span>
              </Button>
            </div>

            {/* Mobile action menu trigger - visible only on small screens */}
            <div className="flex sm:hidden items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                title="Share"
                className="h-9 w-9"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrint}
                title="Print"
                className="h-9 w-9"
                aria-label="Print"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>

            {/* Accessibility controls */}
            <div className="hidden sm:flex items-center gap-1.5 border-l border-gray-200 dark:border-gray-700 pl-2 ml-1">
              <ThemeToggle />
              <AccessibilityControls />
            </div>

            {children}
          </div>
        </div>
      </div>
    </header>
  );
}

import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  FileQuestion,
  RefreshCw,
  Home,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ErrorType = 'not_found' | 'expired' | 'access_denied' | 'generic';

interface PortalErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  supportEmail?: string;
  className?: string;
}

const ERROR_CONFIG: Record<ErrorType, {
  icon: typeof AlertCircle;
  defaultTitle: string;
  defaultMessage: string;
  iconBgClass: string;
  iconClass: string;
}> = {
  not_found: {
    icon: FileQuestion,
    defaultTitle: 'Document Not Found',
    defaultMessage: 'The document you are looking for does not exist or has been removed.',
    iconBgClass: 'bg-gray-100 dark:bg-gray-800',
    iconClass: 'text-gray-500 dark:text-gray-400',
  },
  expired: {
    icon: AlertCircle,
    defaultTitle: 'Document Expired',
    defaultMessage: 'This document link has expired. Please contact us to request a new link.',
    iconBgClass: 'bg-orange-100 dark:bg-orange-900/30',
    iconClass: 'text-orange-500 dark:text-orange-400',
  },
  access_denied: {
    icon: AlertCircle,
    defaultTitle: 'Access Denied',
    defaultMessage: 'You do not have permission to view this document.',
    iconBgClass: 'bg-red-100 dark:bg-red-900/30',
    iconClass: 'text-red-500 dark:text-red-400',
  },
  generic: {
    icon: AlertCircle,
    defaultTitle: 'Something Went Wrong',
    defaultMessage: 'We encountered an error loading this document. Please try again.',
    iconBgClass: 'bg-red-100 dark:bg-red-900/30',
    iconClass: 'text-red-500 dark:text-red-400',
  },
};

export function PortalErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  supportEmail,
  className,
}: PortalErrorStateProps) {
  const config = ERROR_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-4',
        'bg-gray-50 dark:bg-gray-950',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 sm:p-12 text-center">
          {/* Icon */}
          <div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6',
              config.iconBgClass
            )}
          >
            <Icon className={cn('h-10 w-10', config.iconClass)} />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {title || config.defaultTitle}
          </h1>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {message || config.defaultMessage}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="w-full sm:w-auto"
                aria-label="Try loading the document again"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}

            {supportEmail && (
              <Button
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <a href={`mailto:${supportEmail}`} aria-label={`Contact support at ${supportEmail}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </a>
              </Button>
            )}
          </div>

          {/* Support info */}
          {supportEmail && (
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
              Need help? Email us at{' '}
              <a
                href={`mailto:${supportEmail}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {supportEmail}
              </a>
            </p>
          )}
        </div>

        {/* Powered by footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-600">
            Powered by{' '}
            <span className="font-medium text-purple-600 dark:text-purple-400">
              Fixlify
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

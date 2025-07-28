import { ReactNode } from 'react';
import { Loader2, Eye, FileText, Receipt, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UniversalPortalLayoutProps {
  children: ReactNode;
  loading?: boolean;
  error?: string;
  documentType?: 'estimate' | 'invoice' | null;
  documentNumber?: string;
  onRetry?: () => void;
}

export function UniversalPortalLayout({
  children,
  loading = false,
  error,
  documentType,
  documentNumber,
  onRetry
}: UniversalPortalLayoutProps) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">
            Loading {documentType || 'document'}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Error
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!documentType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Document Not Found
            </h2>
            <p className="text-gray-600">
              The document you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Document header with icon */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {documentType === 'estimate' ? (
              <FileText className="h-6 w-6 text-purple-600" />
            ) : (
              <Receipt className="h-6 w-6 text-green-600" />
            )}
            <h1 className="text-lg font-semibold text-gray-900 capitalize">
              {documentType} {documentNumber && `#${documentNumber}`}
            </h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      {children}
    </div>
  );
}
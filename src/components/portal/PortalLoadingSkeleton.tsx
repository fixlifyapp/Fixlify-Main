import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PortalLoadingSkeletonProps {
  documentType?: 'estimate' | 'invoice';
}

export function PortalLoadingSkeleton({ documentType = 'estimate' }: PortalLoadingSkeletonProps) {
  const accentColor = documentType === 'estimate' ? 'bg-purple-500' : 'bg-green-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Skeleton className={cn('w-10 h-10 rounded-lg', accentColor, 'opacity-20')} />
              <div>
                <Skeleton className="h-5 w-32 mb-1.5" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 hidden sm:block" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          {/* Header gradient area */}
          <div className={cn('p-6 sm:p-8', accentColor, 'opacity-10')}>
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-8 w-32 mb-3 bg-gray-300 dark:bg-gray-700" />
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-24 bg-gray-300 dark:bg-gray-700" />
                  <Skeleton className="h-5 w-28 bg-gray-300 dark:bg-gray-700" />
                </div>
              </div>
              <Skeleton className="h-16 w-16 rounded-xl bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>

          {/* Company/Client info skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-4" />
                <Skeleton className="h-6 w-40 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>

          {/* Items table skeleton */}
          <div className="px-6 sm:px-8 py-6 border-t border-gray-100 dark:border-gray-800">
            <Skeleton className="h-4 w-16 mb-4" />
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              {/* Table rows */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="col-span-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <Skeleton className="h-4 w-8 mx-auto" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Totals skeleton */}
          <div className="px-6 sm:px-8 py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer skeleton */}
          <div className={cn('p-6 sm:p-8', accentColor, 'opacity-10')}>
            <div className="text-center">
              <Skeleton className="h-4 w-64 mx-auto mb-2 bg-gray-300 dark:bg-gray-700" />
              <Skeleton className="h-3 w-48 mx-auto bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        Loading {documentType} details...
      </div>
    </div>
  );
}

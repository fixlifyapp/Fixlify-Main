
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { lazy, Suspense } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Lazy load the toast functionality for performance
const LazyToaster = lazy(() => Promise.resolve({ default: Sonner }))

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Suspense fallback={null}>
      <LazyToaster
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        position="top-center"
        expand={false}
        visibleToasts={2}
        closeButton={true}
        richColors={false}
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-sm group-[.toaster]:rounded-md group-[.toaster]:p-2 group-[.toaster]:max-w-xs group-[.toaster]:w-full group-[.toaster]:mx-auto",
            description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-xs group-[.toast]:px-1.5 group-[.toast]:py-0.5 group-[.toast]:rounded",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:px-1.5 group-[.toast]:py-0.5 group-[.toast]:rounded",
            success:
              "group toast success-toast group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200 group-[.toaster]:text-green-800",
            error:
              "group toast error-toast group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200 group-[.toaster]:text-red-800",
            warning:
              "group toast warning-toast group-[.toaster]:bg-yellow-50 group-[.toaster]:border-yellow-200 group-[.toaster]:text-yellow-800",
            info:
              "group toast info-toast group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-800",
          },
          duration: 2000, // 2 seconds
          style: {
            fontSize: '13px',
            padding: '8px 12px',
            maxWidth: '320px',
            minHeight: 'auto',
          }
        }}
        {...props}
      />
    </Suspense>
  )
}

// Notification batching system with faster batching for 2-second toasts
class NotificationBatcher {
  private batchTimeout: NodeJS.Timeout | null = null;
  private pendingNotifications: Array<{
    type: string;
    message: string;
    options?: any;
  }> = [];
  private readonly BATCH_DELAY = 50; // Faster batching for shorter toasts
  private readonly MAX_BATCH_SIZE = 3; // Fewer toasts at once

  addNotification(type: string, message: string, options?: any) {
    this.pendingNotifications.push({ type, message, options });
    
    if (this.pendingNotifications.length >= this.MAX_BATCH_SIZE) {
      this.flushBatch();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flushBatch(), this.BATCH_DELAY);
    }
  }

  private flushBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.pendingNotifications.length === 0) return;

    // Group similar notifications
    const grouped = this.pendingNotifications.reduce((acc, notif) => {
      const key = `${notif.type}_${notif.message}`;
      if (!acc[key]) {
        acc[key] = { ...notif, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, any>);

    // Show batched notifications
    Object.values(grouped).forEach((notif: any) => {
      const message = notif.count > 1 ? `${notif.message} (${notif.count}x)` : notif.message;
      this.showNotification(notif.type, message, notif.options);
    });

    this.pendingNotifications = [];
  }

  private showNotification(type: string, message: string, options?: any) {
    import('sonner').then(({ toast }) => {
      switch (type) {
        case 'success':
          toast.success(message, options);
          break;
        case 'error':
          toast.error(message, options);
          break;
        case 'warning':
          toast.warning(message, options);
          break;
        case 'info':
        default:
          toast.info(message, options);
          break;
      }
    });
  }
}

// Global batcher instance
const notificationBatcher = new NotificationBatcher();

// Enhanced toast with error throttling and performance optimizations
const lastErrorTime = new Map<string, number>();
const ERROR_THROTTLE_MS = 15000; // Reduced from 30 seconds
const MAX_NOTIFICATIONS_IN_MEMORY = 30; // Reduced memory usage

// Auto-cleanup old notifications
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of lastErrorTime.entries()) {
    if (now - timestamp > ERROR_THROTTLE_MS * 2) {
      lastErrorTime.delete(key);
    }
  }
  
  // Limit memory usage
  if (lastErrorTime.size > MAX_NOTIFICATIONS_IN_MEMORY) {
    const oldestKeys = Array.from(lastErrorTime.entries())
      .sort(([, a], [, b]) => a - b)
      .slice(0, lastErrorTime.size - MAX_NOTIFICATIONS_IN_MEMORY)
      .map(([key]) => key);
    
    oldestKeys.forEach(key => lastErrorTime.delete(key));
  }
}, 30000); // Cleanup every 30 seconds

const customToast = {
  success: (message: string | React.ReactNode, options?: any) => {
    notificationBatcher.addNotification('success', String(message), options);
    return { id: '', dismiss: () => {} };
  },
  error: (message: string | React.ReactNode, options?: any) => {
    const messageKey = typeof message === 'string' ? message : 'error';
    const now = Date.now();
    
    // Throttle duplicate errors
    if (lastErrorTime.has(messageKey)) {
      const lastTime = lastErrorTime.get(messageKey)!;
      if (now - lastTime < ERROR_THROTTLE_MS) {
        return { id: '', dismiss: () => {} };
      }
    }
    
    lastErrorTime.set(messageKey, now);
    
    notificationBatcher.addNotification('error', String(message), {
      ...options,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    });
    
    return { id: '', dismiss: () => {} };
  },
  info: (message: string | React.ReactNode, options?: any) => {
    notificationBatcher.addNotification('info', String(message), options);
    return { id: '', dismiss: () => {} };
  },
  warning: (message: string | React.ReactNode, options?: any) => {
    notificationBatcher.addNotification('warning', String(message), options);
    return { id: '', dismiss: () => {} };
  }
}

// Create enhanced toast function
export { Toaster }
export const toast = Object.assign(
  (message: string | React.ReactNode) => customToast.info(message),
  customToast
);

export const enhancedToast = toast;

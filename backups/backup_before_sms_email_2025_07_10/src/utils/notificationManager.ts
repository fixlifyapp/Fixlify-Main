/**
 * Notification Manager - Prevents duplicate toast notifications
 */

import { toast } from "sonner";

interface NotificationConfig {
  preventDuplicates?: boolean;
  debounceTime?: number;
}

class NotificationManager {
  private recentNotifications = new Map<string, number>();
  private defaultConfig: NotificationConfig = {
    preventDuplicates: true,
    debounceTime: 1000 // Reduced from 2 seconds to 1 second
  };

  private shouldShowNotification(message: string, config: NotificationConfig): boolean {
    if (!config.preventDuplicates) return true;

    const now = Date.now();
    const lastShown = this.recentNotifications.get(message);
    
    if (lastShown && (now - lastShown) < (config.debounceTime || this.defaultConfig.debounceTime!)) {
      console.log(`🚫 Duplicate notification prevented: "${message}"`);
      return false;
    }

    this.recentNotifications.set(message, now);
    
    // Clean up old entries
    this.cleanupOldNotifications();
    
    return true;
  }

  private cleanupOldNotifications() {
    const now = Date.now();
    const maxAge = 30000; // 30 seconds
    
    for (const [message, timestamp] of this.recentNotifications.entries()) {
      if (now - timestamp > maxAge) {
        this.recentNotifications.delete(message);
      }
    }
  }

  success(message: string, options?: any, config?: NotificationConfig) {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    if (this.shouldShowNotification(message, finalConfig)) {
      console.log(`✅ Showing success notification: "${message}"`);
      return toast.success(message, options);
    }
  }

  error(message: string, options?: any, config?: NotificationConfig) {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    if (this.shouldShowNotification(message, finalConfig)) {
      console.log(`❌ Showing error notification: "${message}"`);
      return toast.error(message, options);
    }
  }

  info(message: string, options?: any, config?: NotificationConfig) {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    if (this.shouldShowNotification(message, finalConfig)) {
      console.log(`ℹ️ Showing info notification: "${message}"`);
      return toast.info(message, options);
    }
  }

  warning(message: string, options?: any, config?: NotificationConfig) {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    if (this.shouldShowNotification(message, finalConfig)) {
      console.log(`⚠️ Showing warning notification: "${message}"`);
      return toast.warning(message, options);
    }
  }

  // Force show notification regardless of duplicates
  forceShow = {
    success: (message: string, options?: any) => {
      console.log(`✅ Force showing success notification: "${message}"`);
      return toast.success(message, options);
    },
    error: (message: string, options?: any) => {
      console.log(`❌ Force showing error notification: "${message}"`);
      return toast.error(message, options);
    },
    info: (message: string, options?: any) => {
      console.log(`ℹ️ Force showing info notification: "${message}"`);
      return toast.info(message, options);
    },
    warning: (message: string, options?: any) => {
      console.log(`⚠️ Force showing warning notification: "${message}"`);
      return toast.warning(message, options);
    }
  };

  // Clear all cached notifications
  clear() {
    this.recentNotifications.clear();
    console.log('🧹 Notification cache cleared');
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Convenience exports for common notifications
export const showSuccess = (message: string, options?: any) => 
  notificationManager.success(message, options);

export const showError = (message: string, options?: any) => 
  notificationManager.error(message, options);

export const showInfo = (message: string, options?: any) => 
  notificationManager.info(message, options);

export const showWarning = (message: string, options?: any) => 
  notificationManager.warning(message, options); 
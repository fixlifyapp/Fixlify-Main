import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export const useAutomationTriggers = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Delay initialization to avoid blocking page load
    const timer = setTimeout(() => {
      import('@/services/automation-trigger-service').then(({ AutomationTriggerService }) => {
        try {
          AutomationTriggerService.initialize(user.id);
        } catch (error) {
          console.error('Failed to initialize automation triggers:', error);
        }
      }).catch(error => {
        console.error('Failed to load automation trigger service:', error);
      });
    }, 1000);

    // Cleanup on unmount or user change
    return () => {
      clearTimeout(timer);
      import('@/services/automation-trigger-service').then(({ AutomationTriggerService }) => {
        try {
          AutomationTriggerService.cleanup();
        } catch (error) {
          console.error('Failed to cleanup automation triggers:', error);
        }
      }).catch(() => {
        // Ignore cleanup errors
      });
    };
  }, [user?.id]);
};

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AutomationTriggerService } from '@/services/automation-trigger-service';

export const useAutomationTriggers = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Initialize automation triggers
    AutomationTriggerService.initialize(user.id);

    // Cleanup on unmount or user change
    return () => {
      AutomationTriggerService.cleanup();
    };
  }, [user?.id]);
};

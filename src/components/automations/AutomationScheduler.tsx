import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { automationTrigger } from '@/services/automation-trigger';

export function AutomationScheduler() {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    // Schedule time-based triggers
    automationTrigger.scheduleTimeTriggers();

    // No need to set up additional interval as scheduleTimeTriggers handles its own intervals

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  return null;
}

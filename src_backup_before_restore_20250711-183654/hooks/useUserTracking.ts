
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface TrackActionParams {
  actionType: string;
  element?: string;
  context?: Record<string, any>;
}

export const useUserTracking = () => {
  const { user } = useAuth();
  const location = useLocation();

  const trackAction = useCallback(async ({ actionType, element, context = {} }: TrackActionParams) => {
    if (!user) return;

    try {
      await supabase
        .from('user_actions')
        .insert({
          user_id: user.id,
          action_type: actionType,
          page: location.pathname,
          element: element || null,
          context: {
            ...context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        });
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  }, [user, location.pathname]);

  // Track page views
  useEffect(() => {
    if (user) {
      trackAction({
        actionType: 'page_view',
        context: {
          referrer: document.referrer,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      });
    }
  }, [location.pathname, user, trackAction]);

  return { trackAction };
};

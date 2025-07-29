import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { organizationContext } from '@/services/organizationContext';

/**
 * Hook to provide organization context throughout the app
 */
export const useOrganizationContext = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeContext = async () => {
      if (user?.id) {
        await organizationContext.initialize(user.id);
        setIsInitialized(true);
      } else {
        organizationContext.clear();
        setIsInitialized(false);
      }
    };

    initializeContext();
  }, [user?.id, profile?.organization_id]);

  return {
    organizationId: organizationContext.getOrganizationId(),
    userId: organizationContext.getUserId(),
    isInitialized,
    getQueryFilter: () => organizationContext.getQueryFilter(),
    getFilterObject: () => organizationContext.getFilterObject(),
    applyToQuery: (query: any) => organizationContext.applyToQuery(query)
  };
};

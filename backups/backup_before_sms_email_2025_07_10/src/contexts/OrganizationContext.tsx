import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface Organization {
  id: string;
  name: string;
  industry?: string;
  settings?: any;
}

interface OrganizationContextType {
  organization: Organization | null;
  organizationId: string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Get organization data from user metadata or use user.id as fallback
  const organization: Organization | null = user ? {
    id: user.user_metadata?.organization_id || user.id,
    name: user.user_metadata?.organization_name || user.user_metadata?.company_name || 'My Organization',
    industry: user.user_metadata?.industry || user.user_metadata?.business_niche || 'general'
  } : null;

  return (
    <OrganizationContext.Provider value={{ 
      organization, 
      organizationId: organization?.id || null 
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
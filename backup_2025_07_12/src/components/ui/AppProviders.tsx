
import { ReactNode } from 'react';
import { RBACProvider } from '@/components/auth/RBACProvider';
import { SMSProvider } from '@/contexts/SMSContext';
import { GlobalRealtimeProvider } from '@/contexts/GlobalRealtimeProvider';
import { ModalProvider } from '@/components/ui/modal-provider';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { AutomationScheduler } from '@/components/automations/AutomationScheduler';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <RBACProvider>
      <GlobalRealtimeProvider>
        <OrganizationProvider>
          <SMSProvider>
            <ModalProvider>
              <AutomationScheduler />
              {children}
            </ModalProvider>
          </SMSProvider>
        </OrganizationProvider>
      </GlobalRealtimeProvider>
    </RBACProvider>
  );
};

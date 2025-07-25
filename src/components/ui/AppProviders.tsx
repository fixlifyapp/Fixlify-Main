
import { ReactNode } from 'react';
import { RBACProvider } from '@/components/auth/RBACProvider';
import { SMSProvider } from '@/contexts/SMSContext';
import { EmailProvider } from '@/contexts/EmailContext';
import { MessageProvider } from '@/contexts/MessageContext';
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
          <MessageProvider>
            <SMSProvider>
              <EmailProvider>
                <ModalProvider>
                  <AutomationScheduler />
                  {children}
                </ModalProvider>
              </EmailProvider>
            </SMSProvider>
          </MessageProvider>
        </OrganizationProvider>
      </GlobalRealtimeProvider>
    </RBACProvider>
  );
};

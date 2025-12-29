import { ReactNode } from 'react';
import { RBACProvider } from '@/components/auth/RBACProvider';
import { SMSProvider } from '@/contexts/SMSContext';
import { EmailProvider } from '@/contexts/EmailContext';
import { MessageProvider } from '@/contexts/MessageContext';
import { GlobalRealtimeProvider } from '@/contexts/GlobalRealtimeProvider';
import { ModalProvider } from '@/components/ui/modal-provider';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { GlobalCallListener } from '@/components/calling/GlobalCallListener';
// REMOVED: AutomationProcessorProvider - now handled by database triggers

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <RBACProvider>
      <GlobalRealtimeProvider>
        <OrganizationProvider>
          {/* Automation processing now handled by database triggers - no frontend dependency */}
          <MessageProvider>
            <SMSProvider>
              <EmailProvider>
                <ModalProvider>
                  {/* Global incoming call listener - shows notification popup anywhere in app */}
                  <GlobalCallListener />
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

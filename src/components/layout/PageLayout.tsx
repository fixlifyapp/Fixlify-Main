import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav } from '@/components/pwa/MobileBottomNav';
import {
  SidebarProvider,
  SidebarInset
} from '@/components/ui/sidebar';
import { useLowCreditsNotification } from '@/hooks/useLowCreditsNotification';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const isMobile = useIsMobile();

  // Show low credits notification (permission check is inside the hook)
  useLowCreditsNotification();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="layout-container">
        <AppSidebar />
        <SidebarInset className="layout-content">
          <Header />
          <main className="layout-main">
            <div className="container-responsive space-mobile pb-20 md:pb-0">
              {children}
            </div>
          </main>
          <MobileBottomNav />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
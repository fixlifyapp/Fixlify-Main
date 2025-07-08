import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  SidebarProvider,
  SidebarInset
} from '@/components/ui/sidebar';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="layout-container">
        <AppSidebar />
        <SidebarInset className="layout-content">
          <Header />
          <main className="layout-main">
            <div className="container-responsive space-mobile">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
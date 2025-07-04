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
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col w-full min-w-0 bg-background">
          <Header />
          <main className={`flex-1 w-full overflow-y-auto bg-background ${isMobile ? 'p-3' : 'px-6 py-4'}`}>
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
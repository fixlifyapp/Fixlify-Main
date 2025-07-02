
import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  SidebarProvider,
  SidebarInset
} from '@/components/ui/sidebar';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header />
          <main className={`flex-1 overflow-y-auto bg-background ${isMobile ? 'p-3' : 'p-4 lg:p-6'}`}>
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

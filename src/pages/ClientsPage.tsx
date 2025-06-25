
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Grid, List, Plus, Users, Target, Heart, TrendingUp } from "lucide-react";
import { ClientsList } from "@/components/clients/ClientsList";
import { ClientsFilters } from "@/components/clients/ClientsFilters";
import { ClientsCreateModal } from "@/components/clients/ClientsCreateModal";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useClients } from "@/hooks/useClients";

const ClientsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Show 12 clients per page for better grid layout
  
  const { 
    clients, 
    isLoading, 
    totalCount, 
    totalPages, 
    hasNextPage, 
    hasPreviousPage,
    refreshClients 
  } = useClients({ 
    page: currentPage, 
    pageSize 
  });
  
  // Set up real-time sync for clients table
  useRealtimeSync({
    tables: ['clients'],
    onUpdate: () => {
      console.log('Clients table updated, refreshing...');
      refreshClients();
    },
    enabled: true
  });

  // Listen for custom refresh events
  useEffect(() => {
    const handleCustomRefresh = () => {
      console.log('Custom refresh event triggered');
      refreshClients();
    };

    window.addEventListener('clientsRefresh', handleCustomRefresh);
    
    return () => {
      window.removeEventListener('clientsRefresh', handleCustomRefresh);
    };
  }, [refreshClients]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    refreshClients();
  };
  
  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Client Management"
          subtitle="Manage your customer database and track interactions"
          icon={Users}
          badges={[
            { text: "Relationship Building", icon: Heart, variant: "fixlyfy" },
            { text: "Growth Tracking", icon: TrendingUp, variant: "success" },
            { text: "Smart Insights", icon: Target, variant: "info" }
          ]}
          actionButton={{
            text: "Add Client",
            icon: Plus,
            onClick: () => setIsCreateModalOpen(true)
          }}
        />
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <ModernCard variant="glass" className="p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <ClientsFilters />
            <div className="flex items-center gap-2">
              <Button
                variant={isGridView ? "ghost" : "secondary"}
                size="sm"
                onClick={() => setIsGridView(false)}
                className="flex gap-2 rounded-xl"
              >
                <List size={18} /> List
              </Button>
              <Button 
                variant={isGridView ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setIsGridView(true)}
                className="flex gap-2 rounded-xl"
              >
                <Grid size={18} /> Grid
              </Button>
            </div>
          </div>
        </ModernCard>
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={300}>
        <div className="space-y-6">
          {/* Clients List */}
          <ClientsList 
            isGridView={isGridView} 
            clients={clients}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <ModernCard variant="elevated" className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} clients
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={!hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        return page === 1 || 
                               page === totalPages || 
                               Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const shouldShowEllipsis = index > 0 && page - array[index - 1] > 1;
                        
                        return (
                          <div key={page} className="flex items-center">
                            {shouldShowEllipsis && (
                              <PaginationItem>
                                <span className="px-2">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </div>
                        );
                      })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </ModernCard>
          )}
        </div>
      </AnimatedContainer>
      
      <ClientsCreateModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          // Force refresh after successful creation
          setTimeout(() => {
            refreshClients();
          }, 200);
        }}
      />
    </PageLayout>
  );
};

export default ClientsPage;

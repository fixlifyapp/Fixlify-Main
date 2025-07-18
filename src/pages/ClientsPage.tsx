import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Grid, List, Plus, Users, Target, Heart, TrendingUp, Search, Filter, Activity, UserCheck } from "lucide-react";
import { ClientsList } from "@/components/clients/ClientsList";
import { ClientsFilters } from "@/components/clients/ClientsFilters";
import { ClientsCreateModal } from "@/components/clients/ClientsCreateModal";
import { BulkActionsBar } from "@/components/clients/BulkActionsBar";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ClientsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 12;
  
  const { 
    clients, 
    isLoading, 
    totalCount, 
    totalPages, 
    hasNextPage, 
    hasPreviousPage,
    refreshClients,
    updateClient,
    deleteClient
  } = useClients({ 
    page: currentPage, 
    pageSize 
  });
  
  useRealtimeSync({
    tables: ['clients'],
    onUpdate: () => {
      console.log('Clients table updated, refreshing...');
      refreshClients();
    },
    enabled: true
  });

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

  // Clear selected clients when clients change
  useEffect(() => {
    setSelectedClients(prev => prev.filter(id => clients.some(client => client.id === id)));
  }, [clients]);

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      client.name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.toLowerCase().includes(searchLower) ||
      client.company?.toLowerCase().includes(searchLower) ||
      client.address?.toLowerCase().includes(searchLower) ||
      client.city?.toLowerCase().includes(searchLower)
    );
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    refreshClients();
  };

  const handleSelectClient = (clientId: string, isSelected: boolean) => {
    setSelectedClients(prev => 
      isSelected 
        ? [...prev, clientId]
        : prev.filter(id => id !== clientId)
    );
  };

  const handleSelectAllClients = (select: boolean) => {
    setSelectedClients(select ? filteredClients.map(client => client.id) : []);
  };

  // Bulk action handlers
  const handleBulkUpdateStatus = async (clientIds: string[], newStatus: string) => {
    try {
      await Promise.all(clientIds.map(id => updateClient(id, { status: newStatus })));
      toast.success(`Updated ${clientIds.length} clients to ${newStatus}`);
      setSelectedClients([]);
      refreshClients();
    } catch (error) {
      toast.error('Failed to update client statuses');
    }
  };

  const handleBulkDelete = async (clientIds: string[]) => {
    try {
      await Promise.all(clientIds.map(id => deleteClient(id)));
      toast.success(`Deleted ${clientIds.length} clients`);
      setSelectedClients([]);
      refreshClients();
    } catch (error) {
      toast.error('Failed to delete clients');
    }
  };

  const handleBulkExport = (clientIds: string[]) => {
    const selectedClientData = filteredClients.filter(client => clientIds.includes(client.id));
    const csvData = selectedClientData.map(client => ({
      'Name': client.name || '',
      'Email': client.email || '',
      'Phone': client.phone || '',
      'Company': client.company || '',
      'Address': client.address || '',
      'City': client.city || '',
      'State': client.state || '',
      'Zip': client.zip || '',
      'Status': client.status || 'active',
      'Created': client.created_at ? new Date(client.created_at).toLocaleDateString() : ''
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${clientIds.length} clients`);
    setSelectedClients([]);
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
        
        {/* Client Stats Summary - Improved Alignment */}
        <AnimatedContainer animation="fade-in" delay={150}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Clients */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-fixlyfy/5 to-fixlyfy/10 rounded-2xl p-5 border border-fixlyfy/20 hover:border-fixlyfy/40 hover:shadow-lg hover:shadow-fixlyfy/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-fixlyfy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-fixlyfy/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-5 w-5 text-fixlyfy" />
                  </div>
                  <span className="text-xs font-semibold text-fixlyfy/80 bg-fixlyfy/10 px-2.5 py-1 rounded-full">Total</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-foreground tracking-tight">{totalCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                </div>
              </div>
            </div>
            
            {/* Active Clients */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-2xl p-5 border border-green-500/20 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-green-600/80 bg-green-500/10 px-2.5 py-1 rounded-full">Active</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {clients?.filter(c => c.status === 'active').length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                </div>
              </div>
            </div>
            
            {/* New This Month */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-2xl p-5 border border-blue-500/20 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600/80 bg-blue-500/10 px-2.5 py-1 rounded-full">New</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {clients?.filter(c => {
                      const createdDate = new Date(c.created_at);
                      const now = new Date();
                      return createdDate.getMonth() === now.getMonth() && 
                             createdDate.getFullYear() === now.getFullYear();
                    }).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">New This Month</p>
                </div>
              </div>
            </div>
            
            {/* Total Revenue */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-2xl p-5 border border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-xs font-semibold text-purple-600/80 bg-purple-500/10 px-2.5 py-1 rounded-full">Growth</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-foreground tracking-tight">92%</p>
                  <p className="text-sm text-muted-foreground">Client Retention</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedContainer>
        
        {/* Search and Filter Bar - Better Alignment */}
        <AnimatedContainer animation="fade-in" delay={300}>
          <ModernCard variant="elevated" className="mb-6 p-4 bg-gradient-to-r from-background to-muted/5 backdrop-blur-sm shadow-lg rounded-2xl border border-border/50">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search clients by name, email, phone, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-fixlyfy transition-all duration-200 rounded-xl h-10"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "gap-2 rounded-xl transition-all duration-200 h-10 px-4",
                    showFilters && "bg-fixlyfy text-white hover:bg-fixlyfy/90 border-fixlyfy"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <div className="flex border rounded-xl overflow-hidden h-10 bg-background/50">
                  <Button
                    variant={!isGridView ? "default" : "ghost"}
                    size="default"
                    onClick={() => setIsGridView(false)}
                    className="rounded-none h-10 px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={isGridView ? "default" : "ghost"}
                    size="default"
                    onClick={() => setIsGridView(true)}
                    className="rounded-none h-10 px-3 border-l"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Animated Filters Section */}
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 overflow-hidden transition-all duration-300",
              showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
              <ClientsFilters />
            </div>
          </ModernCard>
        </AnimatedContainer>

        {/* Bulk Actions Bar */}
        {selectedClients.length > 0 && (
          <AnimatedContainer animation="fade-in">
            <BulkActionsBar
              selectedCount={selectedClients.length}
              onUpdateStatus={(status) => handleBulkUpdateStatus(selectedClients, status)}
              onDelete={() => handleBulkDelete(selectedClients)}
              onExport={() => handleBulkExport(selectedClients)}
              onClearSelection={() => setSelectedClients([])}
            />
          </AnimatedContainer>
        )}
        
        {/* Clients List */}
        <AnimatedContainer animation="fade-in" delay={450}>
          <ClientsList 
            clients={filteredClients} 
            isGridView={isGridView}
            isLoading={isLoading}
            selectedClients={selectedClients}
            onSelectClient={handleSelectClient}
            onSelectAllClients={handleSelectAllClients}
            onRefresh={handleRefresh}
          />
        </AnimatedContainer>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <AnimatedContainer animation="fade-in" delay={600}>
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={cn(
                        "cursor-pointer",
                        !hasPreviousPage && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => handlePageChange(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={cn(
                        "cursor-pointer",
                        !hasNextPage && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </AnimatedContainer>
        )}
        
        <ClientsCreateModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refreshClients();
          }}
        />
    </PageLayout>
  );
};

export default ClientsPage;
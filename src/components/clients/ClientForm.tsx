
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Import refactored components
import { ClientFormHeader } from "./client-form/ClientFormHeader";
import { ClientInsights } from "./client-form/ClientInsights";
import { ClientDetailsTab } from "./client-form/ClientDetailsTab";
import { EmptyTabContent } from "./client-form/EmptyTabContent";
import { InvoiceModal } from "./client-form/InvoiceModal";
import { PaymentsTab } from "./client-form/PaymentsTab";
import { PropertiesTab } from "./client-form/PropertiesTab";
import { ClientStatsCard } from "./ClientStatsCard";
import { ClientContactActions } from "./ClientContactActions";

// Import custom hooks
import { useClientData } from "./client-form/hooks/useClientData";
import { useInvoiceCreation } from "./client-form/hooks/useInvoiceCreation";
import { ClientJobs } from "./ClientJobs";

interface ClientFormProps {
  clientId?: string;
  onCreateJob?: () => void;
}

export const ClientForm = ({ clientId, onCreateJob }: ClientFormProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  
  // Use the custom hooks
  const {
    client,
    isLoading,
    isSaving,
    formData,
    showInsights,
    isGeneratingInsight,
    aiInsight,
    handleInputChange,
    saveChanges,
    setShowInsights
  } = useClientData(clientId);

  const {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    invoiceData,
    setInvoiceData,
    handleCreateInvoice,
    handleInvoiceSubmit
  } = useInvoiceCreation(clientId);
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 sm:p-8 text-center mx-2 sm:mx-0">
        <div className="flex flex-col items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
          <div className="text-muted-foreground">Loading client details...</div>
        </div>
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="bg-white rounded-xl shadow p-4 sm:p-8 text-center mx-2 sm:mx-0">
        <div className="text-muted-foreground">Client not found</div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/clients')}
        >
          Back to Clients
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <ClientFormHeader
          client={client}
          isSaving={isSaving}
          onCreateJob={onCreateJob || (() => {})}
          onCreateInvoice={handleCreateInvoice}
          onSaveChanges={saveChanges}
        />

        {/* Client Contact Actions */}
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <ClientContactActions client={client} />
        </div>
        
        <ClientInsights
          client={client}
          isGeneratingInsight={isGeneratingInsight}
          aiInsight={aiInsight}
          showInsights={showInsights}
          onHideInsights={() => setShowInsights(false)}
        />
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-1 w-full h-auto p-1">
            <TabsTrigger value="details" className="relative text-xs sm:text-sm py-2">
              <User size={14} className="mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Details</span>
              <span className="xs:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="relative text-xs sm:text-sm py-2">
              <span>Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="relative text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">Payments</span>
              <span className="xs:hidden">Pay</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="relative text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">Properties</span>
              <span className="xs:hidden">Props</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 sm:space-y-6">
            {/* Client Statistics */}
            {clientId && (
              <ClientStatsCard clientId={clientId} />
            )}
            
            <ClientDetailsTab 
              formData={formData}
              handleInputChange={handleInputChange}
              onSaveChanges={saveChanges}
              isSaving={isSaving}
            />
          </TabsContent>
          
          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4 sm:space-y-6">
            <ClientJobs clientId={clientId} />
          </TabsContent>
          
          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4 sm:space-y-6">
            <PaymentsTab 
              clientId={clientId} 
              onCreateInvoice={handleCreateInvoice} 
            />
          </TabsContent>
          
          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4 sm:space-y-6">
            <PropertiesTab clientId={clientId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
        clientName={client?.name || ''}
        invoiceData={invoiceData}
        setInvoiceData={setInvoiceData}
        onSubmit={handleInvoiceSubmit}
      />
    </div>
  );
};

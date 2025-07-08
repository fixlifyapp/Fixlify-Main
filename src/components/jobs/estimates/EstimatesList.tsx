
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SteppedEstimateBuilder } from "./dialogs/SteppedEstimateBuilder";
import { UnifiedDocumentViewer } from "../dialogs/UnifiedDocumentViewer";
import { formatCurrency } from "@/lib/utils";
import { Estimate } from "@/types/documents";

interface EstimatesListProps {
  jobId: string;
}

export const EstimatesList = ({ jobId }: EstimatesListProps) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEstimateDialogOpen, setIsEstimateDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  
  const fetchEstimates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("estimates")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Add compatibility properties and ensure required fields
      const processedEstimates: Estimate[] = (data || []).map(estimate => ({
        ...estimate,
        status: (estimate.status as Estimate['status']) || 'draft',
        items: Array.isArray(estimate.items) ? 
          (estimate.items as any[]).map((item: any) => ({
            id: item.id || `item-${Math.random()}`,
            description: item.description || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.unit_price || 0,
            taxable: item.taxable !== false,
            total: (item.quantity || 1) * (item.unitPrice || item.unit_price || 0)
          })) : [],
        subtotal: estimate.subtotal || 0,
        total: estimate.total || 0,
        tax_rate: estimate.tax_rate || 0,
        tax_amount: estimate.tax_amount || 0,
        discount_amount: estimate.discount_amount || 0,
        updated_at: estimate.updated_at || estimate.created_at
      }));
      
      setEstimates(processedEstimates);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      toast.error("Failed to load estimates");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEstimates();
  }, [jobId]);
  
  const handleDeleteEstimate = async (estimateId: string) => {
    try {
      const { error } = await supabase
        .from("estimates")
        .delete()
        .eq("id", estimateId);
        
      if (error) {
        throw error;
      }
      
      setEstimates(estimates.filter(est => est.id !== estimateId));
      toast.success("Estimate deleted successfully");
    } catch (error) {
      console.error("Error deleting estimate:", error);
      toast.error("Failed to delete estimate");
    }
  };

  const handleViewEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setShowViewer(true);
  };
  
  const handleNewEstimate = () => {
    setSelectedEstimate(null);
    setIsEstimateDialogOpen(true);
  };

  const handleEstimateCreated = () => {
    fetchEstimates();
  };

  const handleConvertToInvoice = async (estimate: Estimate): Promise<void> => {
    try {
      const { data, error } = await supabase.functions.invoke('convert-estimate-to-invoice', {
        body: { estimateId: estimate.id }
      });

      if (error) throw error;
      
      toast.success('Estimate converted to invoice successfully');
      fetchEstimates();
    } catch (error) {
      console.error('Error converting estimate:', error);
      toast.error('Failed to convert estimate to invoice');
      throw error;
    }
  };

  const handleDocumentUpdated = () => {
    fetchEstimates();
    setSelectedEstimate(null);
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let color = "";
    
    switch (status.toLowerCase()) {
      case "approved":
        color = "bg-green-100 text-green-800";
        break;
      case "pending":
        color = "bg-yellow-100 text-yellow-800";
        break;
      case "rejected":
        color = "bg-red-100 text-red-800";
        break;
      default:
        color = "bg-gray-200";
    }
    
    return (
      <Badge className={color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  return (
    <>
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Estimates</h3>
            <Button className="gap-2" onClick={handleNewEstimate}>
              <PlusCircle size={16} />
              New Estimate
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
            </div>
          ) : estimates.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No estimates found for this job.</p>
              <p className="mt-2">Create your first estimate to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {estimates.map((estimate) => (
                <div 
                  key={estimate.id} 
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{estimate.estimate_number}</h4>
                      {renderStatusBadge(estimate.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created on {format(new Date(estimate.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {formatCurrency(estimate.total)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewEstimate(estimate)}
                      className="gap-2"
                    >
                      <Eye size={16} />
                      View
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteEstimate(estimate.id)}
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estimate Builder Dialog */}
      <SteppedEstimateBuilder
        open={isEstimateDialogOpen}
        onOpenChange={setIsEstimateDialogOpen}
        jobId={jobId}
        onEstimateCreated={handleEstimateCreated}
      />

      {/* Unified Document Viewer */}
      {selectedEstimate && (
        <UnifiedDocumentViewer
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
          document={selectedEstimate}
          documentType="estimate"
          jobId={jobId}
          onUpdate={handleDocumentUpdated}
          onConvertToInvoice={handleConvertToInvoice}
        />
      )}
    </>
  );
};

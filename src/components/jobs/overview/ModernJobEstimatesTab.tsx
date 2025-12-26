import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Send, Trash2, Edit, DollarSign, Eye } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { useEstimateActions } from "@/components/jobs/estimates/hooks/useEstimateActions";
import { SteppedEstimateBuilder } from "@/components/jobs/dialogs/SteppedEstimateBuilder";
import { UnifiedDocumentViewer } from "@/components/jobs/dialogs/UnifiedDocumentViewer";
import { UniversalSendDialog } from "@/components/jobs/dialogs/shared/UniversalSendDialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useJobData } from "../dialogs/unified/hooks/useJobData";
import { Estimate } from "@/types/documents";

interface ModernJobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
  onTabChange?: (tab: string) => void;
}

export const ModernJobEstimatesTab = ({ 
  jobId, 
  onEstimateConverted, 
  onTabChange 
}: ModernJobEstimatesTabProps) => {
  const { estimates, isLoading, refreshEstimates, convertEstimateToInvoice } = useEstimates(jobId);
  const [estimatesState, setEstimatesState] = useState<Estimate[]>(estimates);
  const { state, actions } = useEstimateActions(jobId, estimatesState, setEstimatesState, refreshEstimates, onEstimateConverted);
  const { clientInfo, loading: jobDataLoading } = useJobData(jobId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<any>(null);
  const [previewEstimate, setPreviewEstimate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sendingEstimate, setSendingEstimate] = useState<any>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const isMobile = useIsMobile();

  // Keep estimates state in sync
  useEffect(() => {
    console.log('📊 Syncing estimates state. New count:', estimates.length);
    setEstimatesState(estimates);
  }, [estimates]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'converted': 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalEstimateValue = estimatesState.reduce((sum, estimate) => sum + (estimate.total || 0), 0);
  const pendingApproval = estimatesState.filter(est => est.status === 'sent').length;

  const handleEstimateCreated = () => {
    // Add delay to ensure database changes are committed
    setTimeout(() => {
      refreshEstimates();
    }, 500);
    setShowCreateForm(false);
    setEditingEstimate(null);
  };

  const handleEditEstimate = (estimate: any) => {
    console.log('Setting estimate for editing:', estimate);
    setEditingEstimate(estimate);
    setShowCreateForm(true);
  };

  const handleViewEstimate = (estimate: any) => {
    console.log('Setting estimate for preview:', estimate);
    setPreviewEstimate(estimate);
    setShowPreview(true);
  };

  const handleCreateNew = () => {
    setEditingEstimate(null);
    setShowCreateForm(true);
  };

  const handleDialogClose = () => {
    setShowCreateForm(false);
    setEditingEstimate(null);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setPreviewEstimate(null);
  };

  const handleDeleteEstimate = async (estimate: any) => {
    console.log('🗑️ Initiating delete for estimate:', estimate.id);
    actions.setSelectedEstimate(estimate);
    const success = await actions.confirmDeleteEstimate();
    
    if (success) {
      console.log('✅ Delete successful, estimates should be updated');
      // Force a refresh to ensure the UI is updated
      setTimeout(() => {
        refreshEstimates();
      }, 500); // Increased delay for delete operations
    }
  };

  const handleSendEstimate = (estimate: any) => {
    console.log('Sending estimate:', estimate);
    setSendingEstimate(estimate);
    setShowSendDialog(true);
  };

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    setSendingEstimate(null);
    
    // Add delay to ensure database changes are committed
    setTimeout(() => {
      refreshEstimates();
    }, 500);
    
    toast.success("Estimate sent successfully!");
  };

  const handleSendCancel = () => {
    setShowSendDialog(false);
    setSendingEstimate(null);
  };

  const handleConvertEstimate = async (estimate: any) => {
    if (!estimate) return;
    
    console.log('Converting estimate to invoice:', estimate.id);
    setIsConverting(true);
    
    try {
      const success = await convertEstimateToInvoice(estimate.id);
      
      if (success) {
        console.log('Estimate converted successfully, calling onEstimateConverted');
        // Add delay before triggering callbacks and navigation
        setTimeout(() => {
          if (onEstimateConverted) {
            onEstimateConverted();
          }
          if (onTabChange) {
            onTabChange('invoices');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error converting estimate:', error);
      toast.error("Failed to convert estimate to invoice");
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvertToInvoice = async (estimate: any) => {
    const success = await convertEstimateToInvoice(estimate.id);
    if (success && onEstimateConverted) {
      onEstimateConverted();
    }
    setShowPreview(false);
    if (onTabChange) {
      onTabChange('invoices');
    }
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-fixlyfy-border shadow-sm">
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Estimates</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{estimatesState.length}</div>
            </CardContent>
          </Card>
          
          <Card className="border-fixlyfy-border shadow-sm">
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 break-all">{formatCurrency(totalEstimateValue)}</div>
            </CardContent>
          </Card>
          
          <Card className="border-fixlyfy-border shadow-sm">
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{pendingApproval}</div>
            </CardContent>
          </Card>
        </div>

        {/* Estimates List */}
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader className="px-3 pt-3 pb-3 sm:px-6 sm:pt-6 sm:pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Estimates ({estimatesState.length})
              </CardTitle>
              <Button 
                onClick={handleCreateNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Estimate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading estimates...</p>
              </div>
            ) : estimatesState.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">No estimates yet</p>
                <p className="text-sm">Create your first estimate to get started</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {estimatesState.map((estimate) => (
                  <div key={estimate.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      {/* Left side - Estimate info */}
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-gray-900">{estimate.estimate_number}</h4>
                            {getStatusBadge(estimate.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Created: {format(new Date(estimate.created_at), 'MMM dd, yyyy')}</p>
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(estimate.total || 0)}
                        </div>
                      </div>
                      
                      {/* Right side - Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEstimate(estimate)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEstimate(estimate)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEstimate(estimate)}
                          disabled={state.isSending}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                        
                        {estimate.status !== 'converted' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleConvertEstimate(estimate)}
                            disabled={isConverting}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Convert to Invoice
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteEstimate(estimate)}
                          disabled={state.isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <SteppedEstimateBuilder
        open={showCreateForm}
        onOpenChange={handleDialogClose}
        jobId={jobId}
        existingEstimate={editingEstimate}
        onEstimateCreated={handleEstimateCreated}
      />

      {previewEstimate && (
        <UnifiedDocumentViewer
          isOpen={showPreview}
          onClose={handlePreviewClose}
          document={previewEstimate}
          documentType="estimate"
          jobId={jobId}
          onConvertToInvoice={handleConvertToInvoice}
          onUpdate={refreshEstimates}
        />
      )}

      <UniversalSendDialog
        isOpen={showSendDialog}
        onClose={handleSendCancel}
        documentType="estimate"
        documentId={sendingEstimate?.id || ''}
        documentNumber={sendingEstimate?.estimate_number || ''}
        total={sendingEstimate?.total || 0}
        contactInfo={{
          name: clientInfo?.name || 'Client',
          email: clientInfo?.email || '',
          phone: clientInfo?.phone || ''
        }}
        onSuccess={handleSendSuccess}
      />
    </>
  );
};

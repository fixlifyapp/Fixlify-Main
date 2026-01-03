import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, TrendingUp, Clock } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { useEstimateActions } from "@/components/jobs/estimates/hooks/useEstimateActions";
import { SteppedEstimateBuilder } from "@/components/jobs/dialogs/SteppedEstimateBuilder";
import { UnifiedDocumentViewer } from "@/components/jobs/dialogs/UnifiedDocumentViewer";
import { UniversalSendDialog } from "@/components/jobs/dialogs/shared/UniversalSendDialog";
import { toast } from "sonner";
import { useJobDetails } from "../context/JobDetailsContext";
import { Estimate } from "@/types/documents";
import { DocumentListItem, DocumentRowActions } from "../shared";
import { ProfessionalCard, ProfessionalSectionHeader } from "@/components/ui/professional-card";

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
  // Use context's clientInfo to avoid duplicate data fetches
  const { clientInfo } = useJobDetails();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<any>(null);
  const [previewEstimate, setPreviewEstimate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sendingEstimate, setSendingEstimate] = useState<any>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Keep estimates state in sync
  useEffect(() => {
    console.log('📊 Syncing estimates state. New count:', estimates.length);
    setEstimatesState(estimates);
  }, [estimates]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
      <div className="space-y-4">
        {/* Compact Summary Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wide">Total</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{estimatesState.length}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wide">Value</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(totalEstimateValue)}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wide">Pending</span>
            </div>
            <p className="text-lg font-bold text-amber-700">{pendingApproval}</p>
          </div>
        </div>

        {/* Estimates List */}
        <ProfessionalCard>
          <ProfessionalSectionHeader
            icon={FileText}
            title="Estimates"
            subtitle={estimatesState.length > 0 ? `${estimatesState.length} total` : undefined}
            action={
              <Button
                onClick={handleCreateNew}
                size="sm"
                className="h-8 bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create
              </Button>
            }
          />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600 mx-auto"></div>
              <p className="mt-3 text-sm text-slate-500">Loading estimates...</p>
            </div>
          ) : estimatesState.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">No estimates yet</p>
              <p className="text-xs text-slate-400 mt-1">Create your first estimate to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {estimatesState.map((estimate) => (
                <DocumentListItem
                  key={estimate.id}
                  type="estimate"
                  number={estimate.estimate_number}
                  status={estimate.status}
                  createdAt={estimate.created_at}
                  amount={estimate.total || 0}
                  actions={
                    <DocumentRowActions
                      documentType="estimate"
                      status={estimate.status}
                      onView={() => handleViewEstimate(estimate)}
                      onEdit={() => handleEditEstimate(estimate)}
                      onSend={() => handleSendEstimate(estimate)}
                      onConvert={() => handleConvertEstimate(estimate)}
                      onDelete={() => handleDeleteEstimate(estimate)}
                      isDeleting={state.isDeleting}
                      isConverting={isConverting}
                    />
                  }
                />
              ))}
            </div>
          )}
        </ProfessionalCard>
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

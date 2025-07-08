import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Send, DollarSign, Eye } from "lucide-react";
import { useEstimates } from "@/hooks/useEstimates";
import { UnifiedDocumentBuilder } from "../dialogs/UnifiedDocumentBuilder";
import { UnifiedDocumentViewer } from "../dialogs/UnifiedDocumentViewer";
import { UniversalSendDialog } from "../dialogs/shared/UniversalSendDialog";
import { formatCurrency } from "@/lib/utils";
import { Estimate } from "@/types/documents";
import { useJobs } from "@/hooks/useJobs";

interface EstimatesListProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const EstimatesList = ({ jobId, onEstimateConverted }: EstimatesListProps) => {
  const { estimates, isLoading, convertEstimateToInvoice, refreshEstimates } = useEstimates(jobId);
  const { jobs } = useJobs();
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [viewingEstimate, setViewingEstimate] = useState<Estimate | null>(null);
  const [sendingEstimate, setSendingEstimate] = useState<Estimate | null>(null);

  const job = jobs.find(j => j.id === jobId);

  const handleEdit = (estimate: Estimate) => {
    console.log('Editing estimate:', estimate.id);
    setEditingEstimate(estimate);
  };

  const handleSend = (estimate: Estimate) => {
    console.log('Sending estimate:', estimate.id);
    setSendingEstimate(estimate);
  };

  const handleView = (estimate: Estimate) => {
    console.log('Viewing estimate:', estimate.id);
    setViewingEstimate(estimate);
  };

  const handleConvert = async (estimate: Estimate) => {
    console.log('Converting estimate:', estimate.id);
    const success = await convertEstimateToInvoice(estimate.id);
    if (success && onEstimateConverted) {
      onEstimateConverted();
    }
  };

  const handleEstimateUpdated = () => {
    console.log('Estimate updated, refreshing');
    setEditingEstimate(null);
    
    // Add delay to ensure database changes are committed
    setTimeout(() => {
      refreshEstimates();
    }, 500);
  };

  const handleViewerClosed = () => {
    setViewingEstimate(null);
  };

  const handleConvertToInvoice = async (estimate: Estimate) => {
    const success = await convertEstimateToInvoice(estimate.id);
    if (success && onEstimateConverted) {
      onEstimateConverted();
    }
    setViewingEstimate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-lg mb-2">No estimates yet</div>
        <div className="text-sm">Create your first estimate to get started</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {estimates.map((estimate) => (
          <Card key={estimate.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">
                    {estimate.estimate_number || estimate.number || `EST-${estimate.id.slice(0, 8)}`}
                  </CardTitle>
                  <Badge className={getStatusColor(estimate.status)}>
                    {estimate.status || 'draft'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleView(estimate)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatCurrency(estimate.total || estimate.amount || 0)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(estimate.date || estimate.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(estimate)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSend(estimate)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </DropdownMenuItem>
                      {estimate.status !== 'converted' && (
                        <DropdownMenuItem onClick={() => handleConvert(estimate)}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Convert to Invoice
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            {estimate.notes && (
              <CardContent className="pt-0">
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {estimate.notes}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Edit Estimate Dialog */}
      <UnifiedDocumentBuilder
        open={!!editingEstimate}
        onOpenChange={(open) => !open && setEditingEstimate(null)}
        documentType="estimate"
        jobId={jobId}
        existingDocument={editingEstimate || undefined}
        onDocumentCreated={handleEstimateUpdated}
      />

      {/* Unified Document Viewer for Estimates */}
      {viewingEstimate && (
        <UnifiedDocumentViewer
          open={!!viewingEstimate}
          onOpenChange={handleViewerClosed}
          document={viewingEstimate}
          documentType="estimate"
          jobId={jobId}
          onConvertToInvoice={handleConvertToInvoice}
          onDocumentUpdated={refreshEstimates}
        />
      )}

      {/* Universal Send Dialog for Estimates */}
      <UniversalSendDialog
        isOpen={!!sendingEstimate}
        onClose={() => setSendingEstimate(null)}
        documentType="estimate"
        documentId={sendingEstimate?.id || ''}
        documentNumber={sendingEstimate?.estimate_number || sendingEstimate?.number || ''}
        total={sendingEstimate?.total || sendingEstimate?.amount || 0}
        contactInfo={{
          name: job?.client?.name || 'Client',
          email: job?.client?.email || '',
          phone: job?.client?.phone || ''
        }}
      />
    </>
  );
};

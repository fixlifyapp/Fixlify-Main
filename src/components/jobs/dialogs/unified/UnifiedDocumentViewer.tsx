// Unified Document Viewer component
export interface UnifiedDocumentViewerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  document: any;
  documentType: "estimate" | "invoice";
  jobId: string;
  onConvertToInvoice?: (estimate: any) => Promise<void>;
  onDocumentUpdated?: () => void;
}

export const UnifiedDocumentViewer = ({ 
  open = false,
  onOpenChange,
  document, 
  documentType, 
  jobId, 
  onConvertToInvoice, 
  onDocumentUpdated 
}: UnifiedDocumentViewerProps) => {
  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Document Viewer - {documentType} {document?.id}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <p>This is a placeholder for the unified document viewer.</p>
        <p>Document Type: {documentType}</p>
        <p>Job ID: {jobId}</p>
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <pre className="text-sm">{JSON.stringify(document, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
// Stub for UnifiedDocumentViewer to fix interface issues
interface UnifiedDocumentViewerProps {
  document: any;
  documentType: string;
  jobId: string;
  onConvertToInvoice?: (doc: any) => Promise<void>;
  onDocumentUpdated?: () => void;
}

export const UnifiedDocumentViewer = ({ document, documentType }: UnifiedDocumentViewerProps) => {
  return (
    <div className="p-4">
      <h3>Document Viewer</h3>
      <p>Type: {documentType}</p>
      <p>Document ID: {document?.id}</p>
    </div>
  );
};
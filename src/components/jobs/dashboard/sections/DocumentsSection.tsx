import { useState } from "react";
import { SectionCard, SectionHeader, EmptyState, CompactDocumentRow } from "../shared";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Receipt } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Document {
  id: string;
  type: "estimate" | "invoice";
  number: string;
  status: string;
  amount: number;
  balance?: number;
  createdAt: string;
}

interface DocumentsSectionProps {
  estimates: Document[];
  invoices: Document[];
  isLoading?: boolean;
  onCreateEstimate: () => void;
  onCreateInvoice: () => void;
  onViewDocument: (doc: Document) => void;
  onEditDocument?: (doc: Document) => void;
  onSendDocument?: (doc: Document) => void;
  onPayInvoice?: (doc: Document) => void;
  onConvertEstimate?: (doc: Document) => void;
  onDeleteDocument?: (doc: Document) => void;
}

export const DocumentsSection = ({
  estimates,
  invoices,
  isLoading,
  onCreateEstimate,
  onCreateInvoice,
  onViewDocument,
  onEditDocument,
  onSendDocument,
  onPayInvoice,
  onConvertEstimate,
  onDeleteDocument
}: DocumentsSectionProps) => {
  // Combine and sort documents by date
  const allDocuments: Document[] = [
    ...estimates.map(e => ({ ...e, type: "estimate" as const })),
    ...invoices.map(i => ({ ...i, type: "invoice" as const }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const estimateCount = estimates.length;
  const invoiceCount = invoices.length;
  const totalDocs = estimateCount + invoiceCount;

  if (isLoading) {
    return (
      <SectionCard>
        <SectionHeader icon={FileText} title="Documents" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <SectionHeader
        icon={FileText}
        title="Documents"
        subtitle={totalDocs > 0 ? `${estimateCount} estimates, ${invoiceCount} invoices` : undefined}
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onCreateEstimate} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2 text-slate-600" />
                New Estimate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateInvoice} className="cursor-pointer">
                <Receipt className="h-4 w-4 mr-2 text-blue-600" />
                New Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {allDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Create your first estimate or invoice"
        />
      ) : (
        <div className="space-y-2">
          {allDocuments.slice(0, 5).map((doc) => (
            <CompactDocumentRow
              key={doc.id}
              type={doc.type}
              number={doc.number}
              status={doc.status}
              amount={doc.amount}
              balance={doc.balance}
              createdAt={doc.createdAt}
              onView={() => onViewDocument(doc)}
              onEdit={onEditDocument ? () => onEditDocument(doc) : undefined}
              onSend={onSendDocument ? () => onSendDocument(doc) : undefined}
              onPay={doc.type === "invoice" && onPayInvoice ? () => onPayInvoice(doc) : undefined}
              onConvert={doc.type === "estimate" && onConvertEstimate ? () => onConvertEstimate(doc) : undefined}
              onDelete={onDeleteDocument ? () => onDeleteDocument(doc) : undefined}
            />
          ))}

          {allDocuments.length > 5 && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-slate-500 hover:text-slate-700"
              >
                View all {allDocuments.length} documents
              </Button>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
};

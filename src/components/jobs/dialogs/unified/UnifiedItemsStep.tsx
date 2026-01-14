import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LineItem, Product } from "../../builder/types";
import { ProductCatalog } from "../../builder/ProductCatalog";
import { DocumentTotalsSection } from "./components/DocumentTotalsSection";
import { DocumentLineItemsTable } from "./components/DocumentLineItemsTable";
import { NotesSection } from "./components/NotesSection";

interface UnifiedItemsStepProps {
  documentType: "estimate" | "invoice";
  documentNumber: string;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  onLineItemsChange: (items: LineItem[]) => void;
  onTaxRateChange: (rate: number) => void;
  onNotesChange: (notes: string) => void;
  onAddProduct: (product: Product) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
}

export const UnifiedItemsStep = ({
  documentType,
  documentNumber,
  lineItems,
  taxRate,
  notes,
  onLineItemsChange,
  onTaxRateChange,
  onNotesChange,
  onAddProduct,
  onRemoveLineItem,
  onUpdateLineItem,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal
}: UnifiedItemsStepProps) => {
  const [showProductDialog, setShowProductDialog] = useState(false);

  const handleProductSelect = (product: Product) => {
    onAddProduct(product);
    setShowProductDialog(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Document Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold break-words">
            {documentType === "estimate" ? "Estimate" : "Invoice"} Items
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground break-words">
            Add line items and configure pricing for this {documentType}
          </p>
        </div>
        <Button 
          onClick={() => setShowProductDialog(true)}
          className="gap-2 w-full sm:w-auto text-sm"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-sm sm:text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {lineItems.length > 0 ? (
            <DocumentLineItemsTable
              documentType={documentType}
              lineItems={lineItems}
              onUpdateLineItem={onUpdateLineItem}
              onRemoveLineItem={onRemoveLineItem}
            />
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground px-4">
              <Plus className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
              <p className="text-sm sm:text-lg font-medium">No items added yet</p>
              <p className="text-xs sm:text-sm">Add products to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compact Totals + Notes Section - Side by side on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Totals - Compact mode */}
        <DocumentTotalsSection
          documentType={documentType}
          subtotal={calculateSubtotal()}
          tax={calculateTotalTax()}
          total={calculateGrandTotal()}
          compact
        />
        {/* Notes - Collapsible */}
        <NotesSection
          notes={notes}
          onNotesChange={onNotesChange}
        />
      </div>

      {/* Product Selection Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">Select Products</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[65vh] sm:max-h-[70vh] p-2 sm:p-4">
            <ProductCatalog
              onAddProduct={handleProductSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

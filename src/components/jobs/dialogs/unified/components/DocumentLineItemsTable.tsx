
import React, { useState } from "react";
import { LineItem } from "@/components/jobs/builder/types";
import { formatCurrency } from "@/lib/utils";
import { DocumentType } from "../../UnifiedDocumentBuilder";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit } from "lucide-react";
import { ProductEditInEstimateDialog } from "../../ProductEditInEstimateDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileLineItemCard } from "./MobileLineItemCard";
import { CompactLineItemCard } from "./CompactLineItemCard";

interface DocumentLineItemsTableProps {
  documentType: DocumentType;
  lineItems: LineItem[];
  onUpdateLineItem?: (id: string, field: string, value: any) => void;
  onRemoveLineItem?: (id: string) => void;
}

export const DocumentLineItemsTable = ({
  documentType,
  lineItems,
  onUpdateLineItem,
  onRemoveLineItem
}: DocumentLineItemsTableProps) => {
  const [editingProduct, setEditingProduct] = useState<LineItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const isMobile = useIsMobile();

  const handleEditProduct = (item: LineItem) => {
    setEditingProduct(item);
    setShowEditDialog(true);
  };

  const handleProductUpdate = (updatedProduct: any) => {
    if (editingProduct && onUpdateLineItem) {
      onUpdateLineItem(editingProduct.id, 'description', updatedProduct.name);
      onUpdateLineItem(editingProduct.id, 'unitPrice', updatedProduct.price);
      onUpdateLineItem(editingProduct.id, 'ourPrice', updatedProduct.ourPrice || 0);
      onUpdateLineItem(editingProduct.id, 'taxable', updatedProduct.taxable);
      onUpdateLineItem(editingProduct.id, 'quantity', updatedProduct.quantity || 1);
    }
    setShowEditDialog(false);
    setEditingProduct(null);
  };

  const calculateMargin = (item: LineItem): number => {
    const revenue = item.quantity * item.unitPrice;
    const cost = item.quantity * (item.ourPrice || 0);
    return revenue - cost;
  };

  const calculateMarginPercentage = (item: LineItem): number => {
    const margin = calculateMargin(item);
    const revenue = item.quantity * item.unitPrice;
    if (revenue === 0) return 0;
    return (margin / revenue) * 100;
  };

  const getMarginColor = (percentage: number): string => {
    if (percentage < 20) return 'text-red-600';
    if (percentage < 40) return 'text-orange-600';
    return 'text-green-600';
  };

  const isEditable = !!(onUpdateLineItem && onRemoveLineItem);

  return (
    <>
      <div className="px-4 sm:px-8 py-4 sm:py-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 break-words">
          {documentType === 'estimate' ? 'Estimated Services & Materials' : 'Services & Materials'}
        </h3>
        
        {/* Compact Card Layout - Works for both mobile and desktop in split view */}
        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <CompactLineItemCard
              key={item.id}
              item={item}
              index={index}
              isEditable={isEditable}
              onUpdateLineItem={onUpdateLineItem}
              onRemoveLineItem={onRemoveLineItem}
              onEditProduct={handleEditProduct}
            />
          ))}
        </div>
      </div>

      {/* Product Edit Dialog */}
      {isEditable && (
        <ProductEditInEstimateDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          product={editingProduct ? {
            id: editingProduct.id,
            name: editingProduct.description || editingProduct.name || '',
            description: editingProduct.description || editingProduct.name || '',
            category: "",
            price: editingProduct.unitPrice,
            ourPrice: editingProduct.ourPrice || 0,
            taxable: editingProduct.taxable,
            quantity: editingProduct.quantity,
            tags: []
          } : null}
          onSave={handleProductUpdate}
        />
      )}
    </>
  );
};

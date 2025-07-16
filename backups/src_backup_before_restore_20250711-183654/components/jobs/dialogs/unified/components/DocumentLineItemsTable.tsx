
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
        
        {isMobile ? (
          // Mobile Card Layout
          <div className="space-y-3">
            {lineItems.map((item) => (
              <MobileLineItemCard
                key={item.id}
                item={item}
                isEditable={isEditable}
                onUpdateLineItem={onUpdateLineItem}
                onRemoveLineItem={onRemoveLineItem}
                onEditProduct={handleEditProduct}
              />
            ))}
          </div>
        ) : (
          // Desktop Table Layout
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900 w-16 sm:w-20">Qty</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-900 w-24 sm:w-28">Customer Price</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-900 w-24 sm:w-28 bg-yellow-50">Our Price</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900 w-16 sm:w-20">Taxable</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-900 w-24 sm:w-28">Total</th>
                    {isEditable && (
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900 w-20">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => {
                    const marginPercentage = calculateMarginPercentage(item);
                    const margin = calculateMargin(item);
                    
                    return (
                      <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          {isEditable ? (
                            <Input
                              value={item.description || item.name || ''}
                              onChange={(e) => onUpdateLineItem!(item.id, 'description', e.target.value)}
                              className="border-0 p-0 h-auto bg-transparent text-xs sm:text-sm"
                              placeholder="Product description"
                            />
                          ) : (
                            <div>
                              <p className="font-medium text-gray-900 text-xs sm:text-sm break-words">
                                {item.description || item.name}
                              </p>
                              {item.taxable && !isEditable && (
                                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full mt-1 sm:mt-2">
                                  Taxable
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          {isEditable ? (
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => onUpdateLineItem!(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-16 text-center text-xs sm:text-sm"
                            />
                          ) : (
                            <span className="text-gray-900 text-xs sm:text-sm">{item.quantity}</span>
                          )}
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          {isEditable ? (
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => onUpdateLineItem!(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right text-xs sm:text-sm"
                            />
                          ) : (
                            <span className="text-gray-900 text-xs sm:text-sm">
                              {formatCurrency(item.unitPrice)}
                            </span>
                          )}
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right bg-yellow-50">
                          {isEditable ? (
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.ourPrice || 0}
                              onChange={(e) => onUpdateLineItem!(item.id, 'ourPrice', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right bg-yellow-50 text-xs sm:text-sm"
                              title="Internal use only"
                            />
                          ) : (
                            <span className="text-gray-900 text-xs sm:text-sm">
                              {formatCurrency(item.ourPrice || 0)}
                            </span>
                          )}
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          {isEditable ? (
                            <Select 
                              value={item.taxable.toString()} 
                              onValueChange={(value) => onUpdateLineItem!(item.id, 'taxable', value === 'true')}
                            >
                              <SelectTrigger className="w-16 text-xs sm:text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-gray-900 text-xs sm:text-sm">
                              {item.taxable ? 'Yes' : 'No'}
                            </span>
                          )}
                        </td>
                        
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <div>
                            <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </div>
                            {(item.ourPrice && item.ourPrice > 0) && (
                              <div className={`text-xs ${getMarginColor(marginPercentage)}`}>
                                M: {formatCurrency(margin)} ({marginPercentage.toFixed(0)}%)
                              </div>
                            )}
                          </div>
                        </td>
                        
                        {isEditable && (
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProduct(item)}
                                className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
                                title="Edit product details"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveLineItem!(item.id)}
                                className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                title="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

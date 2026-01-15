
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Edit3 } from "lucide-react";
import { LineItem } from "../../builder/types";
import { formatCurrency } from "@/lib/utils";
import { DocumentType } from "../UnifiedDocumentBuilder";

interface UnifiedDocumentFormProps {
  documentType: DocumentType;
  documentNumber: string;
  lineItems: LineItem[];
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onEditLineItem?: (id: string) => boolean;
  onAddEmptyLineItem: () => void;
  onAddCustomLine: () => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  calculateTotalMargin?: () => number;
  calculateMarginPercentage?: () => number;
  notes: string;
  setNotes: (notes: string) => void;
  showMargin?: boolean;
}

export const UnifiedDocumentForm = ({
  documentType,
  documentNumber,
  lineItems,
  onRemoveLineItem,
  onUpdateLineItem,
  onEditLineItem,
  onAddEmptyLineItem,
  onAddCustomLine,
  taxRate,
  setTaxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  calculateTotalMargin,
  calculateMarginPercentage,
  notes,
  setNotes,
  showMargin = false
}: UnifiedDocumentFormProps) => {
  const subtotal = calculateSubtotal();
  const tax = calculateTotalTax();
  const total = calculateGrandTotal();
  const margin = calculateTotalMargin ? calculateTotalMargin() : 0;
  const marginPercentage = calculateMarginPercentage ? calculateMarginPercentage() : 0;

  const documentTitle = documentType === 'estimate' ? 'Estimate' : 'Invoice';

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">{documentTitle} {documentNumber}</h3>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-md font-medium">Line Items</h4>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onAddEmptyLineItem}
              className="gap-1"
            >
              <Plus size={16} />
              Add Product
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onAddCustomLine}
              className="gap-1"
            >
              <Plus size={16} />
              Custom Line
            </Button>
          </div>
        </div>

        {lineItems.length === 0 ? (
          <button
            type="button"
            onClick={onAddEmptyLineItem}
            className="w-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer"
          >
            <Plus className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p>No items added yet. Add products or custom line items to get started.</p>
          </button>
        ) : (
          <div className="space-y-2">
            {lineItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 bg-white">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <Label className="text-xs text-gray-500">Description</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={item.description || item.name || ""}
                        onChange={(e) => onUpdateLineItem(item.id, "description", e.target.value)}
                        placeholder="Item description"
                        className="text-sm"
                      />
                      {onEditLineItem && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditLineItem(item.id)}
                          className="p-1 h-8 w-8"
                        >
                          <Edit3 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-500">Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                      min="1"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-500">Unit Price</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-500">Total</Label>
                    <div className="text-sm font-medium py-2">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveLineItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 h-8 w-8"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tax and Totals */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="tax-rate" className="text-sm font-medium">Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.01"
              className="w-24"
            />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({taxRate}%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            {showMargin && (
              <>
                <div className="flex justify-between">
                  <span>Margin:</span>
                  <span>{formatCurrency(margin)} ({marginPercentage.toFixed(1)}%)</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Add any notes for this ${documentType}...`}
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );
};

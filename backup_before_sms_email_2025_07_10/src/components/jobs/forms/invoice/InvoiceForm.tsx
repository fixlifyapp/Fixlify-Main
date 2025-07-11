
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Edit3 } from "lucide-react";
import { LineItem } from "../../builder/types";

interface InvoiceFormProps {
  invoice_number: string;
  lineItems: LineItem[];
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onEditLineItem?: (id: string) => boolean;
  onAddEmptyLineItem: () => void;
  onAddCustomLine?: () => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  setNotes: (notes: string) => void;
}

export const InvoiceForm = ({
  invoice_number,
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
  notes,
  setNotes
}: InvoiceFormProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="invoice_number">Invoice Number</Label>
        <Input
          id="invoice_number"
          value={invoice_number}
          readOnly
          className="bg-gray-50"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Line Items</h3>
          <div className="flex gap-2">
            <Button onClick={onAddEmptyLineItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            {onAddCustomLine && (
              <Button onClick={onAddCustomLine} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Custom Line
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
              <div className="col-span-5">
                <Label>Description</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={item.description}
                    onChange={(e) => onUpdateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                  {onEditLineItem && (
                    <Button
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
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onUpdateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              
              <div className="col-span-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => onUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="col-span-2">
                <Label>Total</Label>
                <Input
                  value={`$${(item.quantity * item.unitPrice).toFixed(2)}`}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div className="col-span-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveLineItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes or terms..."
          rows={3}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({taxRate}%):</span>
          <span>${calculateTotalTax().toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total:</span>
          <span>${calculateGrandTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};


import React from "react";
import { LineItemsManager } from "../unified/LineItemsManager";
import { Product, LineItem } from "../../builder/types";

interface InvoiceItemsStepProps {
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

export const InvoiceItemsStep = ({
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
}: InvoiceItemsStepProps) => {
  const handleAddProduct = (product: Product) => {
    // Ensure product has all required fields with defaults
    const enrichedProduct: Product = {
      ...product,
      quantity: product.quantity || 1,
      taxable: product.taxable !== undefined ? product.taxable : true,
      ourPrice: product.ourPrice || product.ourprice || product.cost || 0,
      tags: product.tags || []
    };
    
    onAddProduct(enrichedProduct);
  };

  return (
    <LineItemsManager
      lineItems={lineItems}
      taxRate={taxRate}
      notes={notes}
      onLineItemsChange={onLineItemsChange}
      onTaxRateChange={onTaxRateChange}
      onNotesChange={onNotesChange}
      onAddProduct={handleAddProduct}
      onRemoveLineItem={onRemoveLineItem}
      onUpdateLineItem={onUpdateLineItem}
      calculateSubtotal={calculateSubtotal}
      calculateTotalTax={calculateTotalTax}
      calculateGrandTotal={calculateGrandTotal}
      documentType="invoice"
    />
  );
};

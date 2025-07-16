
import { useState, useCallback } from "react";
import { LineItem, Product } from "@/components/jobs/builder/types";

export const useInvoiceLineItems = () => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const handleAddProduct = useCallback((product: Product) => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: product.description || product.name,
      quantity: product.quantity || 1,
      unitPrice: product.price,
      taxable: product.taxable || true,
      discount: 0,
      ourPrice: product.ourPrice || product.ourprice || product.cost || 0,
      name: product.name,
      price: product.price,
      total: (product.quantity || 1) * product.price
    };
    
    setLineItems(prev => [...prev, newLineItem]);
  }, []);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, total: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice) }
        : item
    ));
  }, []);

  return {
    lineItems,
    setLineItems,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem
  };
};

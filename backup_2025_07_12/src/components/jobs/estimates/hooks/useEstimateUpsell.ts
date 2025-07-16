
import { useState } from 'react';
import { Product } from '../../builder/types';

export const useEstimateUpsell = () => {
  const [selectedUpsells, setSelectedUpsells] = useState<Product[]>([]);

  const addUpsell = (product: Product) => {
    const upsellProduct: Product = {
      id: `upsell-${Date.now()}`,
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      price: product.price,
      quantity: product.quantity || 1,
      taxable: product.taxable !== undefined ? product.taxable : true,
      tags: product.tags || [],
      cost: product.cost || 0,
      ourPrice: product.ourPrice || product.ourprice || product.cost || 0
    };
    
    setSelectedUpsells(prev => [...prev, upsellProduct]);
  };

  const removeUpsell = (id: string) => {
    setSelectedUpsells(prev => prev.filter(item => item.id !== id));
  };

  const clearUpsells = () => {
    setSelectedUpsells([]);
  };

  const getTotalUpsellValue = () => {
    return selectedUpsells.reduce((total, upsell) => total + (upsell.price * (upsell.quantity || 1)), 0);
  };

  return {
    selectedUpsells,
    addUpsell,
    removeUpsell,
    clearUpsells,
    getTotalUpsellValue
  };
};

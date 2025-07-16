
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "../../builder/types";
import { Estimate } from "@/types/documents";

export const useEstimateWarranty = (
  estimates: Estimate[],
  setEstimates: (estimates: Estimate[]) => void,
  selectedEstimate: Estimate | null
) => {
  // Handle warranty selection and addition
  const handleWarrantySelection = async (selectedWarranty: Product | null, customNote: string) => {
    if (selectedWarranty && selectedEstimate) {
      try {
        // Add the warranty to the line_items table - not estimate_items
        const { data: newItem, error: itemError } = await supabase
          .from('line_items')
          .insert({
            parent_id: selectedEstimate.id,
            parent_type: 'estimate',
            description: selectedWarranty.name,
            unit_price: selectedWarranty.price,
            quantity: 1,
            taxable: false // Warranties are typically not taxed
          })
          .select()
          .single();
          
        if (itemError) {
          throw itemError;
        }
        
        // Update the estimate total
        const newTotal = selectedEstimate.total + selectedWarranty.price;
        const { error: updateError } = await supabase
          .from('estimates')
          .update({ 
            total: newTotal,
            notes: customNote.trim() ? customNote : selectedEstimate.notes 
          })
          .eq('id', selectedEstimate.id);
          
        if (updateError) {
          throw updateError;
        }
        
        // Update local state with the newly created item
        const updatedEstimates = estimates.map(est => 
          est.id === selectedEstimate.id 
            ? {
                ...est,
                items: [
                  ...(est.items || []),
                  {
                    id: newItem.id, // Use the actual DB id
                    description: selectedWarranty.name,
                    quantity: 1,
                    unitPrice: selectedWarranty.price,
                    taxable: false,
                    total: selectedWarranty.price
                  }
                ],
                total: est.total + selectedWarranty.price,
                notes: customNote || est.notes
              } 
            : est
        );
        
        setEstimates(updatedEstimates);
        toast.success(`${selectedWarranty.name} added to estimate ${selectedEstimate.estimate_number}`);
      } catch (error) {
        console.error('Error adding warranty:', error);
        toast.error('Failed to add warranty to estimate');
      }
    }
  };

  // Handle removing a warranty from an estimate
  const removeWarrantyFromEstimate = async (itemId: string) => {
    if (!selectedEstimate) return;
    
    try {
      // Find the item to get its price
      const itemToRemove = selectedEstimate.items?.find(item => item.id === itemId);
      
      if (!itemToRemove) {
        toast.error('Item not found');
        return;
      }
      
      // Delete the item from the database - use line_items, not estimate_items
      const { error: deleteError } = await supabase
        .from('line_items')
        .delete()
        .eq('id', itemId)
        .eq('parent_id', selectedEstimate.id);
        
      if (deleteError) throw deleteError;
      
      // Calculate item price
      const itemPrice = itemToRemove.unitPrice * itemToRemove.quantity;
      
      // Update the estimate total
      const newTotal = Math.max(0, selectedEstimate.total - itemPrice);
      
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ total: newTotal })
        .eq('id', selectedEstimate.id);
        
      if (updateError) throw updateError;
      
      // Update the local state
      const updatedEstimates = estimates.map(est => 
        est.id === selectedEstimate.id
          ? {
              ...est,
              items: (est.items || []).filter(item => item.id !== itemId),
              total: newTotal
            }
          : est
      );
      
      setEstimates(updatedEstimates);
      toast.success('Item removed from estimate');
    } catch (error) {
      console.error('Error removing warranty:', error);
      toast.error('Failed to remove item from estimate');
    }
  };

  return {
    handleWarrantySelection,
    removeWarrantyFromEstimate
  };
};

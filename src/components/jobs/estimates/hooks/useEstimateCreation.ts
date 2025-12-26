import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEstimateInfo } from "./useEstimateInfo";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { generateNextId } from "@/utils/idGeneration";

export const useEstimateCreation = (
  jobId: string,
  estimates: any[],
  setEstimates: (estimates: any[]) => void
) => {
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  const [estimateItems, setEstimateItems] = useState<Product[]>([]);

  // Handle creating a new estimate
  const handleCreateEstimate = () => {
    // This function just signals the dialog should open
    // The actual creation happens in handleEstimateCreated
    setEstimateItems([]);
    setSelectedEstimateId(null);
  };

  // Handle editing an existing estimate
  const handleEditEstimate = (estimateId: string) => {
    const estimate = estimates.find(est => est.id === estimateId);
    if (estimate) {
      setSelectedEstimateId(estimateId);
      loadEstimateItems(estimateId);
      toast.info(`Editing estimate ${estimate.estimate_number || estimate.number}`);
    } else {
      toast.error("Estimate not found");
    }
  };

  // Load existing items for an estimate
  const loadEstimateItems = async (estimateId: string) => {
    try {
      const { data, error } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', 'estimate')
        .eq('parent_id', estimateId);

      if (error) {
        throw error;
      }

      // Map the database items to Product type with required fields
      if (data && data.length > 0) {
        const mappedItems: Product[] = data.map(item => ({
          id: item.id,
          name: item.description || "", // Use description as name
          description: item.description || "",
          category: "",  // Default category
          price: Number(item.unit_price),
          quantity: item.quantity || 1,
          taxable: item.taxable === undefined ? true : item.taxable,
          tags: [],  // Default empty tags
          cost: 0, // Default cost
          ourPrice: 0, // Default ourPrice to 0
          sku: ""  // Default empty sku
        }));
        setEstimateItems(mappedItems);
      } else {
        setEstimateItems([]);
      }
    } catch (error) {
      toast.error('Failed to load estimate items');
    }
  };

  // Add a product to the estimate
  const addProductToEstimate = (product: Product) => {
    // Ensure ourPrice is set to 0 for any product added to estimates
    const productWithZeroOurPrice = {
      ...product,
      ourPrice: 0
    };
    setEstimateItems(prev => [...prev, productWithZeroOurPrice]);
  };

  // Remove a product from the estimate
  const removeProductFromEstimate = async (productId: string) => {
    // First, check if we are in edit mode (have a selectedEstimateId)
    if (selectedEstimateId) {
      try {
        // Get the item we're about to remove to keep track of its price
        const itemToRemove = estimateItems.find(item => item.id === productId);
        
        // Remove from database if it's an existing estimate
        const { error } = await supabase
          .from('line_items')
          .delete()
          .eq('id', productId)
          .eq('parent_id', selectedEstimateId);
          
        if (error) {
          toast.error('Failed to remove product from estimate');
          return;
        }
        
        // If this was a successful database removal and we have the item's price
        if (itemToRemove) {
          // Update the estimate's total amount
          const estimate = estimates.find(est => est.id === selectedEstimateId);
          if (estimate) {
            const newTotal = Math.max(0, estimate.total - itemToRemove.price);
            
            const { error: updateError } = await supabase
              .from('estimates')
              .update({ total: newTotal })
              .eq('id', selectedEstimateId);
              
            if (!updateError) {
              // Update the local estimates array
              setEstimates(estimates.map(est => 
                est.id === selectedEstimateId ? { ...est, total: newTotal } : est
              ));
            }
          }
        }
        
        toast.success('Product removed from estimate');
      } catch (error) {
        toast.error('Failed to remove product');
      }
    }
    
    // Always update the local state regardless of DB operation
    setEstimateItems(prev => prev.filter(item => item.id !== productId));
  };

  // Calculate total amount based on products
  const calculateEstimateTotal = () => {
    return estimateItems.reduce((total, item) => total + item.price, 0);
  };

  // Handle estimate creation from the dialog
  const handleEstimateCreated = async (amount: number) => {
    try {
      // Generate a new estimate number using the simplified numbering system
      const newEstimateNumber = await generateNextId('estimate');

      // Create a new estimate in Supabase
      const { data, error } = await supabase
        .from('estimates')
        .insert({
          job_id: jobId,
          estimate_number: newEstimateNumber,
          total: amount,
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Save estimate items if there are any
      if (estimateItems.length > 0) {
        const itemsToInsert = estimateItems.map(product => ({
          parent_id: data.id,
          parent_type: 'estimate',
          description: product.description || product.name,
          unit_price: product.price,
          quantity: 1,
          taxable: product.taxable || true
        }));

        const { error: itemsError } = await supabase
          .from('line_items')
          .insert(itemsToInsert);

        if (itemsError) {
          toast.error('Warning: Some items may not have been saved');
        }
      }

      // Create a new estimate object
      const newEstimate = {
        id: data.id,
        job_id: data.job_id,
        estimate_number: data.estimate_number,
        date: data.created_at, // Use created_at as date
        total: data.total,
        status: data.status,
        viewed: false,
        items: estimateItems.map(product => ({
          id: `temp-${Date.now()}-${Math.random()}`,
          description: product.description || '',
          quantity: 1,
          unitPrice: product.price,
          taxable: product.taxable,
          total: product.price
        })),
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      // Add the new estimate to the list
      setEstimates([newEstimate, ...estimates]);

      toast.success(`Estimate ${newEstimateNumber} created`);
      return newEstimate;
    } catch (error) {
      toast.error('Failed to create estimate');
      return null;
    }
  };

  return {
    state: {
      selectedEstimateId,
      estimateItems
    },
    actions: {
      handleCreateEstimate,
      handleEditEstimate,
      handleEstimateCreated,
      setSelectedEstimateId,
      addProductToEstimate,
      removeProductFromEstimate,
      calculateEstimateTotal,
      setEstimateItems
    }
  };
};

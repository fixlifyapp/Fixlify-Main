import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { Shield } from "lucide-react";
import { EstimateSummaryCard } from "./components/EstimateSummaryCard";
import { NotesSection } from "./components/NotesSection";
import { WarrantiesList } from "./components/WarrantiesList";
import { AIRecommendationsCard } from "./components/AIRecommendationsCard";
import { UpsellStepProps } from "../shared/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const EstimateUpsellStep = ({ 
  onContinue, 
  onBack, 
  documentTotal, 
  existingUpsellItems = [],
  jobContext
}: UpsellStepProps) => {
  const [notes, setNotes] = useState("");
  const [upsellItems, setUpsellItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingWarranty, setIsSavingWarranty] = useState(false);
  const { products: warrantyProducts, isLoading } = useProducts("Warranties");

  // Get document ID from jobContext - could be estimate or invoice
  const documentId = jobContext?.estimateId || jobContext?.invoiceId;
  const documentType = jobContext?.invoiceId ? 'invoice' : 'estimate';

  // Convert warranty products to upsell items and restore previous selections
  useEffect(() => {
    const warrantyUpsells = warrantyProducts.map(product => {
      const existingSelection = existingUpsellItems.find(item => item.id === product.id);
      
      return {
        id: product.id,
        title: product.name,
        description: product.description || "",
        price: product.price,
        icon: Shield,
        selected: existingSelection ? existingSelection.selected : false
      };
    });
    setUpsellItems(warrantyUpsells);
  }, [warrantyProducts, existingUpsellItems]);

  const handleUpsellToggle = async (itemId: string) => {
    if (isProcessing || isSavingWarranty) return;
    
    const item = upsellItems.find(item => item.id === itemId);
    if (!item || !documentId) {
      toast.error("Unable to save warranty - missing information");
      return;
    }

    const newSelectedState = !item.selected;
    
    // Update UI immediately for better responsiveness
    setUpsellItems(prev => prev.map(upsellItem => 
      upsellItem.id === itemId ? { ...upsellItem, selected: newSelectedState } : upsellItem
    ));
    
    setIsSavingWarranty(true);
    
    try {
      if (newSelectedState) {
        // Add warranty to database
        const { error: lineItemError } = await supabase
          .from('line_items')
          .insert({
            parent_id: documentId,
            parent_type: documentType,
            description: item.title + (item.description ? ` - ${item.description}` : ''),
            quantity: 1,
            unit_price: item.price,
            taxable: false // Warranties are typically not taxed
          });

        if (lineItemError) {
          console.error('Error adding warranty line item:', lineItemError);
          toast.error(`Failed to add ${item.title}`);
          // Revert UI on error
          setUpsellItems(prev => prev.map(upsellItem => 
            upsellItem.id === itemId ? { ...upsellItem, selected: !newSelectedState } : upsellItem
          ));
          return;
        }

        // Update document total
        const tableName = documentType === 'estimate' ? 'estimates' : 'invoices';
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ 
            total: documentTotal + item.price
          })
          .eq('id', documentId);

        if (updateError) {
          console.error(`Error updating ${documentType} total:`, updateError);
          toast.error(`Failed to update ${documentType} total`);
          // Revert UI on error
          setUpsellItems(prev => prev.map(upsellItem => 
            upsellItem.id === itemId ? { ...upsellItem, selected: !newSelectedState } : upsellItem
          ));
          return;
        }

        toast.success(`${item.title} added to ${documentType}`);
      } else {
        // Remove warranty from database
        const { error: deleteError } = await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', documentId)
          .eq('parent_type', documentType)
          .eq('description', item.title + (item.description ? ` - ${item.description}` : ''));

        if (deleteError) {
          console.error('Error removing warranty line item:', deleteError);
          toast.error(`Failed to remove ${item.title}`);
          // Revert UI on error
          setUpsellItems(prev => prev.map(upsellItem => 
            upsellItem.id === itemId ? { ...upsellItem, selected: !newSelectedState } : upsellItem
          ));
          return;
        }

        // Update document total
        const tableName = documentType === 'estimate' ? 'estimates' : 'invoices';
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ 
            total: Math.max(0, documentTotal - item.price)
          })
          .eq('id', documentId);

        if (updateError) {
          console.error(`Error updating ${documentType} total:`, updateError);
          toast.error(`Failed to update ${documentType} total`);
          // Revert UI on error
          setUpsellItems(prev => prev.map(upsellItem => 
            upsellItem.id === itemId ? { ...upsellItem, selected: !newSelectedState } : upsellItem
          ));
          return;
        }

        toast.success(`${item.title} removed from ${documentType}`);
      }

    } catch (error) {
      console.error('Error toggling warranty:', error);
      toast.error('Failed to update warranty');
      // Revert UI on error
      setUpsellItems(prev => prev.map(upsellItem => 
        upsellItem.id === itemId ? { ...upsellItem, selected: !newSelectedState } : upsellItem
      ));
    } finally {
      setIsSavingWarranty(false);
    }
  };

  const selectedUpsells = upsellItems.filter(item => item.selected);
  const upsellTotal = selectedUpsells.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = documentTotal + upsellTotal;

  const handleContinue = async () => {
    if (isProcessing || isSavingWarranty) return;
    
    setIsProcessing(true);
    
    try {
      // Save notes if any
      if (notes.trim() && documentId) {
        const tableName = documentType === 'estimate' ? 'estimates' : 'invoices';
        const { error: notesError } = await supabase
          .from(tableName)
          .update({ notes: notes.trim() })
          .eq('id', documentId);

        if (notesError) {
          console.error('Error saving notes:', notesError);
          toast.error('Failed to save notes');
          return;
        }
      }

      // Continue with selected upsells (they're already saved to database)
      await onContinue(selectedUpsells, notes);
    } catch (error) {
      console.error('Error in handleContinue:', error);
      toast.error('Failed to continue');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Loading Additional Services...</h3>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enhance Your Service</h3>
        <p className="text-muted-foreground">Add valuable warranty services for complete protection</p>
      </div>

      {/* AI Recommendations */}
      {jobContext && (
        <AIRecommendationsCard 
          jobContext={{
            job_type: jobContext.job_type || 'General Service',
            service_category: jobContext.service_category || 'Maintenance',
            job_value: jobContext.job_value || 0,
            client_history: jobContext.client_history
          }} 
        />
      )}

      {/* Warranties List */}
      <WarrantiesList
        upsellItems={upsellItems}
        existingUpsellItems={existingUpsellItems}
        isProcessing={isProcessing || isSavingWarranty}
        onUpsellToggle={handleUpsellToggle}
      />

      {/* Notes Section */}
      <NotesSection
        notes={notes}
        onNotesChange={setNotes}
      />

      {/* Summary */}
      <EstimateSummaryCard
        estimateTotal={documentTotal}
        selectedUpsells={selectedUpsells}
        upsellTotal={upsellTotal}
        grandTotal={grandTotal}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isProcessing || isSavingWarranty}
        >
          Back to Items
        </Button>
        <Button 
          onClick={handleContinue} 
          className="gap-2"
          disabled={isProcessing || isSavingWarranty}
        >
          {isProcessing ? "Processing..." : isSavingWarranty ? "Saving..." : "Continue to Send"}
        </Button>
      </div>
    </div>
  );
};

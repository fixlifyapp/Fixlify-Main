
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { Shield, Info } from "lucide-react";
import { EstimateSummaryCard } from "../estimate-builder/components/EstimateSummaryCard";
import { NotesSection } from "../estimate-builder/components/NotesSection";
import { WarrantiesList } from "../estimate-builder/components/WarrantiesList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UpsellStepProps } from "../shared/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const InvoiceUpsellStep = ({ 
  onContinue, 
  onBack, 
  documentTotal, 
  existingUpsellItems = [],
  estimateToConvert,
  jobContext
}: UpsellStepProps) => {
  const [notes, setNotes] = useState("");
  const [upsellItems, setUpsellItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingWarranty, setIsSavingWarranty] = useState(false);
  const [hasExistingWarranties, setHasExistingWarranties] = useState(false);
  const [isLoadingExistingWarranties, setIsLoadingExistingWarranties] = useState(true);
  const { products: warrantyProducts, isLoading } = useProducts("Warranties");

  // Get invoice ID from jobContext or other source
  const invoiceId = jobContext?.invoiceId;

  // Enhanced check for existing warranties - now includes estimates
  useEffect(() => {
    const checkExistingWarranties = async () => {
      if (!invoiceId) {
        setIsLoadingExistingWarranties(false);
        return;
      }

      try {
        setIsLoadingExistingWarranties(true);
        
        // First check if this invoice was converted from an estimate
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .select('estimate_id')
          .eq('id', invoiceId)
          .single();

        if (invoiceError) {
          console.error('Error fetching invoice:', invoiceError);
          setIsLoadingExistingWarranties(false);
          return;
        }

        // If invoice was converted from estimate, check if estimate had warranties
        if (invoice?.estimate_id) {
          const { data: estimateLineItems, error: estimateError } = await supabase
            .from('line_items')
            .select('*')
            .eq('parent_id', invoice.estimate_id)
            .eq('parent_type', 'estimate');

          if (!estimateError && estimateLineItems) {
            const hasWarrantiesInEstimate = estimateLineItems.some((item: any) => 
              item.description?.toLowerCase().includes('warranty')
            );
            
            if (hasWarrantiesInEstimate) {
              setHasExistingWarranties(true);
              setIsLoadingExistingWarranties(false);
              return;
            }
          }
        }
        
        // Check if the invoice already contains warranty items
        const { data: invoiceLineItems, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', invoiceId)
          .eq('parent_type', 'invoice');

        if (error) {
          console.error('Error fetching invoice line items:', error);
          setIsLoadingExistingWarranties(false);
          return;
        }

        // Check if any line items are warranties
        const hasWarranties = invoiceLineItems?.some((item: any) => 
          item.description?.toLowerCase().includes('warranty') ||
          warrantyProducts.some(wp => item.description?.includes(wp.name))
        ) || false;

        console.log('Invoice line items:', invoiceLineItems);
        console.log('Has existing warranties in invoice:', hasWarranties);
        
        setHasExistingWarranties(hasWarranties);
      } catch (error) {
        console.error('Error checking existing warranties:', error);
      } finally {
        setIsLoadingExistingWarranties(false);
      }
    };

    // Only check after warranty products are loaded
    if (!isLoading && warrantyProducts.length > 0) {
      checkExistingWarranties();
    } else if (!isLoading) {
      setIsLoadingExistingWarranties(false);
    }
  }, [invoiceId, warrantyProducts, isLoading, estimateToConvert]);

  // Convert warranty products to upsell items and restore previous selections
  useEffect(() => {
    if (hasExistingWarranties || isLoadingExistingWarranties) {
      // If warranties already exist or we're still loading, don't show them as options
      setUpsellItems([]);
      return;
    }

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
  }, [warrantyProducts, existingUpsellItems, hasExistingWarranties, isLoadingExistingWarranties]);

  const handleUpsellToggle = async (itemId: string) => {
    if (isProcessing || isSavingWarranty) return;
    
    setIsSavingWarranty(true);
    
    try {
      const item = upsellItems.find(item => item.id === itemId);
      if (!item || !invoiceId) {
        toast.error("Unable to save warranty - missing information");
        return;
      }

      const newSelectedState = !item.selected;

      if (newSelectedState) {
        // Add warranty to database
        const { error: lineItemError } = await supabase
          .from('line_items')
          .insert({
            parent_id: invoiceId,
            parent_type: 'invoice',
            description: item.title + (item.description ? ` - ${item.description}` : ''),
            quantity: 1,
            unit_price: item.price,
            taxable: false // Warranties are typically not taxed
          });

        if (lineItemError) {
          console.error('Error adding warranty line item:', lineItemError);
          toast.error(`Failed to add ${item.title}`);
          return;
        }

        // Update invoice total only (balance is auto-calculated)
        const newTotal = documentTotal + item.price;
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ 
            total: newTotal
          })
          .eq('id', invoiceId);

        if (updateError) {
          console.error('Error updating invoice total:', updateError);
          toast.error('Failed to update invoice total');
          return;
        }

        toast.success(`${item.title} added to invoice`);
      } else {
        // Remove warranty from database
        const { error: deleteError } = await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', invoiceId)
          .eq('parent_type', 'invoice')
          .eq('description', item.title + (item.description ? ` - ${item.description}` : ''));

        if (deleteError) {
          console.error('Error removing warranty line item:', deleteError);
          toast.error(`Failed to remove ${item.title}`);
          return;
        }

        // Update invoice total only (balance is auto-calculated)
        const newTotal = Math.max(0, documentTotal - item.price);
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ 
            total: newTotal
          })
          .eq('id', invoiceId);

        if (updateError) {
          console.error('Error updating invoice total:', updateError);
          toast.error('Failed to update invoice total');
          return;
        }

        toast.success(`${item.title} removed from invoice`);
      }

      // Update local state
      setUpsellItems(prev => prev.map(upsellItem => 
        upsellItem.id === itemId ? { ...upsellItem, selected: newSelectedState } : upsellItem
      ));

    } catch (error) {
      console.error('Error toggling warranty:', error);
      toast.error('Failed to update warranty');
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
      if (notes.trim() && invoiceId) {
        const { error: notesError } = await supabase
          .from('invoices')
          .update({ notes: notes.trim() })
          .eq('id', invoiceId);

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

  if (isLoading || isLoadingExistingWarranties) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Loading Additional Services...</h3>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enhance Your Invoice</h3>
        <p className="text-muted-foreground">Add valuable warranty services for complete protection</p>
      </div>

      {hasExistingWarranties ? (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Warranties Already Included</strong>
            <br />
            This invoice already includes warranty services. 
            No additional warranty options are needed at this time.
            {estimateToConvert && (
              <span className="block mt-1 text-sm text-muted-foreground">
                (Warranties were included from the original estimate)
              </span>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Warranty Recommendation</strong>
              <br />
              No warranty was added to this invoice. Consider offering warranty protection 
              to provide additional value and peace of mind for your customer. Warranties help build 
              trust and can increase customer satisfaction while protecting your work.
            </AlertDescription>
          </Alert>

          <WarrantiesList
            upsellItems={upsellItems}
            existingUpsellItems={existingUpsellItems}
            isProcessing={isProcessing || isSavingWarranty}
            onUpsellToggle={handleUpsellToggle}
          />
        </>
      )}

      <NotesSection
        notes={notes}
        onNotesChange={setNotes}
      />

      <EstimateSummaryCard
        estimateTotal={documentTotal}
        selectedUpsells={selectedUpsells}
        upsellTotal={upsellTotal}
        grandTotal={grandTotal}
      />

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

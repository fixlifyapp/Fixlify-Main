
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Info } from "lucide-react";
import { EstimateSummaryCard } from "../estimate-builder/components/EstimateSummaryCard";
import { NotesSection } from "../estimate-builder/components/NotesSection";
import { WarrantiesList } from "../estimate-builder/components/WarrantiesList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UpsellStepProps } from "../shared/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUpsellSettings } from "@/hooks/useUpsellSettings";
import { useUpsellAnalytics } from "@/hooks/useUpsellAnalytics";
import { useAuth } from "@/hooks/use-auth";

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
  const [autoAddedIds, setAutoAddedIds] = useState<Set<string>>(new Set());
  const autoSelectApplied = useRef(false);
  const shownTracked = useRef(false);

  const { config, getProductsForAmount, isLoading: isLoadingConfig } = useUpsellSettings();

  // Get upsell products based on document total (uses conditional rules if configured)
  const upsellProducts = getProductsForAmount(documentTotal, 'invoices');
  const { trackEvent } = useUpsellAnalytics();
  const { user } = useAuth();

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
            // Check if any line items match configured upsell products
            const hasUpsellInEstimate = estimateLineItems.some((item: any) =>
              upsellProducts.some(wp => item.description?.includes(wp.name))
            );

            if (hasUpsellInEstimate) {
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

        // Check if any line items are upsell products
        const hasUpsellProducts = invoiceLineItems?.some((item: any) =>
          upsellProducts.some(wp => item.description?.includes(wp.name))
        ) || false;

        console.log('Invoice line items:', invoiceLineItems);
        console.log('Has existing upsell products in invoice:', hasUpsellProducts);

        setHasExistingWarranties(hasUpsellProducts);
      } catch (error) {
        console.error('Error checking existing warranties:', error);
      } finally {
        setIsLoadingExistingWarranties(false);
      }
    };

    // Only check after upsell products are loaded
    if (!isLoadingConfig && upsellProducts.length > 0) {
      checkExistingWarranties();
    } else if (!isLoadingConfig) {
      setIsLoadingExistingWarranties(false);
    }
  }, [invoiceId, upsellProducts, isLoadingConfig, estimateToConvert]);

  // Convert admin-configured upsell products to upsell items and restore previous selections
  useEffect(() => {
    if (hasExistingWarranties || isLoadingExistingWarranties) {
      // If upsell items already exist or we're still loading, don't show them as options
      setUpsellItems([]);
      return;
    }

    const productUpsells = upsellProducts.map(product => {
      const existingSelection = existingUpsellItems.find(item => item.id === product.id);

      return {
        id: product.id,
        title: product.name,
        description: product.description || "",
        price: product.price,
        icon: Shield,
        selected: existingSelection ? existingSelection.selected : false,
        isAutoAdded: false
      };
    });
    setUpsellItems(productUpsells);
  }, [upsellProducts, existingUpsellItems, hasExistingWarranties, isLoadingExistingWarranties]);

  // Track "shown" events when upsell items are displayed
  useEffect(() => {
    if (
      shownTracked.current ||
      !invoiceId ||
      upsellItems.length === 0 ||
      isLoadingConfig ||
      hasExistingWarranties
    ) {
      return;
    }

    shownTracked.current = true;

    // Track each item as "shown"
    upsellItems.forEach(item => {
      trackEvent({
        documentType: 'invoice',
        documentId: invoiceId,
        productId: item.id,
        productName: item.title,
        productPrice: item.price,
        eventType: 'shown',
        jobType: jobContext?.job_type,
        clientId: jobContext?.clientId
      });
    });
  }, [invoiceId, upsellItems, isLoadingConfig, hasExistingWarranties, trackEvent, jobContext]);

  // Auto-select products based on admin configuration (only for new invoices without existing warranties)
  useEffect(() => {
    if (
      autoSelectApplied.current ||
      isLoadingConfig ||
      !config?.invoices?.auto_select ||
      upsellProducts.length === 0 ||
      existingUpsellItems.length > 0 ||
      upsellItems.length === 0 ||
      hasExistingWarranties ||
      !invoiceId
    ) {
      return;
    }

    // Mark as applied to prevent re-running
    autoSelectApplied.current = true;

    const autoSelectProductIds = upsellProducts.map(p => p.id);
    const itemsToAutoAdd = upsellItems.filter(
      item => autoSelectProductIds.includes(item.id) && !item.selected
    );

    if (itemsToAutoAdd.length === 0) return;

    // Auto-add products to database
    const autoAddProducts = async () => {
      setIsSavingWarranty(true);
      const newAutoAddedIds = new Set<string>();

      try {
        for (const item of itemsToAutoAdd) {
          const { error: lineItemError } = await supabase
            .from('line_items')
            .insert({
              parent_id: invoiceId,
              parent_type: 'invoice',
              description: item.title + (item.description ? ` - ${item.description}` : ''),
              quantity: 1,
              unit_price: item.price,
              taxable: false
            });

          if (!lineItemError) {
            newAutoAddedIds.add(item.id);
          }
        }

        // Update UI to show auto-added items
        if (newAutoAddedIds.size > 0) {
          setUpsellItems(prev => prev.map(item => ({
            ...item,
            selected: newAutoAddedIds.has(item.id) ? true : item.selected,
            isAutoAdded: newAutoAddedIds.has(item.id)
          })));
          setAutoAddedIds(newAutoAddedIds);

          // Update invoice total
          const addedTotal = itemsToAutoAdd
            .filter(item => newAutoAddedIds.has(item.id))
            .reduce((sum, item) => sum + item.price, 0);

          if (addedTotal > 0) {
            await supabase
              .from('invoices')
              .update({ total: documentTotal + addedTotal })
              .eq('id', invoiceId);
          }

          // Track auto_added events
          itemsToAutoAdd
            .filter(item => newAutoAddedIds.has(item.id))
            .forEach(item => {
              trackEvent({
                documentType: 'invoice',
                documentId: invoiceId,
                productId: item.id,
                productName: item.title,
                productPrice: item.price,
                eventType: 'auto_added',
                jobType: jobContext?.job_type,
                clientId: jobContext?.clientId
              });
            });

          toast.success(`${newAutoAddedIds.size} product(s) auto-added`);
        }
      } catch (error) {
        console.error('Error auto-adding products:', error);
      } finally {
        setIsSavingWarranty(false);
      }
    };

    autoAddProducts();
  }, [config, upsellProducts, upsellItems, existingUpsellItems, invoiceId, hasExistingWarranties, documentTotal, isLoadingConfig, trackEvent, jobContext]);

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

        // Track accepted event
        trackEvent({
          documentType: 'invoice',
          documentId: invoiceId,
          productId: item.id,
          productName: item.title,
          productPrice: item.price,
          eventType: 'accepted',
          jobType: jobContext?.job_type,
          clientId: jobContext?.clientId
        });

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

        // Track removed event
        trackEvent({
          documentType: 'invoice',
          documentId: invoiceId,
          productId: item.id,
          productName: item.title,
          productPrice: item.price,
          eventType: 'removed',
          jobType: jobContext?.job_type,
          clientId: jobContext?.clientId
        });

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

  if (isLoadingExistingWarranties || isLoadingConfig) {
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
        <p className="text-muted-foreground">Add recommended products and services</p>
      </div>

      {hasExistingWarranties ? (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Products Already Included</strong>
            <br />
            This invoice already includes recommended products.
            No additional options are needed at this time.
            {estimateToConvert && (
              <span className="block mt-1 text-sm text-muted-foreground">
                (Products were included from the original estimate)
              </span>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommended Products</strong>
              <br />
              Consider adding recommended products to provide additional value and peace of mind
              for your customer. This can help build trust and increase customer satisfaction.
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

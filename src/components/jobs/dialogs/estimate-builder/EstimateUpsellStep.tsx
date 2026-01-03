import { useState, useEffect, useRef } from "react";
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
import { useUpsellSettings } from "@/hooks/useUpsellSettings";
import { useUpsellAnalytics } from "@/hooks/useUpsellAnalytics";
import { useAuth } from "@/hooks/use-auth";

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
  const [autoAddedIds, setAutoAddedIds] = useState<Set<string>>(new Set());
  const autoSelectApplied = useRef(false);
  const shownTracked = useRef(false);

  const { products: warrantyProducts, isLoading } = useProducts("Warranties");
  const { config, estimateProducts, isLoading: isLoadingConfig } = useUpsellSettings();
  const { trackEvent } = useUpsellAnalytics();
  const { user } = useAuth();

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
        selected: existingSelection ? existingSelection.selected : false,
        isAutoAdded: false,
        // Enhanced fields from database
        costPrice: product.cost_price,
        isTopSeller: product.is_featured,
        conversionHint: product.conversion_hint
      };
    });
    setUpsellItems(warrantyUpsells);
  }, [warrantyProducts, existingUpsellItems]);

  // Track "shown" events when upsell items are displayed
  useEffect(() => {
    if (
      shownTracked.current ||
      !documentId ||
      upsellItems.length === 0 ||
      isLoading ||
      isLoadingConfig
    ) {
      return;
    }

    shownTracked.current = true;

    // Track each item as "shown"
    upsellItems.forEach(item => {
      trackEvent({
        documentType: 'estimate',
        documentId,
        productId: item.id,
        productName: item.title,
        productPrice: item.price,
        eventType: 'shown',
        jobType: jobContext?.job_type,
        clientId: jobContext?.clientId
      });
    });
  }, [documentId, upsellItems, isLoading, isLoadingConfig, trackEvent, jobContext]);

  // Auto-select products based on admin configuration (only for new documents)
  useEffect(() => {
    if (
      autoSelectApplied.current ||
      isLoadingConfig ||
      !config?.estimates?.auto_select ||
      estimateProducts.length === 0 ||
      existingUpsellItems.length > 0 ||
      upsellItems.length === 0 ||
      !documentId
    ) {
      return;
    }

    // Mark as applied to prevent re-running
    autoSelectApplied.current = true;

    const autoSelectProductIds = estimateProducts.map(p => p.id);
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
              parent_id: documentId,
              parent_type: documentType,
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

          // Track auto-added events
          itemsToAutoAdd
            .filter(item => newAutoAddedIds.has(item.id))
            .forEach(item => {
              trackEvent({
                documentType: 'estimate',
                documentId,
                productId: item.id,
                productName: item.title,
                productPrice: item.price,
                eventType: 'auto_added',
                jobType: jobContext?.job_type,
                clientId: jobContext?.clientId
              });
            });

          // Update document total
          const addedTotal = itemsToAutoAdd
            .filter(item => newAutoAddedIds.has(item.id))
            .reduce((sum, item) => sum + item.price, 0);

          if (addedTotal > 0) {
            await supabase
              .from('estimates')
              .update({ total: documentTotal + addedTotal })
              .eq('id', documentId);
          }

          toast.success(`${newAutoAddedIds.size} warranty product(s) auto-added`);
        }
      } catch (error) {
        console.error('Error auto-adding products:', error);
      } finally {
        setIsSavingWarranty(false);
      }
    };

    autoAddProducts();
  }, [config, estimateProducts, upsellItems, existingUpsellItems, documentId, documentType, documentTotal, isLoadingConfig]);

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

        // Track accepted event
        trackEvent({
          documentType: 'estimate',
          documentId,
          productId: item.id,
          productName: item.title,
          productPrice: item.price,
          eventType: 'accepted',
          jobType: jobContext?.job_type,
          clientId: jobContext?.clientId
        });

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

        // Track removed event
        trackEvent({
          documentType: 'estimate',
          documentId,
          productId: item.id,
          productName: item.title,
          productPrice: item.price,
          eventType: 'removed',
          jobType: jobContext?.job_type,
          clientId: jobContext?.clientId
        });

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

  if (isLoading || isLoadingConfig) {
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

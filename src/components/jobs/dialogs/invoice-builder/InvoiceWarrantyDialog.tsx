
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUpsellSettings } from "@/hooks/useUpsellSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface InvoiceWarrantyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (selectedWarranties: any[], notes: string) => void;
  invoiceTotal: number;
  invoiceId?: string;
  wasConvertedFromEstimate?: boolean;
}

export const InvoiceWarrantyDialog = ({
  open,
  onOpenChange,
  onContinue,
  invoiceTotal,
  invoiceId,
  wasConvertedFromEstimate,
}: InvoiceWarrantyDialogProps) => {
  const [notes, setNotes] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [hasExistingUpsellProducts, setHasExistingUpsellProducts] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { getProductsForAmount, isLoading: isLoadingConfig } = useUpsellSettings();

  // Get upsell products based on invoice total (uses conditional rules if configured)
  const upsellProducts = getProductsForAmount(invoiceTotal, 'invoices');

  useEffect(() => {
    const checkExistingUpsellProducts = async () => {
      if (!invoiceId || !open) return;

      try {
        setIsChecking(true);

        // Check if invoice already has upsell products
        const { data: lineItems } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', invoiceId)
          .eq('parent_type', 'invoice');

        // Check if any line items match configured upsell products
        const hasUpsellProducts = lineItems?.some((item: any) =>
          upsellProducts.some(p => item.description?.includes(p.name))
        ) || false;

        setHasExistingUpsellProducts(hasUpsellProducts);

        // Also check if the invoice was converted from an estimate with upsell products
        if (wasConvertedFromEstimate && !hasUpsellProducts) {
          const { data: invoice } = await supabase
            .from('invoices')
            .select('estimate_id')
            .eq('id', invoiceId)
            .single();

          if (invoice?.estimate_id) {
            const { data: estimateLineItems } = await supabase
              .from('line_items')
              .select('*')
              .eq('parent_id', invoice.estimate_id)
              .eq('parent_type', 'estimate');

            const hasEstimateUpsellProducts = estimateLineItems?.some((item: any) =>
              upsellProducts.some(p => item.description?.includes(p.name))
            ) || false;

            if (hasEstimateUpsellProducts) {
              setHasExistingUpsellProducts(true);
              console.log('Upsell products already exist in the original estimate');
            }
          }
        }
      } catch (error) {
        console.error('Error checking upsell products:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingUpsellProducts();
  }, [invoiceId, open, wasConvertedFromEstimate, upsellProducts]);

  const handleContinue = async () => {
    if (selectedProducts.length > 0 && invoiceId) {
      setIsSaving(true);
      try {
        // Add selected products to invoice
        for (const productId of selectedProducts) {
          const product = upsellProducts.find(p => p.id === productId);
          if (!product) continue;

          await supabase
            .from('line_items')
            .insert({
              parent_id: invoiceId,
              parent_type: 'invoice',
              description: product.name + (product.description ? ` - ${product.description}` : ''),
              quantity: 1,
              unit_price: product.price,
              taxable: false
            });
        }

        // Update invoice total only (balance is auto-calculated)
        const productsTotal = upsellProducts
          .filter(p => selectedProducts.includes(p.id))
          .reduce((sum, p) => sum + p.price, 0);

        await supabase
          .from('invoices')
          .update({
            total: invoiceTotal + productsTotal,
            notes: notes || undefined
          })
          .eq('id', invoiceId);

        toast.success("Products added successfully");
      } catch (error) {
        console.error('Error adding products:', error);
        toast.error("Failed to add products");
        return;
      } finally {
        setIsSaving(false);
      }
    }

    // Save notes if any
    if (notes && invoiceId && !selectedProducts.length) {
      await supabase
        .from('invoices')
        .update({ notes })
        .eq('id', invoiceId);
    }

    const selectedProductItems = upsellProducts
      .filter(p => selectedProducts.includes(p.id))
      .map(p => ({
        id: p.id,
        title: p.name,
        description: p.description || "",
        price: p.price,
        icon: Package,
        selected: true
      }));

    onContinue(selectedProductItems, notes);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onContinue([], notes);
    onOpenChange(false);
  };

  if (isChecking || isLoadingConfig) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Loading Products...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Recommended Products
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasExistingUpsellProducts || wasConvertedFromEstimate ? (
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                <strong>Products Already Included</strong>
                <br />
                {wasConvertedFromEstimate
                  ? "This invoice was converted from an estimate that already includes recommended products."
                  : "This invoice already includes recommended products."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Consider adding recommended products to provide additional value for your customer.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {upsellProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProducts.includes(product.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSelectedProducts(prev =>
                        prev.includes(product.id)
                          ? prev.filter(id => id !== product.id)
                          : [...prev, product.id]
                      );
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className={`h-5 w-5 ${
                          selectedProducts.includes(product.id)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`} />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold">+${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special notes about the products or service..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleSkip} disabled={isSaving}>
            Skip
          </Button>
          {!hasExistingUpsellProducts && !wasConvertedFromEstimate && (
            <Button onClick={handleContinue} disabled={isSaving || selectedProducts.length === 0}>
              {isSaving ? "Adding..." : `Add Selected (${selectedProducts.length})`}
            </Button>
          )}
          {(hasExistingUpsellProducts || wasConvertedFromEstimate) && (
            <Button onClick={handleSkip}>
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

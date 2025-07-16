
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProducts } from "@/hooks/useProducts";
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
  const [selectedWarranties, setSelectedWarranties] = useState<string[]>([]);
  const [hasExistingWarranties, setHasExistingWarranties] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { products: warrantyProducts, isLoading } = useProducts("Warranties");

  useEffect(() => {
    const checkExistingWarranties = async () => {
      if (!invoiceId || !open) return;

      try {
        setIsChecking(true);
        
        // Check if invoice already has warranties
        const { data: lineItems } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', invoiceId)
          .eq('parent_type', 'invoice');

        const hasWarranties = lineItems?.some((item: any) => 
          item.description?.toLowerCase().includes('warranty')
        ) || false;
        
        setHasExistingWarranties(hasWarranties);

        // Also check if the invoice was converted from an estimate with warranties
        if (wasConvertedFromEstimate && !hasWarranties) {
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

            const hasEstimateWarranties = estimateLineItems?.some((item: any) => 
              item.description?.toLowerCase().includes('warranty') ||
              warrantyProducts.some(wp => item.description?.includes(wp.name))
            ) || false;
            
            if (hasEstimateWarranties) {
              setHasExistingWarranties(true);
              console.log('Warranties already exist in the original estimate');
            }
          }
        }
      } catch (error) {
        console.error('Error checking warranties:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingWarranties();
  }, [invoiceId, open, wasConvertedFromEstimate, warrantyProducts]);

  const handleContinue = async () => {
    if (selectedWarranties.length > 0 && invoiceId) {
      setIsSaving(true);
      try {
        // Add selected warranties to invoice
        for (const warrantyId of selectedWarranties) {
          const warranty = warrantyProducts.find(p => p.id === warrantyId);
          if (!warranty) continue;

          await supabase
            .from('line_items')
            .insert({
              parent_id: invoiceId,
              parent_type: 'invoice',
              description: warranty.name + (warranty.description ? ` - ${warranty.description}` : ''),
              quantity: 1,
              unit_price: warranty.price,
              taxable: false
            });
        }

        // Update invoice total only (balance is auto-calculated)
        const warrantyTotal = warrantyProducts
          .filter(p => selectedWarranties.includes(p.id))
          .reduce((sum, p) => sum + p.price, 0);
        
        await supabase
          .from('invoices')
          .update({ 
            total: invoiceTotal + warrantyTotal,
            notes: notes || undefined
          })
          .eq('id', invoiceId);

        toast.success("Warranties added successfully");
      } catch (error) {
        console.error('Error adding warranties:', error);
        toast.error("Failed to add warranties");
        return;
      } finally {
        setIsSaving(false);
      }
    }

    // Save notes if any
    if (notes && invoiceId && !selectedWarranties.length) {
      await supabase
        .from('invoices')
        .update({ notes })
        .eq('id', invoiceId);
    }

    const selectedWarrantyItems = warrantyProducts
      .filter(p => selectedWarranties.includes(p.id))
      .map(p => ({
        id: p.id,
        title: p.name,
        description: p.description || "",
        price: p.price,
        icon: Shield,
        selected: true
      }));

    onContinue(selectedWarrantyItems, notes);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onContinue([], notes);
    onOpenChange(false);
  };

  if (isChecking || isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Checking Warranties...</DialogTitle>
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
            <Shield className="h-5 w-5" />
            Add Warranty Protection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasExistingWarranties || wasConvertedFromEstimate ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Warranties Already Included</strong>
                <br />
                {wasConvertedFromEstimate 
                  ? "This invoice was converted from an estimate that already includes warranty protection."
                  : "This invoice already includes warranty services."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Consider adding warranty protection to provide additional value and peace of mind for your customer.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {warrantyProducts.map((warranty) => (
                  <div
                    key={warranty.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedWarranties.includes(warranty.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSelectedWarranties(prev =>
                        prev.includes(warranty.id)
                          ? prev.filter(id => id !== warranty.id)
                          : [...prev, warranty.id]
                      );
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className={`h-5 w-5 ${
                          selectedWarranties.includes(warranty.id)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`} />
                        <div>
                          <p className="font-medium">{warranty.name}</p>
                          {warranty.description && (
                            <p className="text-sm text-muted-foreground">
                              {warranty.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold">+${warranty.price}</p>
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
              placeholder="Add any special notes about the warranty or service..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleSkip} disabled={isSaving}>
            Skip
          </Button>
          {!hasExistingWarranties && !wasConvertedFromEstimate && (
            <Button onClick={handleContinue} disabled={isSaving || selectedWarranties.length === 0}>
              {isSaving ? "Adding..." : `Add Selected (${selectedWarranties.length})`}
            </Button>
          )}
          {(hasExistingWarranties || wasConvertedFromEstimate) && (
            <Button onClick={handleSkip}>
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, Shield, AlertCircle } from "lucide-react";
import { Product } from "../../builder/types";
import { useProducts } from "@/hooks/useProducts";

interface WarrantySelectionStepProps {
  onSelectWarranty: (warranty: Product | null, note: string) => void;
  onSkip: () => void;
}

export const WarrantySelectionStep = ({
  onSelectWarranty,
  onSkip
}: WarrantySelectionStepProps) => {
  const [selectedWarrantyId, setSelectedWarrantyId] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState("");
  const { products, isLoading } = useProducts("Warranties");
  
  // Check if we have warranty products
  const hasWarranties = products.length > 0;

  useEffect(() => {
    if (products.length > 0) {
      // Default to first warranty
      setSelectedWarrantyId(products[0].id);
    }
  }, [products]);

  const handleConfirm = () => {
    const selectedWarranty = products.find(w => w.id === selectedWarrantyId) || null;
    onSelectWarranty(selectedWarranty, customNote);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Shield className="h-5 w-5" />
        <h3 className="text-lg font-medium">Recommend a Warranty</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-2">
        Adding a warranty increases customer satisfaction and provides additional value.
      </p>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading warranty options...</p>
        </div>
      ) : hasWarranties ? (
        <ScrollArea className="h-[300px] pr-4">
          <RadioGroup value={selectedWarrantyId || ""} onValueChange={setSelectedWarrantyId}>
            {products.map((warranty) => (
              <div 
                key={warranty.id}
                className={`flex items-start space-x-3 border rounded-md p-3 mb-3 hover:bg-muted/50 cursor-pointer ${
                  selectedWarrantyId === warranty.id ? "border-primary bg-primary/5" : "border-input"
                }`}
                onClick={() => setSelectedWarrantyId(warranty.id)}
              >
                <RadioGroupItem value={warranty.id} id={warranty.id} className="mt-1" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Label htmlFor={warranty.id} className="font-medium text-base cursor-pointer">
                      {warranty.name}
                    </Label>
                    <span className="font-medium">${warranty.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{warranty.description}</p>
                  <div className="mt-1 flex items-center text-sm text-green-600">
                    <Check size={14} className="mr-1" /> Protection against repair costs
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>
      ) : (
        <div className="border rounded-md p-4 bg-amber-50 border-amber-200 flex items-start gap-3">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm text-amber-800 font-medium">No warranty products found</p>
            <p className="text-sm text-amber-700 mt-1">Add warranty products to your catalog to offer them to customers.</p>
          </div>
        </div>
      )}
      
      <div className="space-y-2 pt-2">
        <Label htmlFor="custom-note">
          Custom note for customer (optional)
        </Label>
        <Input
          id="custom-note"
          placeholder="E.g., Based on the age of your unit, I'd recommend this warranty to prevent future repair costs..."
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onSkip} className="sm:mr-auto">
          Skip Warranty
        </Button>
        <Button onClick={handleConfirm} disabled={!hasWarranties || !selectedWarrantyId}>
          Add Warranty & Continue
        </Button>
      </div>
    </div>
  );
};


import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Shield } from "lucide-react";
import { Product } from "../builder/types";

interface WarrantySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedWarranty: Product | null, customNote: string) => void;
}

export const WarrantySelectionDialog = ({
  open,
  onOpenChange,
  onConfirm
}: WarrantySelectionDialogProps) => {
  const [selectedWarrantyId, setSelectedWarrantyId] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState("");
  
  // Warranty options with customer pain points addressed
  const warranties = [
    {
      id: "prod-3",
      name: "6-Month Warranty",
      description: "Extended warranty covering parts and labor. Eliminates worry about sudden repair costs after service.",
      category: "Warranties",
      price: 49,
      ourPrice: 0,
      cost: 0,
      taxable: false,
      tags: ["warranty", "protection"],
      benefit: "Basic coverage for common issues"
    },
    {
      id: "prod-4",
      name: "1-Year Warranty",
      description: "1-year extended warranty with expedited service. Peace of mind knowing your appliance is fully protected for a full year.",
      category: "Warranties",
      price: 89,
      ourPrice: 0,
      cost: 0,
      taxable: false,
      tags: ["warranty", "protection"],
      benefit: "Full year of coverage with expedited service"
    },
    {
      id: "prod-5",
      name: "2-Year Warranty",
      description: "2-year comprehensive warranty package. Save money on future repairs and maintenance with complete coverage.",
      category: "Warranties",
      price: 149,
      ourPrice: 0,
      cost: 0,
      taxable: false,
      tags: ["warranty", "protection"],
      benefit: "Extended coverage with annual maintenance"
    },
    {
      id: "prod-6",
      name: "5-Year Warranty",
      description: "Premium 5-year warranty with full coverage. Ultimate protection and priority emergency service for your valuable appliance.",
      category: "Warranties",
      price: 299,
      ourPrice: 0,
      cost: 0,
      taxable: false,
      tags: ["warranty", "protection", "premium"],
      benefit: "Maximum protection and priority emergency service"
    }
  ];

  useEffect(() => {
    if (open) {
      // Default to the first warranty option when opening
      setSelectedWarrantyId(warranties[0].id);
      setCustomNote("");
    }
  }, [open]);

  const handleConfirm = () => {
    const selectedWarranty = warranties.find(warranty => warranty.id === selectedWarrantyId) || null;
    onConfirm(selectedWarranty, customNote);
  };
  
  const handleSkip = () => {
    onConfirm(null, "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="text-green-600" size={20} />
            Recommend a Warranty
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Select a warranty to recommend to your customer. Warranties address customer concerns and provide peace of mind.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-4">
              <RadioGroup value={selectedWarrantyId || ""} onValueChange={setSelectedWarrantyId}>
                {warranties.map((warranty) => (
                  <div 
                    key={warranty.id}
                    className={`flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedWarrantyId === warranty.id ? "border-primary bg-primary/5" : "border-input"
                    }`}
                    onClick={() => setSelectedWarrantyId(warranty.id)}
                  >
                    <RadioGroupItem value={warranty.id} id={warranty.id} className="mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-2">
                        <Label htmlFor={warranty.id} className="font-semibold text-base cursor-pointer">
                          {warranty.name}
                        </Label>
                        <span className="font-bold text-xl text-primary">${warranty.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {warranty.description}
                      </p>
                      <div className="flex items-center text-sm text-green-600">
                        <Check size={16} className="mr-2 flex-shrink-0" /> 
                        <span className="font-medium">{warranty.benefit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </ScrollArea>
          
          <div className="flex-shrink-0 space-y-3 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="custom-note" className="text-sm font-medium">
                Custom note for customer (optional)
              </Label>
              <Input
                id="custom-note"
                placeholder="E.g., Based on the age of your unit, I'd recommend this warranty to prevent future repair costs..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleSkip} className="sm:mr-auto">
            Skip Recommendation
          </Button>
          <Button onClick={handleConfirm} size="lg" className="sm:min-w-[140px]">
            Add Recommendation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

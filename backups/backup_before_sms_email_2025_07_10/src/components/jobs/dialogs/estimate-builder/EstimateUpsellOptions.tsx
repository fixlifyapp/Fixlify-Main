
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/components/jobs/builder/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileWarning, Plus } from "lucide-react";
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";

export interface EstimateUpsellOptionsProps {
  warranty?: Product | null;
  techniciansNote?: string;
  onWarrantyChange: (warranty: Product | null) => void;
  onNotesChange: (note: string) => void;
}

export const EstimateUpsellOptions = ({
  warranty,
  techniciansNote = "",
  onWarrantyChange,
  onNotesChange
}: EstimateUpsellOptionsProps) => {
  const [showWarrantyOptions, setShowWarrantyOptions] = useState(false);
  const { products, isLoading } = useProducts("Warranties");

  const handleWarrantySelect = (product: Product) => {
    onWarrantyChange(product);
    setShowWarrantyOptions(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Warranty Options</h3>
        
        {warranty ? (
          <Card className="p-4 border-green-100 bg-green-50">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-md font-medium">{warranty.name}</h4>
                <p className="text-sm text-muted-foreground">{warranty.description}</p>
                <p className="text-md font-semibold mt-2">${warranty.price.toFixed(2)}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onWarrantyChange(null)}>
                Remove
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-4 border-dashed border-2 bg-muted/20">
            <div className="flex items-center justify-center flex-col py-4">
              <FileWarning className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No warranty selected</p>
              <Button size="sm" variant="outline" onClick={() => setShowWarrantyOptions(!showWarrantyOptions)}>
                <Plus className="h-4 w-4 mr-1" /> Add Warranty
              </Button>
            </div>
          </Card>
        )}

        {/* Warranty selection options */}
        {showWarrantyOptions && (
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium">Available Warranties</h4>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading warranties...</p>
            ) : products.length > 0 ? (
              <div className="space-y-2">
                {products.map(product => (
                  <Card 
                    key={product.id} 
                    className="p-3 cursor-pointer hover:bg-muted/10"
                    onClick={() => handleWarrantySelect(product)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium">{product.name}</h5>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                      <p className="font-semibold">${product.price.toFixed(2)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>No warranty products found. Add warranty products to your catalog.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium">Technician's Notes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add any notes or recommendations from the technician.
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="technicians-note">Notes</Label>
          <Textarea
            id="technicians-note"
            value={techniciansNote}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Enter any additional notes or recommendations..."
            className="min-h-[150px]"
          />
        </div>
      </div>
    </div>
  );
};

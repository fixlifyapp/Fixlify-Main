
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, ShieldCheck, Clock, DollarSign } from "lucide-react";
import { Product } from "../builder/types";

interface UpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendedProduct: Product | null;
  techniciansNote: string;
  onAccept: (product: Product) => void;
  onDecline: () => void;
}

export const UpsellDialog = ({
  open,
  onOpenChange,
  recommendedProduct,
  techniciansNote,
  onAccept,
  onDecline
}: UpsellDialogProps) => {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (open) {
      setShowDetails(false);
    }
  }, [open]);

  if (!recommendedProduct) return null;

  const handleAccept = () => {
    onAccept(recommendedProduct);
    onOpenChange(false);
  };

  const handleDecline = () => {
    onDecline();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Recommended Add-On</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{recommendedProduct.name}</h3>
                <p className="text-sm text-muted-foreground">{recommendedProduct.description}</p>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                ${recommendedProduct.price}
              </Badge>
            </div>

            {/* Key Benefits */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>Enhanced Protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Extended Coverage</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <span>Cost-Effective Solution</span>
              </div>
            </div>
          </div>

          {/* Technician's Note */}
          {techniciansNote && (
            <>
              <Separator />
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Technician's Recommendation:</h4>
                <p className="text-sm text-gray-700">{techniciansNote}</p>
              </div>
            </>
          )}

          {/* Additional Details Toggle */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground"
            >
              {showDetails ? "Hide Details" : "Show More Details"}
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-3 text-sm">
              <Separator />
              <div>
                <h5 className="font-medium mb-1">What's Included:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Comprehensive coverage for related components</li>
                  <li>Expedited service response</li>
                  <li>Parts and labor warranty</li>
                  <li>24/7 emergency support hotline</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-1">Why Now:</h5>
                <p className="text-muted-foreground">
                  Adding this service now while we're already on-site saves you money
                  on future service calls and ensures optimal system performance.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDecline}>
            Maybe Later
          </Button>
          <Button onClick={handleAccept} className="bg-gradient-to-r from-blue-600 to-purple-600">
            Add to Estimate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

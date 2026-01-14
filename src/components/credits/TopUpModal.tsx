import { useState } from "react";
import { Coins, Star, Sparkles, Check, CreditCard, Loader2 } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopUpModal({ open, onOpenChange }: TopUpModalProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    balance,
    packages,
    isLoadingPackages,
    loyaltyTier,
    getLoyaltyBonus,
    formatCreditsAsCurrency
  } = useCredits();

  const loyaltyBonus = getLoyaltyBonus();

  const handlePurchase = async () => {
    if (!selectedPackageId) {
      toast.error("Please select a package");
      return;
    }

    setIsProcessing(true);

    // TODO: Integrate with Stripe checkout
    // For now, show a message that Stripe integration is pending
    toast.info("Payment processing coming soon! Stripe integration pending.");

    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const totalCredits = selectedPackage
    ? selectedPackage.credits + selectedPackage.bonus_credits + Math.floor(selectedPackage.credits * loyaltyBonus / 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Add Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package to top up your balance
          </DialogDescription>
        </DialogHeader>

        {/* Current Balance */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current Balance:</span>
            <span className="font-semibold">{balance.toLocaleString()} credits</span>
          </div>
          {loyaltyTier !== "none" && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {loyaltyTier.charAt(0).toUpperCase() + loyaltyTier.slice(1)} (+{loyaltyBonus}% bonus)
            </Badge>
          )}
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-2 gap-3 py-2">
          {isLoadingPackages ? (
            <div className="col-span-2 flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            packages.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;
              const loyaltyCredits = Math.floor(pkg.credits * loyaltyBonus / 100);
              const totalPkgCredits = pkg.credits + pkg.bonus_credits + loyaltyCredits;
              const pricePerCredit = (pkg.price_cents / 100 / totalPkgCredits).toFixed(3);

              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={cn(
                    "relative flex flex-col p-4 rounded-lg border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                    pkg.is_featured && "ring-2 ring-yellow-500/20"
                  )}
                >
                  {/* Featured Badge */}
                  {pkg.is_featured && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <Badge className="bg-yellow-500 text-yellow-950 gap-1">
                        <Star className="h-3 w-3" />
                        Popular
                      </Badge>
                    </div>
                  )}

                  {/* Selected Check */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}

                  {/* Package Name */}
                  <div className="font-semibold mb-1">{pkg.name}</div>

                  {/* Description */}
                  {pkg.description && (
                    <div className="text-xs text-muted-foreground mb-2">
                      {pkg.description}
                    </div>
                  )}

                  {/* Credits */}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold">{pkg.credits.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">credits</span>
                  </div>

                  {/* Bonus Credits */}
                  {(pkg.bonus_credits > 0 || loyaltyCredits > 0) && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {pkg.bonus_credits > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{pkg.bonus_credits} bonus
                        </Badge>
                      )}
                      {loyaltyCredits > 0 && (
                        <Badge variant="outline" className="text-xs text-purple-600">
                          +{loyaltyCredits} loyalty
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mt-auto pt-2 border-t">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold">
                        ${(pkg.price_cents / 100).toFixed(0)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ${pricePerCredit}/credit
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Summary */}
        {selectedPackage && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Summary</span>
              <span className="text-sm text-muted-foreground">
                {selectedPackage.name} Package
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base credits:</span>
                <span>{selectedPackage.credits.toLocaleString()}</span>
              </div>
              {selectedPackage.bonus_credits > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Package bonus:</span>
                  <span>+{selectedPackage.bonus_credits.toLocaleString()}</span>
                </div>
              )}
              {loyaltyBonus > 0 && (
                <div className="flex justify-between text-purple-600">
                  <span>Loyalty bonus ({loyaltyBonus}%):</span>
                  <span>+{Math.floor(selectedPackage.credits * loyaltyBonus / 100).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total credits:</span>
                <span>{totalCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Value:</span>
                <span>{formatCreditsAsCurrency(totalCredits)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Button */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handlePurchase}
            disabled={!selectedPackageId || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {isProcessing ? "Processing..." : selectedPackage ? `Pay $${(selectedPackage.price_cents / 100).toFixed(0)}` : "Select Package"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


import React from "react";
import { Button } from "@/components/ui/button";
import { roundToCurrency } from "@/lib/utils";

interface QuickAmountButtonsProps {
  remainingBalance: number;
  maxPayment: number;
  onAmountSelect: (amount: string) => void;
  disabled: boolean;
}

export const QuickAmountButtons = ({ 
  remainingBalance, 
  maxPayment, 
  onAmountSelect, 
  disabled 
}: QuickAmountButtonsProps) => {
  const handleQuickAmount = (percentage: number) => {
    if (disabled) return;
    
    let quickAmount: number;
    
    // For 100%, use the exact maxPayment to avoid precision issues
    if (percentage === 100) {
      quickAmount = maxPayment;
    } else {
      quickAmount = roundToCurrency((remainingBalance * percentage) / 100);
    }
    
    // Ensure we don't exceed the max payment due to rounding
    quickAmount = Math.min(quickAmount, maxPayment);
    
    onAmountSelect(quickAmount.toFixed(2));
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={() => handleQuickAmount(25)}
        disabled={disabled}
      >
        25%
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={() => handleQuickAmount(50)}
        disabled={disabled}
      >
        50%
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={() => handleQuickAmount(100)}
        disabled={disabled}
      >
        Full
      </Button>
    </div>
  );
};

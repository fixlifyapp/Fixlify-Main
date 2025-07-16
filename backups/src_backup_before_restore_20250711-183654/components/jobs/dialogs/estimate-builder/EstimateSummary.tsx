
import { Input } from "@/components/ui/input";

interface EstimateSummaryProps {
  taxRate?: number; // Make optional since we'll use locked rate
  onTaxRateChange?: (value: string) => void; // Keep for compatibility but won't be used
  calculateSubtotal?: () => number;
  calculateTotalTax?: () => number;
  calculateGrandTotal?: () => number;
  calculateTotalMargin?: () => number;
  calculateMarginPercentage?: () => number;
  showMargin?: boolean;
}

// Lock tax rate to 13%
const LOCKED_TAX_RATE = 13;

export const EstimateSummary = ({
  calculateSubtotal = () => 0,
  calculateTotalTax = () => 0,
  calculateGrandTotal = () => 0,
  calculateTotalMargin,
  calculateMarginPercentage,
  showMargin = false
}: EstimateSummaryProps) => {
  const subtotal = typeof calculateSubtotal === 'function' ? calculateSubtotal() : 0;
  const totalTax = typeof calculateTotalTax === 'function' ? calculateTotalTax() : 0;
  const grandTotal = typeof calculateGrandTotal === 'function' ? calculateGrandTotal() : 0;
  
  // We'll only calculate the margin if showMargin is true and the functions are provided
  const displayMargin = showMargin && !!calculateTotalMargin && !!calculateMarginPercentage;
  const totalMargin = displayMargin && typeof calculateTotalMargin === 'function' ? calculateTotalMargin() : 0;
  const marginPercentage = displayMargin && typeof calculateMarginPercentage === 'function' ? calculateMarginPercentage() : 0;
  
  return (
    <div className="border p-4 rounded-md">
      <h3 className="font-semibold mb-4">Estimate Summary</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Tax Rate:</span>
            <span className="font-medium text-blue-600">{LOCKED_TAX_RATE}% (Locked)</span>
          </div>
          <span className="font-medium">${totalTax.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-lg">${grandTotal.toFixed(2)}</span>
        </div>
        
        {displayMargin && (
          <>
            <div className="border-t pt-4 flex justify-between items-center text-sm text-green-600">
              <span className="font-medium">Margin:</span>
              <span className="font-medium">${totalMargin.toFixed(2)} ({marginPercentage.toFixed(1)}%)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

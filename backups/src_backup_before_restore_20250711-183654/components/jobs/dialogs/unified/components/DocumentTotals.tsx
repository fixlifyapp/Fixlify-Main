
import { formatCurrency } from '@/lib/utils';
import { useTaxSettings } from '@/hooks/useTaxSettings';

interface DocumentTotalsProps {
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
}

export const DocumentTotals = ({
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal
}: DocumentTotalsProps) => {
  const { taxConfig } = useTaxSettings();

  return (
    <div className="mt-6 flex justify-end">
      <div className="w-80 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(calculateSubtotal())}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Tax:</span>
            <span className="text-sm font-medium text-blue-600">
              {taxConfig.label} {taxConfig.rate}% ({taxConfig.region})
            </span>
          </div>
          <span>{formatCurrency(calculateTotalTax())}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg border-t pt-2">
          <span>Total:</span>
          <span className="text-green-600">{formatCurrency(calculateGrandTotal())}</span>
        </div>
      </div>
    </div>
  );
};

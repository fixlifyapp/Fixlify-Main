
import { Separator } from "@/components/ui/separator";

interface CommissionSummaryProps {
  baseRate: number;
  commissionRules: any[];
  commissionFees: any[];
}

export const CommissionSummary = ({
  baseRate,
  commissionRules,
  commissionFees
}: CommissionSummaryProps) => {
  // Calculate total fee deductions
  const totalFeeDeduction = commissionFees
    .filter((fee: any) => fee.deductFromTotal)
    .reduce((acc: number, fee: any) => acc + fee.value, 0);
  
  // Calculate effective commission rate
  const effectiveRate = Math.max(0, baseRate - totalFeeDeduction);
  
  return (
    <div className="p-4 bg-gray-50 rounded-md">
      <h4 className="font-medium mb-2">Commission Summary</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Base Rate:</span>
          <span>{baseRate}%</span>
        </div>
        
        {commissionRules.length > 0 && (
          <div className="flex justify-between text-sm">
            <span>Average with Rules:</span>
            <span className="text-green-600 font-medium">
              {Math.round(commissionRules.reduce((acc, rule) => acc + rule.value, 0) / 
                (commissionRules.length || 1))}%
            </span>
          </div>
        )}
        
        <Separator className="my-2" />
        
        {commissionFees.length > 0 && (
          <div className="flex justify-between text-sm">
            <span>Average Fee Deduction:</span>
            <span className="text-red-600">
              -{totalFeeDeduction.toFixed(1)}%
            </span>
          </div>
        )}
        
        <div className="flex justify-between font-medium">
          <span>Effective Commission Rate:</span>
          <span>{effectiveRate.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        This is an estimate based on historical job data and current settings.
      </div>
    </div>
  );
};

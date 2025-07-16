
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface PricingCardProps {
  diagnosticPrice: number;
  emergencySurcharge: number;
  onDiagnosticPriceChange: (value: number) => void;
  onEmergencySurchargeChange: (value: number) => void;
}

export const PricingCard = ({ 
  diagnosticPrice, 
  emergencySurcharge, 
  onDiagnosticPriceChange, 
  onEmergencySurchargeChange 
}: PricingCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Service Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="diagnostic_price">Diagnostic Fee ($)</Label>
            <Input
              id="diagnostic_price"
              type="number"
              step="0.01"
              value={diagnosticPrice}
              onChange={(e) => onDiagnosticPriceChange(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="emergency_surcharge">Emergency Surcharge ($)</Label>
            <Input
              id="emergency_surcharge"
              type="number"
              step="0.01"
              value={emergencySurcharge}
              onChange={(e) => onEmergencySurchargeChange(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

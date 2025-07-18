
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, Plus, Shield } from "lucide-react";

interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: any;
  selected: boolean;
}

interface EstimateSummaryCardProps {
  estimateTotal: number;
  selectedUpsells: UpsellItem[];
  upsellTotal: number;
  grandTotal: number;
}

export const EstimateSummaryCard = ({
  estimateTotal,
  selectedUpsells,
  upsellTotal,
  grandTotal
}: EstimateSummaryCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Calculator className="h-5 w-5" />
          Estimate Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Estimate */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Base Estimate</p>
              <p className="text-sm text-gray-500">Service and materials</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-gray-900">${estimateTotal.toFixed(2)}</span>
        </div>

        {/* Selected Add-ons */}
        {selectedUpsells.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Plus className="h-4 w-4" />
              Selected Add-ons
            </div>
            {selectedUpsells.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">{item.title}</p>
                    <p className="text-sm text-green-600">Extended protection</p>
                  </div>
                </div>
                <span className="font-semibold text-green-700">+${item.price.toFixed(2)}</span>
              </div>
            ))}
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <span className="font-medium text-gray-700">Add-ons Subtotal:</span>
              <span className="font-semibold text-gray-900">${upsellTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Grand Total */}
        <Separator className="my-4" />
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Total Estimate</p>
              <p className="text-blue-100 text-sm">Final amount</p>
            </div>
          </div>
          <span className="text-2xl font-bold">${grandTotal.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

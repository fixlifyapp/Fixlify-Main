
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CommissionFee } from "@/types/team-member";
import { toast } from "sonner";
import { CommissionSummary } from "./CommissionSummary";

interface FeesSectionProps {
  commissionFees: CommissionFee[];
  baseRate: number;
  commissionRules: any[];
  isEditing: boolean;
  canManageCommissions: boolean;
  onFeeToggle: (id: string) => void;
  onFeeValueChange: (id: string, value: number) => void;
  onAddFee: (fee: CommissionFee) => void;
}

export const FeesSection = ({
  commissionFees,
  baseRate,
  commissionRules,
  isEditing,
  canManageCommissions,
  onFeeToggle,
  onFeeValueChange,
  onAddFee
}: FeesSectionProps) => {
  
  const addNewFee = () => {
    if (!isEditing || !canManageCommissions) return;
    
    const newFee: CommissionFee = {
      id: Date.now().toString(),
      name: "New Fee",
      value: 3,
      deductFromTotal: true
    };
    
    onAddFee(newFee);
    toast.success("Fee added");
  };
    
  return (
    <Card className="p-6 border-fixlyfy-border shadow-sm">
      <h3 className="text-lg font-medium mb-4">Commission Fees & Deductions</h3>
      
      <div className="space-y-6">
        {commissionFees.length === 0 ? (
          <div className="text-center p-4 bg-gray-50 rounded-md text-muted-foreground">
            No commission fees defined yet.
          </div>
        ) : (
          commissionFees.map(fee => (
            <div key={fee.id} className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor={`fee-${fee.id}`}>{fee.name}</Label>
                <div className="flex items-center">
                  <Input
                    id={`fee-${fee.id}`}
                    type="number"
                    value={fee.value}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        onFeeValueChange(fee.id, value);
                      }
                    }}
                    disabled={!isEditing}
                    className="w-20 text-right mr-2"
                    min="0"
                    step="0.1"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
              
              <Slider
                disabled={!isEditing}
                value={[fee.value]}
                onValueChange={(value) => onFeeValueChange(fee.id, value[0])}
                max={10}
                step={0.1}
              />
              
              <div className="flex items-center justify-between mt-2">
                <Label htmlFor={`deduct-${fee.id}`} className="text-sm text-muted-foreground">
                  Deduct from commission total
                </Label>
                <Switch
                  id={`deduct-${fee.id}`}
                  checked={fee.deductFromTotal}
                  onCheckedChange={() => onFeeToggle(fee.id)}
                  disabled={!isEditing}
                />
              </div>
              
              <Separator className="mt-4" />
            </div>
          ))
        )}
        
        {isEditing && (
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={addNewFee}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Custom Fee
          </Button>
        )}
      </div>
      
      <div className="mt-6">
        <CommissionSummary
          baseRate={baseRate}
          commissionRules={commissionRules}
          commissionFees={commissionFees}
        />
      </div>
    </Card>
  );
};

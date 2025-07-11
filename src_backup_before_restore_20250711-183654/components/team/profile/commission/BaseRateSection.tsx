
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface BaseRateSectionProps {
  baseRate: number;
  isEditing: boolean;
  canManageCommissions: boolean;
  isSaving: boolean;
  onBaseRateChange: (value: number[]) => void;
  onBaseRateInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export const BaseRateSection = ({
  baseRate,
  isEditing,
  canManageCommissions,
  isSaving,
  onBaseRateChange,
  onBaseRateInputChange,
  onSave
}: BaseRateSectionProps) => {
  return (
    <Card className="p-6 border-fixlyfy-border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Base Commission Rate</h3>
        {isEditing && (
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : "Save Changes"}
          </Button>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="base-rate">Base Commission Rate (%)</Label>
          <Input
            id="base-rate"
            type="number"
            value={baseRate}
            onChange={onBaseRateInputChange}
            disabled={!isEditing}
            className="w-20 text-right"
            min="0"
            max="100"
          />
        </div>
        
        <Slider
          disabled={!isEditing}
          value={[baseRate]}
          onValueChange={onBaseRateChange}
          max={100}
          step={1}
          className="my-4"
        />
        
        <div className="text-sm text-muted-foreground">
          This is the default commission rate for all jobs. Special rules can override this rate.
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm">
            <span className="font-medium">Estimated earnings:</span>{" "}
            ${(75 * baseRate / 100).toFixed(2)}/hour based on labor cost
          </p>
        </div>
      </div>
    </Card>
  );
};


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash } from "lucide-react";
import { DryerIcon, DishwasherIcon, FridgeIcon, WasherIcon } from "@/components/icons/ApplianceIcons";

type ApplianceType = {
  id: number;
  type: "dryer" | "dishwasher" | "fridge" | "washer";
  model?: string;
};

interface ApplianceTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAppliances: ApplianceType[];
  onSave: (appliances: ApplianceType[]) => void;
}

export function ApplianceTypeDialog({
  open,
  onOpenChange,
  initialAppliances,
  onSave,
}: ApplianceTypeDialogProps) {
  const [appliances, setAppliances] = useState<ApplianceType[]>(initialAppliances);

  // Get next ID for new appliance
  const getNextId = () => {
    return appliances.length > 0 ? Math.max(...appliances.map(a => a.id)) + 1 : 1;
  };

  // Add new appliance
  const handleAddAppliance = () => {
    setAppliances([
      ...appliances, 
      { id: getNextId(), type: "washer" }
    ]);
  };

  // Remove appliance
  const handleRemoveAppliance = (id: number) => {
    setAppliances(appliances.filter(appliance => appliance.id !== id));
  };

  // Update appliance field
  const handleUpdateAppliance = (id: number, field: keyof ApplianceType, value: any) => {
    setAppliances(appliances.map(appliance => 
      appliance.id === id ? { ...appliance, [field]: value } : appliance
    ));
  };

  // Handle save
  const handleSave = () => {
    onSave(appliances);
    toast.success("Appliances updated successfully");
    onOpenChange(false);
  };

  // Get icon for appliance type
  const getApplianceIcon = (type: ApplianceType['type']) => {
    switch (type) {
      case "dryer": return <DryerIcon size={18} />;
      case "dishwasher": return <DishwasherIcon size={18} />;
      case "fridge": return <FridgeIcon size={18} />;
      case "washer": return <WasherIcon size={18} />;
      default: return <DryerIcon size={18} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Appliances</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {appliances.map((appliance) => (
            <div key={appliance.id} className="flex items-center space-x-3">
              <div className="w-1/3">
                <Select
                  value={appliance.type}
                  onValueChange={(value) => handleUpdateAppliance(appliance.id, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {getApplianceIcon(appliance.type as ApplianceType['type'])}
                        <span className="capitalize">{appliance.type}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dryer">
                      <div className="flex items-center gap-2">
                        <DryerIcon size={16} />
                        <span>Dryer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dishwasher">
                      <div className="flex items-center gap-2">
                        <DishwasherIcon size={16} />
                        <span>Dishwasher</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fridge">
                      <div className="flex items-center gap-2">
                        <FridgeIcon size={16} />
                        <span>Refrigerator</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="washer">
                      <div className="flex items-center gap-2">
                        <WasherIcon size={16} />
                        <span>Washer</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-grow">
                <Input
                  placeholder="Model (optional)"
                  value={appliance.model || ""}
                  onChange={(e) => handleUpdateAppliance(appliance.id, "model", e.target.value)}
                />
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveAppliance(appliance.id)}
              >
                <Trash size={16} className="text-red-500" />
              </Button>
            </div>
          ))}
          
          {appliances.length === 0 && (
            <div className="text-center py-2 text-gray-500">
              No appliances added
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddAppliance}
            className="w-full mt-2"
          >
            <Plus size={16} className="mr-1" /> Add Appliance
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

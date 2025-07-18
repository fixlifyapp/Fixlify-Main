
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineItem } from "@/components/jobs/builder/types";
import { Switch } from "@/components/ui/switch";

interface CustomLineItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Partial<LineItem>) => void;
  initialItem?: Partial<LineItem>;
}

export const CustomLineItemDialog = ({
  open,
  onOpenChange,
  onSave,
  initialItem
}: CustomLineItemDialogProps) => {
  const [item, setItem] = useState<Partial<LineItem>>(initialItem || {
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxable: true,
    discount: 0
  });

  const handleChange = (field: keyof LineItem, value: any) => {
    setItem(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({
      ...item,
      total: (item.quantity || 1) * (item.unitPrice || 0)
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              value={item.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Repair Service"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={item.quantity || 1}
                onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Customer Price ($)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice || 0}
                onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <div className="flex items-center">
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  max={100}
                  className="mr-2"
                  value={item.discount || 0}
                  onChange={(e) => handleChange("discount", parseFloat(e.target.value) || 0)}
                />
                <span>%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost">Our Price ($)</Label>
              <Input
                id="cost"
                type="number"
                min={0}
                step="0.01"
                value={item.ourPrice || 0}
                onChange={(e) => handleChange("ourPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description/Notes</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={item.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Add any details or notes about this item..."
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="taxable" 
              checked={item.taxable}
              onCheckedChange={(checked) => handleChange("taxable", checked)} 
            />
            <Label htmlFor="taxable">Taxable Item</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} type="submit">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

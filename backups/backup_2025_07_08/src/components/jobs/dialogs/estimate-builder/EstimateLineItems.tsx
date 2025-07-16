
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { LineItem } from "@/components/jobs/builder/types";

interface EstimateLineItemsProps {
  lineItems: LineItem[];
  onAddItem: (item: Partial<LineItem>) => void;
  onUpdateItem: (id: string, updates: Partial<LineItem>) => void;
  onRemoveItem: (id: string) => void;
  isLoading: boolean;
}

export const EstimateLineItems = ({
  lineItems,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  isLoading
}: EstimateLineItemsProps) => {
  const handleAddEmptyItem = () => {
    onAddItem({
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxable: true
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Line Items</CardTitle>
          <Button onClick={handleAddEmptyItem} size="sm" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lineItems.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor={`desc-${item.id}`}>Description</Label>
                  <Input
                    id={`desc-${item.id}`}
                    value={item.description}
                    onChange={(e) => onUpdateItem(item.id, { description: e.target.value })}
                    placeholder="Item description"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`qty-${item.id}`}>Quantity</Label>
                    <Input
                      id={`qty-${item.id}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                      min="1"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`price-${item.id}`}>Unit Price</Label>
                    <Input
                      id={`price-${item.id}`}
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                disabled={isLoading}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              Total: ${(item.quantity * item.unitPrice).toFixed(2)}
            </div>
          </div>
        ))}
        {lineItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No items added yet. Click "Add Item" to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

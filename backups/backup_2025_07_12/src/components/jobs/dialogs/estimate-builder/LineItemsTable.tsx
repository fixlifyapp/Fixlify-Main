
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { LineItem } from "@/components/jobs/builder/types";

interface LineItemsTableProps {
  lineItems: LineItem[];
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onEditLineItem: (id: string) => boolean;
  onRemoveLineItem: (id: string) => void;
  showMargin?: boolean;
  showOurPrice?: boolean;
}

export const LineItemsTable = ({
  lineItems = [], // Provide default empty array
  onUpdateLineItem,
  onEditLineItem,
  onRemoveLineItem,
  showMargin = false,
  showOurPrice = false
}: LineItemsTableProps) => {
  
  // Helper function to calculate the total for a line item
  const calculateLineTotal = (item: LineItem): number => {
    const price = item.unitPrice;
    const subtotal = item.quantity * price;
    const discountAmount = item.discount ? subtotal * (item.discount / 100) : 0;
    const afterDiscount = subtotal - discountAmount;
    return afterDiscount;
  };

  // Helper function to calculate the margin for a line item
  const calculateMargin = (item: LineItem): number => {
    const revenue = calculateLineTotal(item);
    const cost = item.quantity * (item.ourPrice || 0);
    return revenue - cost;
  };

  // Helper function to calculate margin percentage
  const calculateMarginPercentage = (item: LineItem): number => {
    const margin = calculateMargin(item);
    const revenue = calculateLineTotal(item);
    if (revenue === 0) return 0;
    return (margin / revenue) * 100;
  };

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Description</TableHead>
            <TableHead className="w-[70px]">Qty</TableHead>
            <TableHead className="w-[100px]">Customer Price ($)</TableHead>
            {showOurPrice && (
              <TableHead className="w-[100px]">Our Price ($)</TableHead>
            )}
            <TableHead className="w-[70px]">Discount</TableHead>
            <TableHead className="w-[120px] text-right">Total</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(lineItems) && lineItems.length > 0 ? (
            lineItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/20 group">
                <TableCell>
                  <div className="line-clamp-2">
                    {item.description || (item.name || "")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">{item.quantity}</div>
                </TableCell>
                <TableCell>
                  <div className="pl-2">
                    ${item.unitPrice.toFixed(2)}
                  </div>
                </TableCell>
                {showOurPrice && (
                  <TableCell>
                    <div className="pl-2">
                      ${(item.ourPrice || 0).toFixed(2)}
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div className="text-center">
                    {item.discount || 0}%
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div>
                    <div className="font-medium">${calculateLineTotal(item).toFixed(2)}</div>
                    {showMargin && showOurPrice && item.ourPrice > 0 && (
                      <div className="text-xs text-green-600">
                        M: ${calculateMargin(item).toFixed(2)} ({calculateMarginPercentage(item).toFixed(0)}%)
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditLineItem(item.id)}
                      title="Edit product details"
                      className="h-8 w-8"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveLineItem(item.id)}
                      title="Remove item"
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showOurPrice ? 7 : 6} className="text-center py-8 text-muted-foreground">
                No items added yet. Add items from the catalog or create a custom line item.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};


import React from "react";
import { LineItem } from "@/components/jobs/builder/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MobileLineItemCardProps {
  item: LineItem;
  isEditable?: boolean;
  onUpdateLineItem?: (id: string, field: string, value: any) => void;
  onRemoveLineItem?: (id: string) => void;
  onEditProduct?: (item: LineItem) => void;
}

export const MobileLineItemCard = ({
  item,
  isEditable,
  onUpdateLineItem,
  onRemoveLineItem,
  onEditProduct
}: MobileLineItemCardProps) => {
  const calculateMargin = () => {
    const revenue = item.quantity * item.unitPrice;
    const cost = item.quantity * (item.ourPrice || 0);
    return revenue - cost;
  };

  const calculateMarginPercentage = () => {
    const margin = calculateMargin();
    const revenue = item.quantity * item.unitPrice;
    if (revenue === 0) return 0;
    return (margin / revenue) * 100;
  };

  const getMarginColor = (percentage: number): string => {
    if (percentage < 20) return 'text-red-600';
    if (percentage < 40) return 'text-orange-600';
    return 'text-green-600';
  };

  const marginPercentage = calculateMarginPercentage();
  const margin = calculateMargin();

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        {/* Product Name */}
        <div className="mb-3">
          {isEditable ? (
            <Input
              value={item.description || item.name || ''}
              onChange={(e) => onUpdateLineItem!(item.id, 'description', e.target.value)}
              className="font-medium"
              placeholder="Product description"
            />
          ) : (
            <h4 className="font-medium text-gray-900">{item.description || item.name}</h4>
          )}
        </div>

        {/* Quantity and Prices Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Quantity */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Quantity</label>
            {isEditable ? (
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdateLineItem!(item.id, 'quantity', parseInt(e.target.value) || 1)}
                className="text-sm"
              />
            ) : (
              <p className="text-sm font-medium">{item.quantity}</p>
            )}
          </div>

          {/* Unit Price */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Customer Price</label>
            {isEditable ? (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => onUpdateLineItem!(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                className="text-sm"
              />
            ) : (
              <p className="text-sm font-medium">{formatCurrency(item.unitPrice)}</p>
            )}
          </div>

          {/* Our Price */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Our Price</label>
            {isEditable ? (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.ourPrice || 0}
                onChange={(e) => onUpdateLineItem!(item.id, 'ourPrice', parseFloat(e.target.value) || 0)}
                className="text-sm bg-yellow-50"
              />
            ) : (
              <p className="text-sm font-medium">{formatCurrency(item.ourPrice || 0)}</p>
            )}
          </div>

          {/* Taxable */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Taxable</label>
            {isEditable ? (
              <Select 
                value={item.taxable.toString()} 
                onValueChange={(value) => onUpdateLineItem!(item.id, 'taxable', value === 'true')}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm font-medium">{item.taxable ? 'Yes' : 'No'}</p>
            )}
          </div>
        </div>

        {/* Total and Margin */}
        <div className="flex justify-between items-center pt-3 border-t">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</p>
            {item.ourPrice && item.ourPrice > 0 && (
              <p className={`text-xs ${getMarginColor(marginPercentage)}`}>
                Margin: {formatCurrency(margin)} ({marginPercentage.toFixed(0)}%)
              </p>
            )}
          </div>

          {/* Actions */}
          {isEditable && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditProduct && onEditProduct(item)}
                className="text-blue-600"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveLineItem!(item.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

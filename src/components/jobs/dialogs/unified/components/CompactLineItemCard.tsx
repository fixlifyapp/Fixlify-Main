import React from "react";
import { LineItem } from "@/components/jobs/builder/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Package, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CompactLineItemCardProps {
  item: LineItem;
  index: number;
  isEditable?: boolean;
  onUpdateLineItem?: (id: string, field: string, value: any) => void;
  onRemoveLineItem?: (id: string) => void;
  onEditProduct?: (item: LineItem) => void;
}

export const CompactLineItemCard = ({
  item,
  index,
  isEditable,
  onUpdateLineItem,
  onRemoveLineItem,
  onEditProduct
}: CompactLineItemCardProps) => {
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
    if (percentage < 20) return 'text-red-600 bg-red-50';
    if (percentage < 40) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const marginPercentage = calculateMarginPercentage();
  const margin = calculateMargin();
  const lineTotal = item.quantity * item.unitPrice;

  return (
    <div className={cn(
      "group relative rounded-lg border bg-card transition-all hover:shadow-sm hover:border-violet-200",
      index === 0 && "animate-in fade-in slide-in-from-top-2 duration-200"
    )}>
      {/* Main Content Row */}
      <div className="flex items-start gap-3 p-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-violet-100 flex items-center justify-center">
          <Package className="h-4 w-4 text-violet-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Product Name Row */}
          <div className="flex items-start justify-between gap-2">
            {isEditable ? (
              <Input
                value={item.description || item.name || ''}
                onChange={(e) => onUpdateLineItem!(item.id, 'description', e.target.value)}
                className="h-7 text-sm font-medium border-0 p-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Product name"
              />
            ) : (
              <p className="font-medium text-sm text-gray-900 truncate">
                {item.description || item.name}
              </p>
            )}

            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {item.taxable && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-600 border-blue-200">
                  Tax
                </Badge>
              )}
              {item.ourPrice && item.ourPrice > 0 && (
                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", getMarginColor(marginPercentage))}>
                  {marginPercentage.toFixed(0)}%
                </Badge>
              )}
            </div>
          </div>

          {/* Inputs Row - Compact inline */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quantity */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Qty</span>
              {isEditable ? (
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateLineItem!(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  className="h-6 w-12 text-xs text-center px-1"
                />
              ) : (
                <span className="text-xs font-medium">{item.quantity}</span>
              )}
            </div>

            <span className="text-muted-foreground">×</span>

            {/* Price */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Price</span>
              {isEditable ? (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => onUpdateLineItem!(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="h-6 w-16 text-xs text-right px-1"
                />
              ) : (
                <span className="text-xs font-medium">{formatCurrency(item.unitPrice)}</span>
              )}
            </div>

            {/* Our Cost (Internal) - Yellow highlight */}
            <div className="flex items-center gap-1 bg-amber-50 rounded px-1.5 py-0.5">
              <span className="text-[10px] text-amber-700 uppercase tracking-wide">Our Cost</span>
              {isEditable ? (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.ourPrice || 0}
                  onChange={(e) => onUpdateLineItem!(item.id, 'ourPrice', parseFloat(e.target.value) || 0)}
                  className="h-5 w-14 text-xs text-right px-1 bg-transparent border-0 focus-visible:ring-0"
                />
              ) : (
                <span className="text-xs font-medium text-amber-700">{formatCurrency(item.ourPrice || 0)}</span>
              )}
            </div>

            {/* Tax Toggle */}
            {isEditable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateLineItem!(item.id, 'taxable', !item.taxable)}
                className={cn(
                  "h-6 px-2 text-[10px] uppercase tracking-wide",
                  item.taxable ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {item.taxable ? "Taxed" : "No Tax"}
              </Button>
            )}
          </div>
        </div>

        {/* Right Side - Total & Actions */}
        <div className="flex-shrink-0 text-right space-y-1">
          <p className="text-sm font-semibold text-gray-900">{formatCurrency(lineTotal)}</p>
          {item.ourPrice && item.ourPrice > 0 && (
            <p className={cn("text-[10px]", marginPercentage >= 40 ? "text-emerald-600" : marginPercentage >= 20 ? "text-amber-600" : "text-red-600")}>
              +{formatCurrency(margin)}
            </p>
          )}

          {/* Actions */}
          {isEditable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => onEditProduct && onEditProduct(item)}>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRemoveLineItem!(item.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};

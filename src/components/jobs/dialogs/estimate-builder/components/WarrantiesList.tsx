
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Star, DollarSign, Flame, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: any;
  selected: boolean;
  // Optional enhanced fields from DB or calculated
  isTopSeller?: boolean;      // From products.is_featured
  profitMargin?: number;      // Calculated from cost_price
  conversionRate?: number;
  conversionHint?: string;    // From products.conversion_hint
  isAutoAdded?: boolean;
  costPrice?: number;         // From products.cost_price for real margin calc
}

interface WarrantiesListProps {
  upsellItems: UpsellItem[];
  existingUpsellItems: UpsellItem[];
  isProcessing: boolean;
  onUpsellToggle: (itemId: string) => void;
}

// Get top seller status - use is_featured from DB if available, otherwise estimate from price
const getIsTopSeller = (item: UpsellItem): boolean => {
  if (item.isTopSeller !== undefined) return item.isTopSeller;
  // Fallback: Items in the $50-150 range tend to be best sellers
  return item.price >= 50 && item.price <= 150;
};

// Calculate profit margin - use real cost_price from DB if available
const getEstimatedProfitMargin = (item: UpsellItem): number => {
  // If we have cost price, calculate real margin
  if (item.costPrice !== undefined && item.costPrice > 0) {
    return Math.round(((item.price - item.costPrice) / item.price) * 100);
  }
  if (item.profitMargin !== undefined) return item.profitMargin;
  // Fallback: Warranties typically have 60-80% margins based on price point
  if (item.price < 50) return 65;
  if (item.price < 100) return 70;
  if (item.price < 200) return 75;
  return 80;
};

// Get conversion hint - use DB value if available, otherwise estimate from price
const getConversionHint = (item: UpsellItem): string | null => {
  if (item.conversionHint) return item.conversionHint;
  // Fallback based on price point
  if (item.price <= 49) return "High adoption rate";
  if (item.price <= 99) return "Best value";
  if (item.price <= 149) return "Popular choice";
  if (item.price <= 199) return "Premium protection";
  return null;
};

export const WarrantiesList = ({
  upsellItems,
  existingUpsellItems,
  isProcessing,
  onUpsellToggle
}: WarrantiesListProps) => {
  // Sort items: top sellers first, then by price descending
  const sortedItems = [...upsellItems].sort((a, b) => {
    const aIsTopSeller = getIsTopSeller(a);
    const bIsTopSeller = getIsTopSeller(b);
    if (aIsTopSeller && !bIsTopSeller) return -1;
    if (!aIsTopSeller && bIsTopSeller) return 1;
    return b.price - a.price;
  });

  const selectedCount = upsellItems.filter(item => item.selected).length;

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Warranty Protection</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Boost Revenue
            </Badge>
          </div>
          {selectedCount > 0 && (
            <Badge className="bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {selectedCount} Selected
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add value with extended protection plans - average 70% profit margin
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedItems.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No warranty products available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add warranty products to your catalog to offer them to customers.
            </p>
          </div>
        ) : (
          sortedItems.map((item, index) => {
            const Icon = item.icon;
            const isAlreadyAdded = existingUpsellItems.some(existing =>
              existing.id === item.id && existing.selected
            );
            const isTopSeller = getIsTopSeller(item);
            const profitMargin = getEstimatedProfitMargin(item);
            const conversionHint = getConversionHint(item);

            return (
              <div
                key={item.id}
                className={cn(
                  "relative flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200",
                  item.selected
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm",
                  isTopSeller && !item.selected && "border-amber-300 bg-amber-50/50",
                  isProcessing && "opacity-60 cursor-not-allowed"
                )}
              >
                {/* Top Seller Badge */}
                {isTopSeller && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md animate-pulse">
                      <Flame className="h-3 w-3 mr-1" />
                      Top Seller
                    </Badge>
                  </div>
                )}

                {/* First item highlight */}
                {index === 0 && !isTopSeller && (
                  <div className="absolute -top-2 left-4 z-10">
                    <Badge variant="secondary" className="bg-blue-600 text-white shadow-sm">
                      <Star className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                )}

                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "rounded-full p-2 flex-shrink-0",
                    item.selected ? "bg-green-200" : isTopSeller ? "bg-amber-200" : "bg-blue-100"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      item.selected ? "text-green-700" : isTopSeller ? "text-amber-700" : "text-blue-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium flex items-center gap-2 flex-wrap">
                      <span className="truncate">{item.title}</span>
                      {item.isAutoAdded && (
                        <Badge className="text-xs bg-violet-100 text-violet-700 border-violet-200">
                          <Zap className="h-3 w-3 mr-1" />
                          Auto-added
                        </Badge>
                      )}
                      {isAlreadyAdded && !item.isAutoAdded && (
                        <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Already Added
                        </Badge>
                      )}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    )}

                    {/* Price and Profit Info */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={cn(
                        "text-lg font-bold",
                        item.selected ? "text-green-600" : "text-blue-600"
                      )}>
                        +${item.price.toFixed(2)}
                      </span>

                      {/* Profit Margin Indicator */}
                      <div className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        <DollarSign className="h-3 w-3" />
                        <span>{profitMargin}% margin</span>
                      </div>

                      {/* Conversion Hint */}
                      {conversionHint && (
                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
                          {conversionHint}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <Switch
                    checked={item.selected}
                    onCheckedChange={() => onUpsellToggle(item.id)}
                    disabled={isProcessing}
                    className={cn(
                      item.selected && "data-[state=checked]:bg-green-600"
                    )}
                  />
                </div>
              </div>
            );
          })
        )}

        {/* Quick Stats Footer */}
        {sortedItems.length > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground">{sortedItems.length}</strong> warranty options available
              </span>
              <span className="text-green-700 font-medium">
                Avg. {Math.round(sortedItems.reduce((sum, i) => sum + getEstimatedProfitMargin(i), 0) / sortedItems.length)}% profit margin
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

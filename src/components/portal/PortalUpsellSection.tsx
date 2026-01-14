/**
 * PortalUpsellSection Component - 2026 Design
 * Client-facing upsell recommendations in the portal
 * WITH CHECKBOXES - items can be pre-selected by default
 * Shows running total of selected upsells
 */

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface UpsellItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  savings?: string; // e.g., "Saves $400+ on repairs"
  popular?: boolean; // Show "Popular" badge
  icon?: 'shield' | 'star' | 'sparkles'; // Optional icon override
}

interface PortalUpsellSectionProps {
  items: UpsellItem[];
  companyName?: string;
  documentType: 'estimate' | 'invoice';
  /** Items that should be pre-selected by default */
  defaultSelected?: boolean;
  /** Initial selected item IDs (overrides defaultSelected) */
  initialSelectedIds?: string[];
  /** Called when selection changes with all currently selected items */
  onSelectionChange?: (selectedItems: UpsellItem[], totalAmount: number) => void;
  /** Called when user wants more info about an item */
  onLearnMore?: (item: UpsellItem) => void;
  className?: string;
  /** Whether to show the section even with no items */
  showEmpty?: boolean;
}

// Icon mapping
const getItemIcon = (iconType?: 'shield' | 'star' | 'sparkles') => {
  switch (iconType) {
    case 'shield':
      return Shield;
    case 'star':
      return Star;
    default:
      return Sparkles;
  }
};

export function PortalUpsellSection({
  items,
  companyName,
  documentType,
  defaultSelected = false,
  initialSelectedIds,
  onSelectionChange,
  onLearnMore,
  className,
  showEmpty = false,
}: PortalUpsellSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // Initialize selected items - either from initialSelectedIds or all if defaultSelected
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (initialSelectedIds) {
      return new Set(initialSelectedIds);
    }
    if (defaultSelected) {
      return new Set(items.map(item => item.id));
    }
    return new Set();
  });

  // Calculate total of selected items
  const selectedTotal = items
    .filter(item => selectedIds.has(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  // Get selected items array
  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedIds.has(item.id));
  }, [items, selectedIds]);

  // Notify parent when selection changes
  useEffect(() => {
    onSelectionChange?.(getSelectedItems(), selectedTotal);
  }, [selectedIds, selectedTotal, getSelectedItems, onSelectionChange]);

  // Don't render if no items and showEmpty is false
  if (items.length === 0 && !showEmpty) {
    return null;
  }

  // Show maximum 2 items by default, rest on expand
  const visibleItems = expanded ? items : items.slice(0, 2);
  const hasMoreItems = items.length > 2;

  const handleToggle = (itemId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const selectedCount = selectedIds.size;

  return (
    <div className={cn('px-6 sm:px-8 py-4 sm:py-6', className)}>
      {/* Section Header with Total */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200">
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {companyName ? `Recommended by ${companyName}` : 'Recommended Add-ons'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {documentType === 'estimate'
                ? 'Select options to include in your estimate'
                : 'Select options to add to your invoice'}
            </p>
          </div>
        </div>

        {/* Selected Total Summary */}
        {selectedCount > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedCount} selected
            </p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              +{formatPrice(selectedTotal)}
            </p>
          </div>
        )}
      </div>

      {/* Items List with Checkboxes */}
      {items.length > 0 ? (
        <div className="space-y-2">
          {visibleItems.map((item) => {
            const ItemIcon = getItemIcon(item.icon);
            const isSelected = selectedIds.has(item.id);

            return (
              <Card
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={cn(
                  'p-3 sm:p-4 transition-all duration-200 cursor-pointer',
                  'border-gray-200 dark:border-gray-700',
                  'hover:border-amber-300 hover:shadow-sm',
                  isSelected && 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 ring-1 ring-emerald-400/30'
                )}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Checkbox */}
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(item.id)}
                    className={cn(
                      'h-5 w-5 rounded border-2',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300'
                    )}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Icon */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center',
                      isSelected
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-amber-50 dark:bg-amber-900/20'
                    )}
                  >
                    <ItemIcon
                      className={cn(
                        'h-4 w-4 sm:h-5 sm:w-5',
                        isSelected
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {item.name}
                      </h4>
                      {item.popular && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-1.5 py-0">
                          Popular
                        </Badge>
                      )}
                      {isSelected && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                          Included
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 sm:line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.savings && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                        {item.savings}
                      </p>
                    )}
                  </div>

                  {/* Price and Info */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <p className={cn(
                      'font-semibold text-sm sm:text-base',
                      isSelected
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-900 dark:text-white'
                    )}>
                      {formatPrice(item.price)}
                    </p>
                    {onLearnMore && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onLearnMore(item);
                              }}
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Learn more about {item.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Show More/Less Button */}
          {hasMoreItems && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2',
                'text-sm text-gray-500 hover:text-gray-700',
                'dark:text-gray-400 dark:hover:text-gray-200',
                'transition-colors'
              )}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show {items.length - 2} more options
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        // Empty state
        <Card className="p-6 text-center border-dashed">
          <Sparkles className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No additional services available at this time.
          </p>
        </Card>
      )}

      {/* Footer with total and disclaimer */}
      {selectedCount > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Add-ons Total
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
              </p>
            </div>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatPrice(selectedTotal)}
            </p>
          </div>
        </div>
      )}

      {/* Subtle disclaimer */}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 text-center">
        {selectedCount > 0
          ? 'Selected add-ons will be included when you approve. Uncheck to remove.'
          : 'Optional add-ons. Check to include in your total.'}
      </p>
    </div>
  );
}

export default PortalUpsellSection;

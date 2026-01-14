import { useState } from "react";
import { Coins, Plus, ChevronDown, Sparkles } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TopUpModal } from "./TopUpModal";

interface CreditBalanceWidgetProps {
  className?: string;
  compact?: boolean;
}

export function CreditBalanceWidget({ className, compact = false }: CreditBalanceWidgetProps) {
  const [showTopUp, setShowTopUp] = useState(false);
  const { balance, isLoadingBalance, loyaltyTier, formatCreditsAsCurrency } = useCredits();

  const isLowBalance = balance < 50;
  const isCriticalBalance = balance < 20;

  const getLoyaltyColor = () => {
    switch (loyaltyTier) {
      case "platinum":
        return "text-purple-500";
      case "gold":
        return "text-yellow-500";
      case "silver":
        return "text-gray-400";
      case "bronze":
        return "text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

  if (compact) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTopUp(true)}
          className={cn(
            "gap-1.5 h-8 px-2",
            isCriticalBalance && "text-red-500",
            isLowBalance && !isCriticalBalance && "text-yellow-500",
            className
          )}
        >
          <Coins className="h-4 w-4" />
          <span className="font-medium">{isLoadingBalance ? "..." : balance}</span>
          <Plus className="h-3 w-3 opacity-50" />
        </Button>
        <TopUpModal open={showTopUp} onOpenChange={setShowTopUp} />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 h-9",
              isCriticalBalance && "border-red-500 text-red-500",
              isLowBalance && !isCriticalBalance && "border-yellow-500 text-yellow-500",
              className
            )}
          >
            <Coins className="h-4 w-4" />
            <span className="font-semibold">
              {isLoadingBalance ? "..." : balance.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">credits</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Balance</span>
              {loyaltyTier !== "none" && (
                <Badge variant="outline" className={cn("text-xs", getLoyaltyColor())}>
                  <Sparkles className="h-3 w-3 mr-1" />
                  {loyaltyTier.charAt(0).toUpperCase() + loyaltyTier.slice(1)}
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{balance.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">credits</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ≈ {formatCreditsAsCurrency(balance)}
            </div>
            {isCriticalBalance && (
              <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Balance critically low
              </div>
            )}
            {isLowBalance && !isCriticalBalance && (
              <div className="mt-2 text-xs text-yellow-500">
                Balance getting low
              </div>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowTopUp(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Credits
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/settings/billing" className="cursor-pointer">
              <Coins className="h-4 w-4 mr-2" />
              View Usage History
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TopUpModal open={showTopUp} onOpenChange={setShowTopUp} />
    </>
  );
}

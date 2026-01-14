import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface CollapsibleSectionCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number | null;
  badgeVariant?: "default" | "secondary" | "success" | "warning";
}

export const CollapsibleSectionCard = ({
  icon: Icon,
  title,
  children,
  className,
  contentClassName,
  action,
  defaultOpen = false,
  badge,
  badgeVariant = "secondary",
}: CollapsibleSectionCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getBadgeClasses = () => {
    switch (badgeVariant) {
      case "success":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
      case "warning":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100";
      default:
        return "bg-slate-100 text-slate-600 hover:bg-slate-100";
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("rounded-lg border bg-card shadow-sm overflow-hidden", className)}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-between gap-2 px-4 py-3 w-full text-left transition-colors",
              "hover:bg-muted/50",
              isOpen ? "border-b bg-muted/30" : "bg-muted/20"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-sm font-medium">{title}</h3>
              {badge !== null && badge !== undefined && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-5 px-1.5 text-[10px] font-medium",
                    getBadgeClasses()
                  )}
                >
                  {badge}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {action && isOpen && (
                <div onClick={(e) => e.stopPropagation()}>
                  {action}
                </div>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className={cn("p-4 animate-in fade-in-0 slide-in-from-top-2 duration-200", contentClassName)}>
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

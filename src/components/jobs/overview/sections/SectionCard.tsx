import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  action?: React.ReactNode;
}

export const SectionCard = ({
  icon: Icon,
  title,
  children,
  className,
  contentClassName,
  action,
}: SectionCardProps) => {
  return (
    <div className={cn("rounded-lg border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        {action}
      </div>
      <div className={cn("p-4", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

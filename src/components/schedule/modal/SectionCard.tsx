import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const SectionCard = ({
  icon: Icon,
  title,
  children,
  className,
  contentClassName,
}: SectionCardProps) => {
  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className={cn("p-4", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

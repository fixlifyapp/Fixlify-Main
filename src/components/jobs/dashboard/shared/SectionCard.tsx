import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

interface SectionContentProps {
  children: ReactNode;
  className?: string;
}

export const SectionCard = ({ children, className, noPadding }: SectionCardProps) => {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200/80 rounded-xl shadow-sm",
        "transition-all duration-200 hover:shadow-md hover:border-slate-300/80",
        !noPadding && "p-5",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  action,
  className
}: SectionHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const SectionContent = ({ children, className }: SectionContentProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  );
};

// Compact stat card for financial/summary displays
interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  variant = "default",
  className
}: StatCardProps) => {
  const variantStyles = {
    default: "bg-slate-50 border-slate-200 text-slate-600",
    success: "bg-emerald-50 border-emerald-200 text-emerald-600",
    warning: "bg-amber-50 border-amber-200 text-amber-600",
    danger: "bg-red-50 border-red-200 text-red-600",
    info: "bg-blue-50 border-blue-200 text-blue-600"
  };

  const valueStyles = {
    default: "text-slate-900",
    success: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-red-700",
    info: "text-blue-700"
  };

  return (
    <div
      className={cn(
        "border rounded-lg p-3 transition-all duration-200 hover:shadow-sm",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn("text-lg font-bold", valueStyles[variant])}>{value}</p>
    </div>
  );
};

// Empty state for sections
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn("text-center py-8", className)}>
      {Icon && (
        <Icon className="mx-auto h-10 w-10 text-slate-300 mb-3" />
      )}
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Base Professional Card - Refined Modern Design
interface ProfessionalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
  variant?: "default" | "elevated" | "subtle";
}

export const ProfessionalCard = React.forwardRef<HTMLDivElement, ProfessionalCardProps>(
  ({ className, children, noPadding = false, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white border border-slate-200/80 shadow-sm",
      elevated: "bg-white border border-slate-200/60 shadow-lg shadow-slate-200/50",
      subtle: "bg-slate-50/50 border border-slate-200/60"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl overflow-hidden transition-all duration-200",
          variants[variant],
          !noPadding && "p-5",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ProfessionalCard.displayName = "ProfessionalCard";

// Section Header with Icon - Clean Modern Style
interface ProfessionalSectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const ProfessionalSectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  action,
  className
}: ProfessionalSectionHeaderProps) => (
  <div className={cn(
    "flex items-center justify-between pb-4 mb-4 border-b border-slate-100",
    className
  )}>
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="p-2 bg-slate-100 rounded-lg">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h3>
        {subtitle && (
          <span className="text-xs text-slate-500 font-medium">{subtitle}</span>
        )}
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// Card Content wrapper for consistent padding
interface ProfessionalCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ProfessionalCardContent = ({
  children,
  className
}: ProfessionalCardContentProps) => (
  <div className={cn("", className)}>
    {children}
  </div>
);

// Status Badge with configurable colors
interface ProfessionalStatusBadgeProps {
  status: string;
  color?: string;
  className?: string;
}

export const ProfessionalStatusBadge = ({
  status,
  color,
  className
}: ProfessionalStatusBadgeProps) => {
  const baseStyle = color
    ? { backgroundColor: `${color}12`, color: color, borderColor: `${color}30` }
    : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border tracking-wide",
        !color && "bg-slate-100 text-slate-700 border-slate-200",
        className
      )}
      style={baseStyle}
    >
      {status}
    </span>
  );
};

// Metric Card for financial summaries - Modern Minimal Design
interface ProfessionalMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: "default" | "success" | "warning" | "info" | "violet";
  className?: string;
}

export const ProfessionalMetricCard = ({
  icon: Icon,
  label,
  value,
  sublabel,
  variant = "default",
  className
}: ProfessionalMetricCardProps) => {
  const variants = {
    default: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      iconBg: "bg-white",
      iconColor: "text-slate-600",
      labelColor: "text-slate-600",
      valueColor: "text-slate-900",
      sublabelColor: "text-slate-500"
    },
    success: {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-50/50",
      border: "border-emerald-200/60",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      labelColor: "text-emerald-700",
      valueColor: "text-emerald-800",
      sublabelColor: "text-emerald-600"
    },
    warning: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-50/50",
      border: "border-amber-200/60",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      labelColor: "text-amber-700",
      valueColor: "text-amber-800",
      sublabelColor: "text-amber-600"
    },
    info: {
      bg: "bg-gradient-to-br from-sky-50 to-sky-50/50",
      border: "border-sky-200/60",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      labelColor: "text-sky-700",
      valueColor: "text-sky-800",
      sublabelColor: "text-sky-600"
    },
    violet: {
      bg: "bg-gradient-to-br from-slate-50 to-slate-50/50",
      border: "border-slate-200/60",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      labelColor: "text-slate-700",
      valueColor: "text-slate-800",
      sublabelColor: "text-slate-600"
    }
  };

  const v = variants[variant];

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
      v.bg,
      v.border,
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-lg shadow-sm", v.iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", v.iconColor)} />
        </div>
        <span className={cn("text-[10px] font-bold uppercase tracking-wider", v.labelColor)}>
          {label}
        </span>
      </div>
      <div className="space-y-0.5">
        <div className={cn("text-xl font-bold tracking-tight", v.valueColor)}>
          {value}
        </div>
        {sublabel && (
          <div className={cn("text-[11px] font-medium", v.sublabelColor)}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};

// Info Row component for displaying label-value pairs
interface ProfessionalInfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export const ProfessionalInfoRow = ({
  label,
  value,
  icon: Icon,
  className
}: ProfessionalInfoRowProps) => (
  <div className={cn("flex items-start gap-3 py-2.5", className)}>
    {Icon && (
      <div className="p-1.5 bg-slate-100 rounded-lg">
        <Icon className="h-3.5 w-3.5 text-slate-500" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <div className="text-sm font-medium text-slate-800">
        {value}
      </div>
    </div>
  </div>
);

// Empty State component
interface ProfessionalEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const ProfessionalEmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className
}: ProfessionalEmptyStateProps) => (
  <div className={cn("text-center py-10 px-4", className)}>
    <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl mb-4">
      <Icon className="h-5 w-5 text-slate-400" />
    </div>
    <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
    {description && (
      <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto leading-relaxed">{description}</p>
    )}
    {action}
  </div>
);

// Divider
export const ProfessionalDivider = ({ className }: { className?: string }) => (
  <div className={cn("border-t border-slate-200/60 my-5", className)} />
);

// Badge Group
interface ProfessionalBadgeGroupProps {
  badges: Array<{ name: string; color?: string }>;
  maxVisible?: number;
  className?: string;
}

export const ProfessionalBadgeGroup = ({
  badges,
  maxVisible = 3,
  className
}: ProfessionalBadgeGroupProps) => {
  const visible = badges.slice(0, maxVisible);
  const remaining = badges.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visible.map((badge, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm"
          style={badge.color ? {
            backgroundColor: `${badge.color}10`,
            color: badge.color,
            borderColor: `${badge.color}25`
          } : {
            backgroundColor: '#f8fafc',
            color: '#475569',
            borderColor: '#e2e8f0'
          }}
        >
          {badge.name}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          +{remaining} more
        </span>
      )}
    </div>
  );
};

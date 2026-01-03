import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default";
  className?: string;
  disabled?: boolean;
}

export const QuickActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "outline",
  size = "sm",
  className,
  disabled
}: QuickActionButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "gap-1.5 font-medium",
        variant === "outline" && "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
        variant === "default" && "bg-slate-900 hover:bg-slate-800 text-white",
        size === "sm" && "h-8 text-xs",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
};

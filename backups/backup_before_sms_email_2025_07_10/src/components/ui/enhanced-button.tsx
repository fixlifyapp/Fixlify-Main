
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  gradient?: boolean;
  glow?: boolean;
  threedEffect?: boolean;
}

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    children, 
    className, 
    loading = false, 
    loadingText,
    icon: Icon,
    gradient = false,
    glow = false,
    threedEffect = true,
    disabled,
    ...props 
  }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          "relative overflow-hidden font-semibold transition-all duration-300 ease-out",
          
          // 3D Effect
          threedEffect && [
            "transform hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0",
            "shadow-lg hover:shadow-xl active:shadow-md",
            "border-2 backdrop-blur-sm",
          ],
          
          // Gradient effect
          gradient && [
            "bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600",
            "hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700",
            "border-0 text-white",
          ],
          
          // Glow effect
          glow && "hover:shadow-2xl hover:shadow-purple-500/25",
          
          // Disabled state
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
          
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 relative z-10">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : Icon ? (
            <Icon className="h-4 w-4" />
          ) : null}
          <span>
            {loading && loadingText ? loadingText : children}
          </span>
        </div>
        
        {/* Shimmer effect */}
        {!disabled && !loading && threedEffect && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-out" />
        )}
        
        {/* Ripple effect container */}
        <div className="absolute inset-0 overflow-hidden rounded-md">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
        </div>
      </Button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

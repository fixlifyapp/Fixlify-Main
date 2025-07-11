
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "white";
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  variant = "primary",
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  const variantClasses = {
    primary: "border-fixlyfy border-t-transparent",
    secondary: "border-gray-300 border-t-transparent", 
    white: "border-white border-t-transparent"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
};

export const LoadingDots = ({ 
  size = "md",
  variant = "primary",
  className 
}: LoadingSpinnerProps) => {
  const dotSizes = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3", 
    xl: "h-4 w-4"
  };

  const variantClasses = {
    primary: "bg-fixlyfy",
    secondary: "bg-gray-400",
    white: "bg-white"
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-pulse",
            dotSizes[size],
            variantClasses[variant]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s"
          }}
        />
      ))}
    </div>
  );
};

export const LoadingPulse = ({
  size = "md",
  variant = "primary", 
  className
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  const variantClasses = {
    primary: "bg-fixlyfy/20",
    secondary: "bg-gray-200",
    white: "bg-white/20"
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        className={cn(
          "absolute rounded-full animate-ping",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      <div
        className={cn(
          "relative rounded-full",
          sizeClasses[size],
          variant === "primary" ? "bg-fixlyfy" : 
          variant === "secondary" ? "bg-gray-400" : "bg-white"
        )}
      />
    </div>
  );
};

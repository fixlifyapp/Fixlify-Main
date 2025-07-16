
import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-in" | "slide-up" | "scale-in";
  delay?: number;
}

export const AnimatedContainer = ({ 
  children, 
  className, 
  animation = "fade-in",
  delay = 0
}: AnimatedContainerProps) => {
  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-out",
        animation === "fade-in" && "animate-fade-in opacity-0",
        animation === "slide-up" && "animate-slide-up transform translate-y-4 opacity-0",
        animation === "scale-in" && "animate-scale-in transform scale-95 opacity-0",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
};

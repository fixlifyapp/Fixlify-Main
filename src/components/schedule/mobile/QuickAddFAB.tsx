import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAddFABProps {
  onClick: () => void;
  className?: string;
}

export function QuickAddFAB({ onClick, className }: QuickAddFABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Position
        "fixed bottom-20 right-4 z-50",
        // Size
        "h-14 w-14",
        // Shape & color
        "rounded-full bg-primary text-primary-foreground",
        // Shadow
        "shadow-lg shadow-primary/25",
        // Layout
        "flex items-center justify-center",
        // Hover effects
        "hover:bg-primary/90 hover:scale-105",
        // Active state
        "active:scale-95",
        // Transition
        "transition-all duration-200",
        // Focus
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        // Only show on mobile
        "md:hidden",
        className
      )}
      aria-label="Create new job"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}

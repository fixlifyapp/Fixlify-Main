
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  className?: string;
}

export const PageLoading = ({ className }: PageLoadingProps) => {
  return (
    <div className={cn(
      "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center",
      "animate-fade-in",
      className
    )}>
      <div className="relative">
        {/* Main spinner */}
        <LoadingSpinner size="xl" />
        
        {/* Outer ring animation */}
        <div className="absolute inset-0 border-4 border-transparent border-t-fixlyfy/20 rounded-full animate-spin" 
             style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        
        {/* Pulse effect */}
        <div className="absolute inset-0 bg-fixlyfy/10 rounded-full animate-ping" />
      </div>
    </div>
  );
};

export const PageLoadingFallback = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-fixlyfy/20 via-purple-500/20 to-fixlyfy/20 rounded-full blur-xl animate-pulse" />
        
        {/* Main content */}
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Primary spinner */}
              <LoadingSpinner size="xl" />
              
              {/* Secondary ring */}
              <div className="absolute inset-0 border-2 border-transparent border-t-fixlyfy/30 rounded-full animate-spin" 
                   style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
              
              {/* Outer glow effect */}
              <div className="absolute -inset-2 bg-fixlyfy/5 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

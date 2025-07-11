
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface InsightCardProps {
  insight: {
    id: number;
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info';
    action?: string;
    actionUrl?: string;
    icon: LucideIcon;
  };
  animationDelay?: number;
}

export const InsightCard = ({ insight, animationDelay = 0 }: InsightCardProps) => {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border animate-fade-in",
        insight.type === 'success' && "border-fixlyfy-success/20 bg-fixlyfy-success/5",
        insight.type === 'warning' && "border-fixlyfy-warning/20 bg-fixlyfy-warning/5",
        insight.type === 'info' && "border-fixlyfy-info/20 bg-fixlyfy-info/5",
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-2 items-center">
          <insight.icon className={cn(
            "h-4 w-4",
            insight.type === 'success' && "text-fixlyfy-success",
            insight.type === 'warning' && "text-fixlyfy-warning",
            insight.type === 'info' && "text-fixlyfy-info",
          )} />
          <h3 className={cn(
            "text-sm font-medium",
            insight.type === 'success' && "text-fixlyfy-success",
            insight.type === 'warning' && "text-fixlyfy-warning",
            insight.type === 'info' && "text-fixlyfy-info",
          )}>
            {insight.title}
          </h3>
        </div>
        <div className={cn(
          "w-2 h-2 rounded-full",
          insight.type === 'success' && "bg-fixlyfy-success",
          insight.type === 'warning' && "bg-fixlyfy-warning",
          insight.type === 'info' && "bg-fixlyfy-info",
        )} />
      </div>
      <p className="text-sm text-fixlyfy-text-secondary mb-2 mt-1">{insight.description}</p>
      {insight.action && (
        <Button 
          size="sm" 
          variant="outline" 
          className={cn(
            "w-full text-fixlyfy border-fixlyfy/20 justify-between",
            insight.type === 'success' && "text-fixlyfy-success border-fixlyfy-success/20",
            insight.type === 'warning' && "text-fixlyfy-warning border-fixlyfy-warning/20",
            insight.type === 'info' && "text-fixlyfy-info border-fixlyfy-info/20",
          )}
          asChild
        >
          <a href={insight.actionUrl}>
            {insight.action}
            <ArrowUpRight size={14} />
          </a>
        </Button>
      )}
    </div>
  );
};

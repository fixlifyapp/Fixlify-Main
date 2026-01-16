import { DetectedIntent } from "@/types/unified-messaging";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  HelpCircle,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  XCircle,
  MessageCircle,
  Zap,
  Heart,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IntentBadgeProps {
  intent: DetectedIntent;
  confidence?: number;
  showConfidence?: boolean;
  size?: "sm" | "md";
}

const intentConfig: Record<
  DetectedIntent,
  {
    icon: typeof Calendar;
    label: string;
    className: string;
  }
> = {
  scheduling: {
    icon: Calendar,
    label: "Scheduling",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  inquiry: {
    icon: HelpCircle,
    label: "Inquiry",
    className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  complaint: {
    icon: AlertTriangle,
    label: "Complaint",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  payment: {
    icon: CreditCard,
    label: "Payment",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  confirmation: {
    icon: CheckCircle,
    label: "Confirmation",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  cancellation: {
    icon: XCircle,
    label: "Cancellation",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  follow_up: {
    icon: MessageCircle,
    label: "Follow-up",
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  urgent: {
    icon: Zap,
    label: "Urgent",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse",
  },
  appreciation: {
    icon: Heart,
    label: "Thanks",
    className: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  },
  unknown: {
    icon: CircleDot,
    label: "Unknown",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
};

export function IntentBadge({
  intent,
  confidence,
  showConfidence = false,
  size = "sm",
}: IntentBadgeProps) {
  const config = intentConfig[intent];
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-1 font-medium border-0",
        config.className,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span>{config.label}</span>
      {showConfidence && confidence !== undefined && (
        <span className="opacity-70">({Math.round(confidence * 100)}%)</span>
      )}
    </Badge>
  );
}

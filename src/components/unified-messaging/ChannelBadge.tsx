import { MessageChannel } from "@/types/unified-messaging";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelBadgeProps {
  channel: MessageChannel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const channelConfig = {
  sms: {
    icon: MessageSquare,
    label: "SMS",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  email: {
    icon: Mail,
    label: "Email",
    className: "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  in_app: {
    icon: Bell,
    label: "In-App",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

const sizeConfig = {
  sm: {
    badge: "px-1.5 py-0.5 text-[10px]",
    icon: "h-3 w-3",
  },
  md: {
    badge: "px-2 py-1 text-xs",
    icon: "h-3.5 w-3.5",
  },
  lg: {
    badge: "px-2.5 py-1.5 text-sm",
    icon: "h-4 w-4",
  },
};

export function ChannelBadge({ channel, size = "sm", showLabel = true }: ChannelBadgeProps) {
  const config = channelConfig[channel];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-1 font-medium border-0",
        config.className,
        sizes.badge
      )}
    >
      <Icon className={sizes.icon} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}

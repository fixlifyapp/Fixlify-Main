import { SmartCategory, ConversationCountsResponse } from "@/types/unified-messaging";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Mail,
  Bell,
  Inbox,
  Reply,
  Briefcase,
  Calendar,
  Star,
  Archive,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartCategoriesProps {
  activeCategory: SmartCategory;
  onCategoryChange: (category: SmartCategory) => void;
  counts: ConversationCountsResponse | null;
  className?: string;
}

interface CategoryItem {
  id: SmartCategory;
  label: string;
  icon: typeof Inbox;
  color?: string;
  showBadge?: "unread" | "total";
}

const categories: CategoryItem[] = [
  { id: "all", label: "All Messages", icon: Inbox },
  { id: "needs_reply", label: "Needs Reply", icon: Reply, color: "text-red-500", showBadge: "unread" },
  { id: "unread", label: "Unread", icon: MessageSquare, showBadge: "unread" },
  { id: "starred", label: "Starred", icon: Star, color: "text-yellow-500" },
];

const channelCategories: CategoryItem[] = [
  { id: "sms_only", label: "SMS Only", icon: MessageSquare, color: "text-blue-500" },
  { id: "email_only", label: "Email Only", icon: Mail, color: "text-green-500" },
  { id: "in_app_only", label: "In-App Only", icon: Bell, color: "text-purple-500" },
];

const otherCategories: CategoryItem[] = [
  { id: "archived", label: "Archived", icon: Archive },
];

export function SmartCategories({
  activeCategory,
  onCategoryChange,
  counts,
  className,
}: SmartCategoriesProps) {
  const getCount = (category: SmartCategory): number | null => {
    if (!counts) return null;

    switch (category) {
      case "all":
        return counts.sms.total + counts.email.total + counts.in_app.total;
      case "needs_reply":
        return counts.needs_reply;
      case "unread":
        return counts.sms.unread + counts.email.unread + counts.in_app.unread;
      case "sms_only":
        return counts.sms.total;
      case "email_only":
        return counts.email.total;
      case "in_app_only":
        return counts.in_app.total;
      default:
        return null;
    }
  };

  const renderCategory = (item: CategoryItem) => {
    const Icon = item.icon;
    const count = getCount(item.id);
    const isActive = activeCategory === item.id;

    return (
      <Button
        key={item.id}
        variant="ghost"
        onClick={() => onCategoryChange(item.id)}
        className={cn(
          "w-full justify-start gap-3 h-10 px-3 font-normal",
          isActive && "bg-violet-100 text-violet-900 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300",
          !isActive && "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        )}
      >
        <Icon className={cn("h-4 w-4", item.color, isActive && !item.color && "text-violet-600")} />
        <span className="flex-1 text-left">{item.label}</span>
        {count !== null && count > 0 && (
          <Badge
            variant={item.showBadge === "unread" && count > 0 ? "destructive" : "secondary"}
            className={cn(
              "ml-auto min-w-[22px] h-5 flex items-center justify-center text-xs",
              item.showBadge === "unread" && count > 0 && "bg-red-500"
            )}
          >
            {count}
          </Badge>
        )}
      </Button>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Main categories */}
          <div className="space-y-1">
            {categories.map(renderCategory)}
          </div>

          {/* Divider */}
          <div className="my-3 border-t border-gray-200 dark:border-gray-700" />

          {/* Channel filters */}
          <div className="space-y-1">
            <p className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Channels
            </p>
            {channelCategories.map(renderCategory)}
          </div>

          {/* Divider */}
          <div className="my-3 border-t border-gray-200 dark:border-gray-700" />

          {/* Other */}
          <div className="space-y-1">
            {otherCategories.map(renderCategory)}
          </div>
        </div>
      </ScrollArea>

      {/* Stats footer */}
      {counts && (
        <div className="p-3 border-t bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-semibold text-blue-600">{counts.sms.total}</p>
              <p className="text-[10px] text-gray-500">SMS</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">{counts.email.total}</p>
              <p className="text-[10px] text-gray-500">Email</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-purple-600">{counts.in_app.total}</p>
              <p className="text-[10px] text-gray-500">In-App</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

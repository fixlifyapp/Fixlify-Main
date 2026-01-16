import { SmartReply } from "@/types/unified-messaging";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartRepliesProps {
  replies: SmartReply[];
  onSelect: (reply: SmartReply) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

const toneColors = {
  professional: "border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20",
  friendly: "border-green-200 hover:border-green-400 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20",
  empathetic: "border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20",
  direct: "border-orange-200 hover:border-orange-400 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20",
};

export function SmartReplies({
  replies,
  onSelect,
  onRefresh,
  isLoading = false,
  className,
}: SmartRepliesProps) {
  if (isLoading) {
    return (
      <div className={cn("p-4 border-t bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20", className)}>
        <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating smart replies...</span>
        </div>
      </div>
    );
  }

  if (replies.length === 0) {
    return null;
  }

  return (
    <div className={cn("p-4 border-t bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300">
          <Sparkles className="h-4 w-4" />
          <span>AI Smart Replies</span>
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 px-2 text-xs text-violet-600 hover:text-violet-800 hover:bg-violet-100 dark:text-violet-400 dark:hover:bg-violet-900/30"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {replies.map((reply) => (
          <Card
            key={reply.id}
            onClick={() => onSelect(reply)}
            className={cn(
              "px-3 py-2 cursor-pointer transition-all duration-200 border-2 bg-white dark:bg-gray-900",
              toneColors[reply.tone]
            )}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {reply.text}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-medium text-gray-400 capitalize">
                {reply.tone}
              </span>
              {reply.confidence > 0.8 && (
                <span className="text-[10px] text-violet-500">
                  High match
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

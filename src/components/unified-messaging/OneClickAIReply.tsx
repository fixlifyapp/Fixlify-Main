import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sparkles,
  Loader2,
  Send,
  Zap,
  RefreshCw,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OneClickReply } from "@/types/unified-messaging";

interface OneClickAIReplyProps {
  onGenerate: () => Promise<OneClickReply | null>;
  onSend: (message: string) => Promise<void>;
  onPopulateInput?: (text: string) => void;
  isLoading?: boolean;
  isSending?: boolean;
  className?: string;
}

/**
 * OneClickAIReply - Generate and optionally send AI-powered replies instantly
 *
 * Features:
 * - Generate best reply with one click
 * - Preview before sending
 * - Optional direct send
 * - Shows confidence indicator
 */
export function OneClickAIReply({
  onGenerate,
  onSend,
  onPopulateInput,
  isLoading = false,
  isSending = false,
  className,
}: OneClickAIReplyProps) {
  const [generatedReply, setGeneratedReply] = useState<OneClickReply | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setShowPreview(false);

    try {
      const reply = await onGenerate();
      if (reply) {
        setGeneratedReply(reply);
        setShowPreview(true);
      } else {
        setError("Failed to generate reply");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate reply");
    }
  };

  const handleSend = async () => {
    if (!generatedReply) return;

    try {
      await onSend(generatedReply.text);
      setGeneratedReply(null);
      setShowPreview(false);
    } catch (err: any) {
      setError(err.message || "Failed to send");
    }
  };

  const handleUseInInput = () => {
    if (generatedReply && onPopulateInput) {
      onPopulateInput(generatedReply.text);
      setShowPreview(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-500";
    if (confidence >= 0.7) return "text-yellow-500";
    return "text-orange-500";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return "High confidence";
    if (confidence >= 0.7) return "Medium confidence";
    return "Low confidence";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main button */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || isSending}
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 border-violet-200 text-violet-700 hover:bg-violet-50",
                  "dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-900/30",
                  "transition-all duration-200"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    AI Reply
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate the best AI reply based on conversation context</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {error && (
          <span className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {error}
          </span>
        )}
      </div>

      {/* Preview card */}
      {showPreview && generatedReply && (
        <Card className="p-3 bg-gradient-to-r from-violet-50/80 to-purple-50/80 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  AI Generated Reply
                </span>
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  getConfidenceColor(generatedReply.confidence)
                )}
              >
                {getConfidenceLabel(generatedReply.confidence)}
              </span>
            </div>

            {/* Reply text */}
            <p className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg p-3 border">
              {generatedReply.text}
            </p>

            {/* Suggested action */}
            {generatedReply.suggestedAction && (
              <p className="text-xs text-gray-500 italic">
                <strong>Tip:</strong> {generatedReply.suggestedAction}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleSend}
                disabled={isSending}
                size="sm"
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {isSending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                Send Now
              </Button>

              {onPopulateInput && (
                <Button
                  onClick={handleUseInInput}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Check className="h-3 w-3" />
                  Edit First
                </Button>
              )}

              <Button
                onClick={handleGenerate}
                variant="ghost"
                size="sm"
                disabled={isLoading}
                className="gap-2 ml-auto"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

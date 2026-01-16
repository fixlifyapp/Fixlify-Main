import { useState } from "react";
import { useUnifiedMessaging } from "@/contexts/UnifiedMessagingContext";
import { SmartCategories } from "./SmartCategories";
import { ConversationList } from "./ConversationList";
import { UnifiedConversationThread } from "./UnifiedConversationThread";
import { Card } from "@/components/ui/card";
import { MessageSquare, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsufficientCreditsModal } from "@/components/credits";
import { useCredits } from "@/hooks/useCredits";

interface UnifiedInboxProps {
  className?: string;
  showCategories?: boolean;
}

export function UnifiedInbox({ className, showCategories = true }: UnifiedInboxProps) {
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [requiredCreditsForAction, setRequiredCreditsForAction] = useState<number | undefined>();
  const { balance, getCreditRate, hasEnoughCredits } = useCredits();

  const {
    conversations,
    activeConversation,
    messages,
    categoryCounts,
    activeCategory,
    searchQuery,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    smartReplies,
    isLoadingAI,
    setActiveCategory,
    setSearchQuery,
    selectConversation,
    sendMessage,
    archiveConversation,
    starConversation,
    generateSmartReplies,
    loadConversations,
  } = useUnifiedMessaging();

  // Wrap sendMessage with credit check
  const handleSend = (message: string) => {
    // Determine required credits based on channel
    const featureKey = activeConversation?.channel === "sms" ? "sms_message" : "email_message";
    const requiredCredits = getCreditRate(featureKey);

    // Check if user has enough credits
    if (requiredCredits > 0 && !hasEnoughCredits(requiredCredits)) {
      setRequiredCreditsForAction(requiredCredits);
      setShowCreditsModal(true);
      return;
    }

    // Proceed with sending
    sendMessage(message);
  };

  return (
    <>
      <InsufficientCreditsModal
        open={showCreditsModal}
        onOpenChange={setShowCreditsModal}
        featureName={activeConversation?.channel === "sms" ? "SMS messaging" : "Email messaging"}
        requiredCredits={requiredCreditsForAction}
      />

      <Card className={cn("flex h-[700px] overflow-hidden", className)}>
        {/* Smart Categories Sidebar */}
      {showCategories && (
        <div className="w-52 border-r bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
          <SmartCategories
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={categoryCounts}
          />
        </div>
      )}

      {/* Conversation List */}
      <div className="w-80 border-r shrink-0">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          onSelect={selectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={loadConversations}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Conversation Thread / Empty State */}
      <div className="flex-1 min-w-0">
        {activeConversation ? (
          <UnifiedConversationThread
            conversation={activeConversation}
            messages={messages}
            onSend={handleSend}
            onArchive={() => archiveConversation(activeConversation.id)}
            onStar={(starred) => starConversation(activeConversation.id, starred)}
            isSending={isSending}
            isLoadingMessages={isLoadingMessages}
            smartReplies={smartReplies}
            isLoadingAI={isLoadingAI}
            onGenerateReplies={generateSmartReplies}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 dark:bg-gray-900/50">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <Inbox className="h-8 w-8 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Your Unified Inbox
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select a conversation from the list to view messages. All your SMS, Email, and In-app messages are here.
              </p>
              <div className="flex justify-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-blue-500" />
                  SMS
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-green-500" />
                  Email
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-purple-500" />
                  In-App
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      </Card>
    </>
  );
}

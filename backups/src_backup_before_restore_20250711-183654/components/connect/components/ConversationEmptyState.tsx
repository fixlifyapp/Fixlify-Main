
import { MessageSquare } from "lucide-react";

export const ConversationEmptyState = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-fixlyfy-bg-interface to-white">
        <div className="text-center max-w-md px-6">
          <div className="bg-white rounded-full p-6 mb-6 shadow-lg inline-block border border-fixlyfy/10">
            <MessageSquare className="h-12 w-12 text-fixlyfy" />
          </div>
          <h3 className="text-xl font-semibold text-fixlyfy-text mb-3">
            Select a conversation
          </h3>
          <p className="text-fixlyfy-text-secondary leading-relaxed">
            Choose a conversation from the left panel to start viewing and sending messages to your clients.
          </p>
        </div>
      </div>
    </div>
  );
};

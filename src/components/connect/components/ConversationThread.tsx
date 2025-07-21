import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CallButton } from "@/components/calling/CallButton";
import { MessageSquare, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useMessageContext } from "@/contexts/MessageContext";

interface ConversationThreadProps {
  conversation: {
    id: string;
    client_name: string;
    client_phone: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
    client_id?: string;
  };
}

export const ConversationThread = ({ conversation }: ConversationThreadProps) => {
  const { openMessageDialog } = useMessageContext();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    }
    return format(date, 'MMM d');
  };

  const handleMessageClick = () => {
    openMessageDialog({
      id: conversation.client_id || "",
      name: conversation.client_name,
      phone: conversation.client_phone
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0" onClick={handleMessageClick}>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-400" />
              <h4 className="font-medium truncate">{conversation.client_name}</h4>
              {conversation.unread_count > 0 && (
                <Badge variant="default" className="ml-auto">
                  {conversation.unread_count}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{conversation.client_phone}</p>
            
            <p className="text-sm text-gray-500 truncate">{conversation.last_message}</p>
            
            <p className="text-xs text-gray-400 mt-2">
              {formatTime(conversation.last_message_time)}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMessageClick}
              className="gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              Message
            </Button>
            
            <CallButton
              phoneNumber={conversation.client_phone}
              clientName={conversation.client_name}
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

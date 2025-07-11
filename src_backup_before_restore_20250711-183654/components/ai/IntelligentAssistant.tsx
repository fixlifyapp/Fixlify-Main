
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, Send, Loader2 } from 'lucide-react';
import { useIntelligentAI } from '@/hooks/useIntelligentAI';
import { useUserTracking } from '@/hooks/useUserTracking';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface IntelligentAssistantProps {
  context?: Record<string, any>;
  placeholder?: string;
}

export const IntelligentAssistant = ({ 
  context = {}, 
  placeholder = "Ask me anything about your business..." 
}: IntelligentAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { getAIRecommendation, isLoading } = useIntelligentAI();
  const { trackAction } = useUserTracking();

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    trackAction({
      actionType: 'ai_chat_message',
      element: 'intelligent_assistant',
      context: { messageLength: currentInput.length }
    });

    try {
      const result = await getAIRecommendation({
        prompt: currentInput,
        context: {
          ...context,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }
      });

      if (result) {
        const aiMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          content: result.response,
          sender: 'ai',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-600" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3">
        <ScrollArea className="flex-1 mb-3">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Hi! I'm your intelligent business assistant. 
                Ask me anything about optimizing your workflow!
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className={`text-xs ${
                    message.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {message.sender === 'user' ? 'U' : 'AI'}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col max-w-[80%] ${message.sender === 'user' ? 'items-end' : ''}`}>
                  <div className={`p-2 rounded-lg text-sm ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-muted'
                  }`}>
                    {message.content}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-2 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

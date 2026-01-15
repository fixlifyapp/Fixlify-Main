// AI Assistant Bubble - Floating Proactive Helper
// "You have a 3h gap - want me to fill it?"

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Bot,
  X,
  Minimize2,
  Maximize2,
  Send,
  Sparkles,
  Calendar,
  Route,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Loader2,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  TrendingUp,
} from 'lucide-react';

interface Message {
  id: string;
  type: 'ai' | 'user' | 'suggestion' | 'action';
  content: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
  status?: 'pending' | 'complete';
}

interface Insight {
  id: string;
  type: 'gap' | 'conflict' | 'optimization' | 'reminder' | 'tip';
  message: string;
  priority: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AIAssistantBubbleProps {
  insights?: Insight[];
  onSendMessage?: (message: string) => Promise<string>;
  onDismissInsight?: (insightId: string) => void;
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

export function AIAssistantBubble({
  insights = [],
  onSendMessage,
  onDismissInsight,
  position = 'bottom-right',
  className,
}: AIAssistantBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add initial AI greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          type: 'ai',
          content: "Hi! I'm your scheduling assistant. I can help optimize routes, find slots, and manage your calendar. What would you like to do?",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Track unread insights
  useEffect(() => {
    if (!isOpen && insights.length > 0) {
      setUnreadCount(insights.length);
    }
  }, [insights, isOpen]);

  // Clear unread when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await onSendMessage?.(inputValue);
      if (response) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            type: 'ai',
            content: response,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          type: 'ai',
          content: "Sorry, I couldn't process that. Try asking differently or use Cmd+K for quick commands.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, onSendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'gap':
        return Clock;
      case 'conflict':
        return AlertTriangle;
      case 'optimization':
        return Route;
      case 'reminder':
        return Calendar;
      case 'tip':
        return Lightbulb;
      default:
        return Sparkles;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'gap':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'conflict':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'optimization':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'reminder':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'tip':
        return 'bg-violet-50 border-violet-200 text-violet-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const positionClasses = position === 'bottom-right'
    ? 'right-6 bottom-6'
    : 'left-6 bottom-6';

  return (
    <div className={cn('fixed z-50', positionClasses, className)}>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Card className="w-[380px] shadow-2xl border-violet-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Assistant</h3>
                    <p className="text-xs text-white/70">Powered by Gemini</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setIsMinimized(true)}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Insights Panel */}
              {insights.length > 0 && (
                <div className="border-b bg-slate-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Insights</span>
                    <Badge variant="secondary" className="text-xs">
                      {insights.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {insights.slice(0, 3).map((insight) => {
                      const Icon = getInsightIcon(insight.type);
                      return (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "flex items-start gap-2 rounded-lg border p-2 text-sm",
                            getInsightColor(insight.type)
                          )}
                        >
                          <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="leading-tight">{insight.message}</p>
                            {insight.action && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={insight.action.onClick}
                              >
                                {insight.action.label} →
                              </Button>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                            onClick={() => onDismissInsight?.(insight.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <ScrollArea className="h-[280px]">
                <CardContent className="p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-2",
                        message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      {message.type === 'ai' && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 max-w-[85%]",
                          message.type === 'user'
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-100 text-slate-800'
                        )}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.action && (
                          <Button
                            variant="link"
                            size="sm"
                            className={cn(
                              "h-auto p-0 mt-1 text-xs",
                              message.type === 'user' ? 'text-white/90' : 'text-violet-600'
                            )}
                            onClick={message.action.onClick}
                          >
                            {message.action.label} →
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-2">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.1s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {isTyping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  Press <kbd className="rounded border px-1">⌘K</kbd> for quick commands
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized State */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4"
          >
            <Button
              onClick={() => setIsMinimized(false)}
              className="h-12 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg"
            >
              <Bot className="h-5 w-5" />
              <span>AI Assistant</span>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors",
          isOpen
            ? "bg-slate-800 hover:bg-slate-900"
            : "bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageSquare className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}

        {/* Pulse Animation when insights available */}
        {!isOpen && insights.length > 0 && (
          <span className="absolute inset-0 animate-ping rounded-full bg-violet-400 opacity-30" />
        )}
      </motion.button>
    </div>
  );
}

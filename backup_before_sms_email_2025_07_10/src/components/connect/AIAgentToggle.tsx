
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Phone, MessageSquare, Mail } from "lucide-react";
import { toast } from "sonner";

export const AIAgentToggle = () => {
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load AI agent preference from localStorage
    const savedPreference = localStorage.getItem('ai-agent-enabled');
    if (savedPreference !== null) {
      setIsAIEnabled(JSON.parse(savedPreference));
    }
  }, []);

  const handleToggle = async (enabled: boolean) => {
    setIsLoading(true);
    
    try {
      // Save preference
      localStorage.setItem('ai-agent-enabled', JSON.stringify(enabled));
      setIsAIEnabled(enabled);
      
      toast.success(
        enabled 
          ? "AI Agent enabled - Calls will be handled automatically" 
          : "AI Agent disabled - Manual call handling active"
      );
    } catch (error) {
      console.error('Error toggling AI agent:', error);
      toast.error('Failed to update AI agent setting');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5" />
          AI Agent Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isAIEnabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {isAIEnabled ? (
                <Bot className="h-5 w-5 text-blue-600" />
              ) : (
                <User className="h-5 w-5 text-gray-600" />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {isAIEnabled ? 'AI Agent Mode' : 'Manual Mode'}
                </span>
                <Badge variant={isAIEnabled ? 'default' : 'secondary'}>
                  {isAIEnabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isAIEnabled 
                  ? 'Incoming calls handled automatically by AI'
                  : 'You will manually answer and handle calls'
                }
              </p>
            </div>
          </div>
          
          <Switch 
            checked={isAIEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span>Voice Calls</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span>SMS Messages</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-purple-600" />
            <span>Email</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

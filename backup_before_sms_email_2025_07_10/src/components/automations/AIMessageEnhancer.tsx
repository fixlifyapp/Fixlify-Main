import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, TrendingUp, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { useAI } from '@/hooks/use-ai';
import { toast } from 'sonner';

interface AIMessageEnhancerProps {
  message: string;
  messageType: 'sms' | 'email';
  triggerType: string;
  onMessageUpdate: (message: string) => void;
}

interface MessageSuggestion {
  type: 'optimized' | 'variation' | 'industry_specific';
  content: string;
  reasoning: string;
  expectedImprovement: number;
  tone: 'professional' | 'friendly' | 'urgent' | 'casual';
}

export const AIMessageEnhancer = ({ 
  message, 
  messageType, 
  triggerType, 
  onMessageUpdate 
}: AIMessageEnhancerProps) => {
  const [suggestions, setSuggestions] = useState<MessageSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('optimize');
  const { generateText } = useAI({
    systemContext: `You are an expert at writing high-converting ${messageType} messages for field service businesses. Focus on clarity, urgency, and driving action.`,
    mode: "text"
  });

  const generateOptimizedMessage = async () => {
    if (!message.trim()) return;

    setIsGenerating(true);
    try {
      const optimizationPrompt = `
Optimize this ${messageType} message for a field service business automation (trigger: ${triggerType}):

Current message: "${message}"

Please provide 3 variations:
1. An optimized version that improves clarity and action (professional tone)
2. A friendly variation for relationship building
3. An urgent variation for time-sensitive situations

For each variation, provide:
- The message content
- Why this version is better
- Expected performance improvement (as percentage)
- The tone type

Return as JSON array with format:
[
  {
    "type": "optimized",
    "content": "message text",
    "reasoning": "why this is better",
    "expectedImprovement": 20,
    "tone": "professional"
  }
]`;

      const response = await generateText(optimizationPrompt);
      if (response) {
        try {
          const parsedSuggestions = JSON.parse(response);
          setSuggestions(Array.isArray(parsedSuggestions) ? parsedSuggestions : []);
        } catch {
          // Fallback if JSON parsing fails
          const fallbackSuggestions: MessageSuggestion[] = [
            {
              type: 'optimized',
              content: message,
              reasoning: 'AI optimization temporarily unavailable',
              expectedImprovement: 0,
              tone: 'professional'
            }
          ];
          setSuggestions(fallbackSuggestions);
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };
  const generateFromScratch = async () => {
    setIsGenerating(true);
    try {
      const generationPrompt = `
Generate a high-converting ${messageType} message for this automation trigger: ${triggerType}

Requirements:
- Field service business context
- Include relevant variables like {{client_name}}, {{job_title}}, etc.
- ${messageType === 'sms' ? 'Keep under 160 characters if possible' : 'Professional email format'}
- Clear call to action
- Professional but friendly tone

Generate 3 variations:
1. Professional/formal tone
2. Friendly/conversational tone  
3. Urgent/action-oriented tone

Return as JSON array with format:
[
  {
    "type": "variation",
    "content": "message text",
    "reasoning": "why this is better",
    "expectedImprovement": 20,
    "tone": "professional"
  }
]`;

      const response = await generateText(generationPrompt);
      if (response) {
        try {
          const parsedSuggestions = JSON.parse(response);
          setSuggestions(Array.isArray(parsedSuggestions) ? parsedSuggestions : []);
        } catch {
          // Fallback content
          const fallbackContent = messageType === 'sms' 
            ? "Hi {{client_name}}! Your {{job_title}} is scheduled for {{scheduled_date}} at {{scheduled_time}}. We'll call 30 min before arrival. Questions? {{company_phone}}"
            : "Hi {{client_name}},\n\nThis is a friendly reminder about your {{job_title}} scheduled for {{scheduled_date}} at {{scheduled_time}}.\n\nOur technician {{technician_name}} will call 30 minutes before arrival.\n\nIf you need to reschedule, please call {{company_phone}}.\n\nBest regards,\n{{company_name}}";
          
          setSuggestions([{
            type: 'variation',
            content: fallbackContent,
            reasoning: 'Standard professional template',
            expectedImprovement: 15,
            tone: 'professional'
          }]);
        }
      }
    } catch (error) {
      console.error('Error generating from scratch:', error);
      toast.error('Failed to generate message');
    } finally {
      setIsGenerating(false);
    }
  };
  const getPerformanceColor = (improvement: number) => {
    if (improvement >= 20) return 'text-green-600 bg-green-100';
    if (improvement >= 10) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getToneColor = (tone: string) => {
    const colors: Record<string, string> = {
      professional: 'bg-blue-100 text-blue-700',
      friendly: 'bg-green-100 text-green-700',
      urgent: 'bg-red-100 text-red-700',
      casual: 'bg-purple-100 text-purple-700'
    };
    return colors[tone] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Message Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="optimize">Optimize Current</TabsTrigger>
            <TabsTrigger value="generate">Generate New</TabsTrigger>
          </TabsList>          
          <TabsContent value="optimize" className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={generateOptimizedMessage}
                disabled={isGenerating || !message.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Optimizing...' : 'Optimize Message'}
              </Button>
            </div>
            
            {!message.trim() && (
              <p className="text-sm text-gray-500 text-center py-4">
                Enter a message above to get AI optimization suggestions
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="generate" className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={generateFromScratch}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Smart Messages'}
              </Button>
            </div>
            
            <p className="text-sm text-gray-600">
              Generate AI-powered messages tailored for "{triggerType}" automation
            </p>
          </TabsContent>
        </Tabs>
        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-4 mt-6">
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Suggestions
            </h4>
            
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getToneColor(suggestion.tone)}>
                          {suggestion.tone}
                        </Badge>
                        <Badge className={getPerformanceColor(suggestion.expectedImprovement)}>
                          +{suggestion.expectedImprovement}% improvement
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(suggestion.content);
                            toast.success('Copied to clipboard');
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMessageUpdate(suggestion.content)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Use This
                        </Button>
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
                        {suggestion.content}
                      </p>
                    </div>
                    
                    {/* Character count for SMS */}
                    {messageType === 'sms' && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Characters: {suggestion.content.length}</span>
                        {suggestion.content.length > 160 && (
                          <Badge variant="destructive">Over SMS limit</Badge>
                        )}
                      </div>
                    )}
                    
                    {/* AI Reasoning */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>Why this works:</strong> {suggestion.reasoning}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
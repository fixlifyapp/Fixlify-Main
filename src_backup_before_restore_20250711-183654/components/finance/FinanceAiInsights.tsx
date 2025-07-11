
import { useState, useEffect } from "react";
import { Brain, ThumbsUp, ThumbsDown, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiFinanceInsight } from "@/components/jobs/quick-actions/types";
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { shouldRefreshAIInsights } from "@/utils/ai-refresh";

interface FinanceAiInsightsProps {
  onClose: () => void;
}

export const FinanceAiInsights = ({ onClose }: FinanceAiInsightsProps) => {
  const [insights, setInsights] = useState<AiFinanceInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { generateBusinessInsights } = useAI({
    systemContext: "You are a financial analyst specialized in service business finances. Provide specific, data-driven insights about payment patterns, revenue trends, and financial opportunities.",
    mode: "business"
  });

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        // Check if we need to refresh based on the 7-day rule
        const shouldRefresh = await shouldRefreshAIInsights();
        
        if (shouldRefresh || insights.length === 0) {
          const prompt = "Analyze our payment data and provide 3-5 specific financial insights about payment patterns, collection efficiency, and revenue trends. Focus on actionable recommendations.";
          const result = await generateBusinessInsights(prompt);
          
          if (result) {
            // Parse the insights from the AI response
            // In a real implementation, the AI might return structured data
            // For this demo, we'll create some sample insights
            const newInsights: AiFinanceInsight[] = [
              {
                id: Date.now(),
                tip: "Late payments increased by 12% this month. Consider implementing an early payment discount to improve cash flow.",
                type: "warning",
                category: "revenue",
                date: new Date().toISOString(),
                action: {
                  label: "Set Up Discounts",
                  onClick: () => toast.success("Navigating to discount setup")
                }
              },
              {
                id: Date.now() + 1,
                tip: "Credit card payments have a 15% higher conversion rate than invoices. Encourage technicians to collect payment on-site.",
                type: "insight",
                category: "efficiency",
                date: new Date().toISOString(),
                action: {
                  label: "View Details",
                  onClick: () => toast.success("Viewing payment conversion details")
                }
              },
              {
                id: Date.now() + 2,
                tip: "Your average time to payment is 12 days, down from 18 days last quarter. Great improvement!",
                type: "info",
                category: "efficiency",
                date: new Date().toISOString()
              }
            ];
            setInsights(newInsights);
          }
        }
      } catch (error) {
        console.error("Error generating insights:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, [generateBusinessInsights]);
  
  const handleFeedback = (id: number, isPositive: boolean) => {
    if (!isPositive) {
      setInsights(insights.filter(insight => insight.id !== id));
      toast.success("Thanks for your feedback! We'll improve our insights.");
    } else {
      toast.success("Thanks for your feedback! Glad this was helpful.");
    }
  };
  
  if (insights.length === 0 && !isLoading) {
    return null;
  }
  
  return (
    <Card className="border-fixlyfy-border mb-6 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-fixlyfy-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <h3 className="text-lg font-medium">Finance Insights</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-full" 
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-fixlyfy-text-secondary">
            <p>Analyzing financial data...</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div 
              key={insight.id}
              className={cn(
                "p-4 rounded-lg border animate-fade-in", 
                insight.type === 'info' && "border-fixlyfy-info/20 bg-fixlyfy-info/5", 
                insight.type === 'recommendation' && "border-fixlyfy/20 bg-fixlyfy/5", 
                insight.type === 'insight' && "border-fixlyfy-warning/20 bg-fixlyfy-warning/5", 
                insight.type === 'warning' && "border-red-400/20 bg-red-400/5", 
                insight.type === 'upsell' && "border-green-400/20 bg-green-400/5"
              )}
            >
              <p className="text-sm text-fixlyfy-text-secondary">{insight.tip}</p>
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={() => handleFeedback(insight.id, true)}
                  >
                    <ThumbsUp size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={() => handleFeedback(insight.id, false)}
                  >
                    <ThumbsDown size={14} />
                  </Button>
                </div>
                {insight.action && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-6 text-xs font-medium" 
                    onClick={insight.action.onClick}
                  >
                    {insight.action.label}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

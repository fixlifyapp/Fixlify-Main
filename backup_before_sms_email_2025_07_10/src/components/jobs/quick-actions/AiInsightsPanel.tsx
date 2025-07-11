
import { useState } from "react";
import { Brain, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AiSuggestion } from "./types";
import { AiSuggestionCard } from "./AiSuggestionCard";
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";

interface AiInsightsPanelProps {
  jobId: string;
  initialSuggestions: AiSuggestion[];
}

export const AiInsightsPanel = ({ jobId, initialSuggestions }: AiInsightsPanelProps) => {
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>(initialSuggestions);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [openSuggestions, setOpenSuggestions] = useState<number[]>([0, 1, 2, 3, 4]);
  
  const { generateText } = useAI({
    systemContext: "You are an AI assistant for a field service business. Generate concise, practical insights for technicians and managers about service jobs."
  });
  
  const handleFeedback = (id: number, isPositive: boolean) => {
    console.log(`Feedback for suggestion ${id}: ${isPositive ? 'positive' : 'negative'}`);

    // Remove the suggestion if feedback is negative
    if (!isPositive) {
      setAiSuggestions(aiSuggestions.filter(suggestion => suggestion.id !== id));
      toast.success("Thanks for your feedback! We'll improve our suggestions.");
    } else {
      toast.success("Thanks for your feedback! Glad this was helpful.");
    }
  };
  
  const generateNewSuggestion = async () => {
    if (isGeneratingSuggestion) return;
    setIsGeneratingSuggestion(true);
    try {
      const categories = ["revenue", "efficiency", "customer", "sales", "upsell"];
      const suggestionTypes = ["info", "recommendation", "insight", "warning", "upsell"];
      const categoryIndex = Math.floor(Math.random() * categories.length);
      const selectedCategory = categories[categoryIndex] as "revenue" | "efficiency" | "customer" | "sales" | "upsell";
      const typeIndex = Math.floor(Math.random() * suggestionTypes.length);
      const selectedType = suggestionTypes[typeIndex] as "info" | "recommendation" | "insight" | "warning" | "upsell";
      let promptTemplate = `Generate a practical business insight for a field service technician about job ID ${jobId}.`;

      // Customize prompt based on category
      switch (selectedCategory) {
        case "revenue":
          promptTemplate += " Focus on revenue optimization, pricing, or upselling opportunities.";
          break;
        case "efficiency":
          promptTemplate += " Focus on job efficiency, time management, or resource optimization.";
          break;
        case "customer":
          promptTemplate += " Focus on customer satisfaction, retention, or relationship management.";
          break;
        case "sales":
          promptTemplate += " Focus on sales techniques, estimate conversion, or add-on services.";
          break;
        case "upsell":
          promptTemplate += " Focus on product or service upselling opportunities.";
          break;
      }
      promptTemplate += " Make it practical, specific, and under 100 characters. Return just the text of the suggestion.";
      const newSuggestionText = await generateText(promptTemplate);
      if (newSuggestionText) {
        const actionLabel = selectedType === "warning" ? "View Details" : 
                            selectedType === "upsell" ? "Add to Estimate" : 
                            selectedType === "recommendation" ? "Apply Now" : "Learn More";
        const newSuggestion: AiSuggestion = {
          id: Date.now(),
          tip: newSuggestionText,
          type: selectedType,
          category: selectedCategory,
          action: {
            label: actionLabel,
            onClick: () => toast.success(`Action taken on: ${newSuggestionText}`)
          }
        };
        setAiSuggestions([...aiSuggestions, newSuggestion]);
        setOpenSuggestions([...openSuggestions, aiSuggestions.length]);
      }
    } catch (error) {
      console.error("Error generating suggestion:", error);
      toast.error("Failed to generate new insight. Please try again.");
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };
  
  return (
    <Card className="border-fixlyfy-border bg-fixlyfy/5 mb-6">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-fixlyfy-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <h3 className="text-lg font-medium">AI Insights</h3>
        </div>
        <div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={generateNewSuggestion} 
            disabled={isGeneratingSuggestion}
          >
            {isGeneratingSuggestion ? "Thinking..." : "Generate Insight"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        {aiSuggestions.length > 0 ? (
          aiSuggestions.map((suggestion, idx) => (
            <AiSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onFeedback={handleFeedback}
            />
          ))
        ) : (
          <div className="p-8 text-center text-fixlyfy-text-secondary">
            <AlertTriangle className="mx-auto mb-2 h-10 w-10 text-fixlyfy-warning/50" />
            <p>No insights available.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={generateNewSuggestion}
            >
              Generate New Insight
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

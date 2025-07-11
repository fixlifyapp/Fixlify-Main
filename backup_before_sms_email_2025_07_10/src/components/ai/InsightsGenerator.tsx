
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, BrainCircuit } from "lucide-react";
import { useAI } from "@/hooks/use-ai";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InsightsGeneratorProps {
  data: any;
  topic: string;
  onInsightsGenerated?: (insights: string) => void;
  systemContext?: string;
  autoGenerate?: boolean;
  mode?: "text" | "insights" | "analytics" | "recommendations" | "business";
  variant?: "default" | "compact";
}

export const InsightsGenerator = ({
  data,
  topic,
  onInsightsGenerated,
  systemContext,
  autoGenerate = false,
  mode = "insights",
  variant = "default"
}: InsightsGeneratorProps) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const { generateText, generateInsights, isLoading, error: aiError } = useAI({
    systemContext,
    mode
  });
  
  const handleGenerateInsights = async () => {
    setGenerationError(null);
    try {
      let generatedInsights;
      
      if (mode === "business") {
        generatedInsights = await generateText(
          `Generate insights about ${topic} using the business data provided.`, 
          { 
            systemContext: systemContext || "You are a business analyst. Analyze the data and provide actionable insights.",
            mode: "business",
            fetchBusinessData: true
          }
        );
      } else {
        generatedInsights = await generateInsights(data, topic, {
          systemContext,
          mode
        });
      }
      
      if (generatedInsights) {
        setInsights(generatedInsights);
        onInsightsGenerated?.(generatedInsights);
        toast.success("Insights generated successfully");
      } else {
        throw new Error("Could not generate insights");
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate insights";
      setGenerationError(errorMessage);
      toast.error("Failed to generate insights", {
        description: "Please check your OpenAI API connection and try again."
      });
    }
  };
  
  return (
    <div className="space-y-4">
      {insights ? (
        <div className={`p-${variant === "compact" ? "3" : "4"} bg-fixlyfy/5 border border-fixlyfy/20 rounded-lg`}>
          <h3 className="text-base font-medium mb-3 flex items-center gap-2">
            <BrainCircuit size={16} className="text-fixlyfy" /> 
            AI-Generated {mode === "recommendations" ? "Recommendation" : "Insights"}
          </h3>
          <div className="prose prose-sm max-w-none">
            {insights.split('\n').map((line, i) => (
              <p key={i} className={line.startsWith('•') ? "flex items-start mb-2" : "mb-2"}>
                {line.startsWith('•') ? (
                  <>
                    <span className="mr-2 flex-shrink-0">•</span>
                    <span>{line.substring(1)}</span>
                  </>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className={`p-${variant === "compact" ? "3" : "6"} border border-dashed border-fixlyfy/20 rounded-lg`}>
          {(aiError || generationError) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {aiError || generationError || "Failed to generate insights"}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-center">
            <BrainCircuit size={24} className="mx-auto mb-2 text-fixlyfy/70" />
            <h3 className="text-lg font-medium mb-1">
              AI {mode === "recommendations" ? "Recommendation" : "Business Insights"}
            </h3>
            <p className="text-sm text-fixlyfy-text-secondary mb-4">
              Generate {mode === "recommendations" ? "actionable recommendations" : "insights"} from your business data
            </p>
            
            <Button 
              onClick={handleGenerateInsights} 
              disabled={isLoading}
              className="bg-fixlyfy hover:bg-fixlyfy/90"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit size={16} className="mr-2" />}
              Generate {mode === "recommendations" ? "Recommendation" : "Business Insights"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

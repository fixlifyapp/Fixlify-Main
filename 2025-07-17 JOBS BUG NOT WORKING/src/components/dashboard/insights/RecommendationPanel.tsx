
import { Lightbulb } from "lucide-react";
import { InsightsGenerator } from "@/components/ai/InsightsGenerator";
import { BusinessData } from "@/hooks/useBusinessData";
import { useState } from "react";

interface RecommendationPanelProps {
  businessData: BusinessData;
}

export const RecommendationPanel = ({ businessData }: RecommendationPanelProps) => {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  
  return (
    <div className="mt-6 p-4 border border-fixlyfy-border rounded-lg">
      <div className="flex items-center mb-3">
        <Lightbulb className="w-5 h-5 text-fixlyfy mr-2" />
        <h3 className="text-sm font-medium">AI Recommendation</h3>
      </div>
      <InsightsGenerator
        data={businessData}
        topic="business growth opportunities"
        onInsightsGenerated={setRecommendation}
        mode="recommendations"
        variant="compact"
        systemContext="You are an expert business consultant for a field service company. Provide ONE specific, actionable recommendation to improve business performance based on the data. Keep it under 100 words and very specific."
      />
    </div>
  );
};

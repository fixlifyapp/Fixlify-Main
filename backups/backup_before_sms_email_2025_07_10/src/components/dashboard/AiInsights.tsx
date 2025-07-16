
import { Brain } from "lucide-react";
import { useBusinessData } from "@/hooks/useBusinessData";
import { InsightCard } from "./insights/InsightCard";
import { InsightsLoading } from "./insights/InsightsLoading";
import { RecommendationPanel } from "./insights/RecommendationPanel";
import { ReportGenerator } from "./insights/ReportGenerator";

export const AiInsights = () => {
  const { businessData, insights, isLoading } = useBusinessData();
  
  if (isLoading) {
    return <InsightsLoading />;
  }
  
  if (!businessData || insights.length === 0) {
    return <div className="fixlyfy-card h-full p-6">No insights available. Please check your data.</div>;
  }
  
  return (
    <div className="fixlyfy-card h-full">
      <div className="p-6 border-b border-fixlyfy-border flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md mr-3 fixlyfy-gradient flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-medium">AI Insights</h2>
        </div>
      </div>
      
      <div className="px-6 py-4 space-y-4 overflow-auto max-h-[calc(100%-200px)]">
        {insights.map((insight, idx) => (
          <InsightCard 
            key={insight.id}
            insight={insight}
            animationDelay={idx * 150}
          />
        ))}
        
        {businessData && <RecommendationPanel businessData={businessData} />}
      </div>
      
      <ReportGenerator />
    </div>
  );
};

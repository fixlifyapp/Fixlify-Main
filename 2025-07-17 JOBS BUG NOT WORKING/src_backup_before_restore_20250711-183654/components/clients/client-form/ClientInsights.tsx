
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  Star, 
  X, 
  Lightbulb,
  Loader
} from "lucide-react";

interface ClientInsightsProps {
  client: any;
  isGeneratingInsight: boolean;
  aiInsight: string;
  showInsights: boolean;
  onHideInsights: () => void;
}

export const ClientInsights = ({
  client,
  isGeneratingInsight,
  aiInsight,
  showInsights,
  onHideInsights
}: ClientInsightsProps) => {
  if (!showInsights || !client) return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-fixlyfy/10 to-fixlyfy/5 border border-fixlyfy/20 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-fixlyfy/10 flex items-center justify-center mr-3">
            <Brain size={18} className="text-fixlyfy" />
          </div>
          <h3 className="text-lg font-medium">AI Client Insights</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full hover:bg-fixlyfy/10"
          onClick={onHideInsights}
        >
          <X size={14} />
        </Button>
      </div>
      
      <div className="space-y-3">
        <p className="text-fixlyfy-text-secondary">
          {isGeneratingInsight ? "Analyzing client data..." : aiInsight}
        </p>
        
        {/* Action instructions for insights */}
        <div className="p-3 bg-fixlyfy/5 border border-fixlyfy/10 rounded-md">
          <div className="flex items-start">
            <Lightbulb className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" size={16} />
            <div className="space-y-2">
              <p className="text-sm font-medium">Action recommendations</p>
              <ul className="text-sm text-fixlyfy-text-secondary list-disc pl-5 space-y-1">
                <li>Schedule a follow-up call to discuss maintenance package options</li>
                <li>Review client's purchase history to identify cross-selling opportunities</li>
                <li>Send a personalized email with relevant service promotions</li>
              </ul>
              <p className="text-sm text-fixlyfy-text-secondary italic">
                Implementing these recommendations could increase this client's lifetime value by an estimated 35%.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="p-3 rounded-md bg-white border border-fixlyfy/10 shadow-sm">
          <div className="flex items-center mb-1">
            <Calendar size={16} className="text-fixlyfy mr-2" />
            <span className="font-medium">Engagement</span>
          </div>
          <p className="text-sm text-fixlyfy-text-secondary">Last service was 7 days ago</p>
        </div>
        <div className="p-3 rounded-md bg-white border border-fixlyfy/10 shadow-sm">
          <div className="flex items-center mb-1">
            <TrendingUp size={16} className="text-green-500 mr-2" />
            <span className="font-medium">Revenue</span>
          </div>
          <p className="text-sm text-fixlyfy-text-secondary">$1,250 spent in last 90 days</p>
        </div>
        <div className="p-3 rounded-md bg-white border border-fixlyfy/10 shadow-sm">
          <div className="flex items-center mb-1">
            <Star size={16} className="text-amber-500 mr-2" />
            <span className="font-medium">Satisfaction</span>
          </div>
          <p className="text-sm text-fixlyfy-text-secondary">4.8/5 average job rating</p>
        </div>
      </div>
    </div>
  );
};

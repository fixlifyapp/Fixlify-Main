
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sparkles } from "lucide-react";
import { sanitizeHtml } from "@/utils/security";

interface AIRecommendationsCardProps {
  jobContext?: {
    job_type: string;
    service_category: string;
    job_value: number;
    client_history?: any;
  };
  recommendations?: Array<{
    warranty_name: string;
    reasoning: string;
    confidence_score: number;
    price: number;
  }>;
  estimateId?: string;
}

const staticProTips = [
  "Offer 1-year warranty for jobs under $500 - clients expect basic protection",
  "2-year warranties convert 60% better on HVAC installations", 
  "Extended warranties increase customer retention by 40%"
];

export const AIRecommendationsCard = ({ 
  jobContext, 
  recommendations = [],
  estimateId 
}: AIRecommendationsCardProps) => {
  if (!jobContext) return null;

  const sanitizedJobType = sanitizeHtml(jobContext.job_type || '');
  
  // Always show the same static tips
  const tips = useMemo(() => {
    if (recommendations.length > 0) {
      return [
        ...recommendations.slice(0, 2).map(rec => `${rec.warranty_name} - ${rec.reasoning}`),
        staticProTips[0] // Always show the first static tip
      ];
    } else {
      return staticProTips; // Always show all static tips
    }
  }, [recommendations]);

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-900 text-base">
          <TrendingUp className="h-4 w-4" />
          Pro Tips
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            {recommendations.length > 0 ? 'AI + Static' : 'Static'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tips.map((tip, index) => (
          <div key={index} className="text-sm text-green-700 bg-white/60 p-2 rounded border border-green-200">
            • {tip}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

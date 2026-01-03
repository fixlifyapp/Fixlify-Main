
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Sparkles, Lightbulb, Target, DollarSign, Users, Zap, Loader2 } from "lucide-react";
import { sanitizeHtml } from "@/utils/security";
import { cn } from "@/lib/utils";
import { useAIUpsellRecommendations, type JobContext } from "@/hooks/useAIUpsellRecommendations";

interface AIRecommendationsCardProps {
  jobContext?: JobContext;
  estimateId?: string;
}

interface ProTip {
  text: string;
  icon: typeof Lightbulb;
  category: 'conversion' | 'retention' | 'value';
}

const staticProTips: ProTip[] = [
  {
    text: "Offer 1-year warranty for jobs under $500 - clients expect basic protection",
    icon: Target,
    category: 'conversion'
  },
  {
    text: "2-year warranties convert 60% better on HVAC installations",
    icon: TrendingUp,
    category: 'conversion'
  },
  {
    text: "Extended warranties increase customer retention by 40%",
    icon: Users,
    category: 'retention'
  }
];

// Get job-specific tips based on context
const getContextualTips = (jobType: string, jobValue: number): ProTip[] => {
  const tips: ProTip[] = [];

  if (jobValue > 1000) {
    tips.push({
      text: `High-value job ($${jobValue.toFixed(0)}) - premium warranty packages have 75% acceptance rate`,
      icon: DollarSign,
      category: 'value'
    });
  }

  if (jobType?.toLowerCase().includes('hvac') || jobType?.toLowerCase().includes('heating')) {
    tips.push({
      text: "HVAC customers prefer 2-3 year coverage - seasonal issues drive warranty value",
      icon: Zap,
      category: 'conversion'
    });
  }

  if (jobType?.toLowerCase().includes('plumb')) {
    tips.push({
      text: "Plumbing warranties with water damage coverage see 55% higher uptake",
      icon: Target,
      category: 'conversion'
    });
  }

  return tips;
};

const categoryColors = {
  conversion: 'bg-blue-100 text-blue-700 border-blue-200',
  retention: 'bg-purple-100 text-purple-700 border-purple-200',
  value: 'bg-amber-100 text-amber-700 border-amber-200'
};

const categoryLabels = {
  conversion: 'Conversion',
  retention: 'Retention',
  value: 'Value'
};

export const AIRecommendationsCard = ({
  jobContext,
  estimateId
}: AIRecommendationsCardProps) => {
  // Fetch AI recommendations based on job context
  const { data: recommendations = [], isLoading: isLoadingRecommendations } = useAIUpsellRecommendations(jobContext);

  if (!jobContext) return null;

  const sanitizedJobType = sanitizeHtml(jobContext.job_type || '');

  // Get contextual tips based on job type and value
  const contextualTips = useMemo(() => {
    return getContextualTips(jobContext.job_type, jobContext.job_value);
  }, [jobContext.job_type, jobContext.job_value]);

  // Combine all tips
  const allTips = useMemo(() => {
    return [...contextualTips, ...staticProTips].slice(0, 4);
  }, [contextualTips]);

  const hasAIRecommendations = recommendations.length > 0;

  return (
    <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2 text-emerald-800">
            <div className="p-1.5 bg-emerald-200 rounded-full">
              <Lightbulb className="h-4 w-4 text-emerald-700" />
            </div>
            <span>Sales Insights</span>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              isLoadingRecommendations
                ? "bg-gray-100 text-gray-600"
                : hasAIRecommendations
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                  : "bg-emerald-100 text-emerald-700"
            )}
          >
            {isLoadingRecommendations ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                {hasAIRecommendations ? 'AI Enhanced' : 'Pro Tips'}
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* AI Recommendations with confidence scores */}
        {hasAIRecommendations && (
          <div className="space-y-2 pb-3 border-b border-emerald-200">
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
              AI Recommendations for this Job
            </p>
            {recommendations.slice(0, 2).map((rec, index) => (
              <div
                key={index}
                className="bg-white/80 p-3 rounded-lg border border-purple-200 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-medium text-sm text-gray-800">{rec.warranty_name}</span>
                  <Badge className="bg-purple-100 text-purple-700 text-xs shrink-0">
                    +${rec.price.toFixed(0)}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{rec.reasoning}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Confidence:</span>
                  <Progress
                    value={rec.confidence_score * 100}
                    className="h-1.5 flex-1 bg-gray-200"
                  />
                  <span className="text-xs font-medium text-purple-600">
                    {Math.round(rec.confidence_score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pro Tips with categories */}
        <div className="space-y-2">
          {!hasAIRecommendations && (
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
              Boost Your Sales
            </p>
          )}
          {allTips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 bg-white/70 p-3 rounded-lg border border-emerald-200 hover:bg-white/90 transition-colors"
              >
                <div className={cn(
                  "p-1.5 rounded-full shrink-0",
                  tip.category === 'conversion' && "bg-blue-100",
                  tip.category === 'retention' && "bg-purple-100",
                  tip.category === 'value' && "bg-amber-100"
                )}>
                  <Icon className={cn(
                    "h-3.5 w-3.5",
                    tip.category === 'conversion' && "text-blue-600",
                    tip.category === 'retention' && "text-purple-600",
                    tip.category === 'value' && "text-amber-600"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{tip.text}</p>
                  <Badge
                    variant="outline"
                    className={cn("mt-1.5 text-[10px] px-1.5 py-0", categoryColors[tip.category])}
                  >
                    {categoryLabels[tip.category]}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick stat */}
        <div className="mt-3 p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg text-center">
          <p className="text-xs text-emerald-700">
            <strong className="text-emerald-800">Average upsell value:</strong> $85-150 per job
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, ThumbsUp, ThumbsDown, ArrowRight, Check, X, Lock, ShieldCheck } from "lucide-react";
import { AIInsight, TeamMemberProfile } from "@/types/team-member";
import { toast } from "sonner";
import { useRBAC } from "@/components/auth/RBACProvider";
import { useAI } from "@/hooks/use-ai";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock data for AI insights
const mockInsights: AIInsight[] = [
  {
    id: "1",
    type: "performance",
    message: "You completed 12 jobs this week. Average time per job: 1h 45m.",
    details: "Consider streamlining HVAC diagnostics to reduce by 15%.",
    icon: "🧠",
    action: {
      label: "View Jobs",
      url: "/jobs?filter=completed"
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: false
  },
  {
    id: "2",
    type: "performance",
    message: "Your jobs had a 92% completion rate. Industry average: 96%.",
    details: "Try using our new diagnostic tool for more accurate first-visit fixes.",
    icon: "📈",

    action: {
      label: "Try Diagnostic Tool",
      url: "/tools/diagnostic"
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: false
  },
  {
    id: "3",
    type: "upsell",
    message: "On 6 estimates this month, warranty offers were not included.",
    details: "Clients with warranties convert 30% more.",
    icon: "💡",

    action: {
      label: "Enable Warranty Reminders",
      handler: "enableWarrantyReminders"
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: false
  },
  {
    id: "4",
    type: "upsell",
    message: "Suggesting 'Maintenance Plans' in HVAC increases invoice totals by +$85.",
    details: "Add to your next service?",
    icon: "🔧",

    action: {
      label: "Set Reminder",
      handler: "setMaintenanceReminder"
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: false
  },
  {
    id: "5",
    type: "satisfaction",
    message: "Your average review rating is 4.2/5. Most complaints mention time delays.",
    details: "Consider using ETA messaging more actively.",
    icon: "⭐",

    action: {
      label: "Enable Smart ETA",
      handler: "enableSmartETA"
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: true
  },
  {
    id: "6",
    type: "satisfaction",
    message: "2 repeat visits flagged for misdiagnosis.",
    details: "Recommend AI checklist before finalizing diagnostics.",
    icon: "🔁",

    action: {
      label: "View Checklist",
      url: "/tools/checklist"
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: false
  },
  {
    id: "7",
    type: "skill",
    message: "You've done 12 plumbing jobs but are not marked as plumbing-skilled.",
    details: "Consider requesting this skill be added.",
    icon: "🛠️",

    action: {
      label: "Request Skill",
      handler: "requestSkill"
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: false
  },
  {
    id: "8",
    type: "skill",
    message: "You've had no bookings in Mississauga, though you're listed for that area.",
    details: "You may want to reduce your travel radius.",
    icon: "🎯",

    action: {
      label: "Update Service Areas",
      url: "/settings/service-areas"
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: false
  }
];

// Sample technician data for AI analysis
const sampleTechPerformanceData = {
  completedJobs: 38,
  averageTime: 105, // minutes
  customerRating: 4.2,
  callbacks: 3,
  firstTimeFixRate: 92,
  topSkills: ["HVAC", "Refrigeration"],
  revenueGenerated: 15420,
  upsellRate: 28
};

interface AIInsightsTabProps {
  member: TeamMemberProfile;
  isEditing: boolean;
}

export const AIInsightsTab = ({ member, isEditing }: AIInsightsTabProps) => {
  const [insights, setInsights] = useState<AIInsight[]>(mockInsights);
  const [filter, setFilter] = useState<'all' | 'performance' | 'upsell' | 'satisfaction' | 'skill'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [personalized, setPersonalized] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { hasRole } = useRBAC();
  const { generateRecommendations, error } = useAI({
    systemContext: `You are an AI coach for field service technicians. Provide personalized advice for ${member.name} based on their performance data. Be specific, actionable, and encouraging.`
  });
  
  const isAdmin = hasRole('admin');

  const filteredInsights = insights.filter(insight => {
    if (!showAcknowledged && insight.acknowledged) return false;
    if (filter !== 'all' && insight.type !== filter) return false;
    return true;
  });

  const handleActionClick = (insight: AIInsight) => {
    if (insight.action?.handler) {
      // Here you would implement the actual handler functionality
      toast.success(`Action triggered: ${insight.action.label}`);
    } else if (insight.action?.url) {
      // In a real app, you'd navigate or open a new page
      toast.info(`Would navigate to: ${insight.action.url}`);
    }
  };

  const handleAcknowledge = (id: string) => {
    setInsights(insights.map(insight => 
      insight.id === id ? { ...insight, acknowledged: true } : insight
    ));
    toast.success("Insight acknowledged");
  };

  const handleDismiss = (id: string) => {
    setInsights(insights.filter(insight => insight.id !== id));
    toast.success("Insight dismissed");
  };

  const handleFeedback = (id: string, isPositive: boolean) => {
    toast.success(`Thank you for your ${isPositive ? 'positive' : 'negative'} feedback`);
    // In a real app, you would send this feedback to your AI system
  };

  const generatePersonalizedAdvice = async () => {
    setIsGenerating(true);
    toast.loading("Generating personalized coaching...");
    
    try {
      const advice = await generateRecommendations(
        sampleTechPerformanceData,
        `coaching advice for ${member.name}`
      );
      
      if (advice) {
        setPersonalized(advice);
        toast.dismiss();
        toast.success("Personalized coaching generated");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate coaching insights");
      console.error("Error generating advice:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'performance': return 'Performance';
      case 'upsell': return 'Upsell Opportunity';
      case 'satisfaction': return 'Client Satisfaction';
      case 'skill': return 'Skill Suggestion';
      default: return 'Insight';
    }
  };

  const getTypeColor = (type: string, priority: string) => {
    let baseColor = '';
    
    switch(type) {
      case 'performance': baseColor = 'blue'; break;
      case 'upsell': baseColor = 'green'; break;
      case 'satisfaction': baseColor = 'purple'; break;
      case 'skill': baseColor = 'orange'; break;
      default: baseColor = 'gray';
    }
    
    if (priority === 'high') {
      return `bg-${baseColor}-100 text-${baseColor}-800 border-${baseColor}-300`;
    } else if (priority === 'medium') {
      return `bg-${baseColor}-50 text-${baseColor}-700 border-${baseColor}-200`;
    } else {
      return `bg-${baseColor}-50/50 text-${baseColor}-600 border-${baseColor}-100`;
    }
  };

  // If user is not admin, show access restricted message
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-2">Admin Access Required</h3>
              <p className="text-muted-foreground">
                Only administrators can view AI insights and performance data.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-fixlyfy-border shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium">AI Performance Insights</h3>
              <p className="text-sm text-muted-foreground">Smart recommendations based on job history and performance</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              className="border rounded-md px-3 py-1.5 text-sm bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All Insights</option>
              <option value="performance">Performance</option>
              <option value="upsell">Upsell Opportunities</option>
              <option value="satisfaction">Client Satisfaction</option>
              <option value="skill">Skill Suggestions</option>
            </select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAcknowledged(!showAcknowledged)}
              className="text-sm"
            >
              {showAcknowledged ? "Hide Acknowledged" : "Show All"}
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {/* Personalized AI coaching section */}
          <div className="mb-6 border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center mb-3">
              <Brain className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-base font-medium">AI Coaching for {member.name}</h3>
            </div>
            
            {personalized ? (
              <div className="mb-4">
                <div className="prose prose-sm max-w-none">
                  {personalized.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('•') ? "flex items-start" : ""}>
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
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generatePersonalizedAdvice}
                    disabled={isGenerating}
                    className="mt-2"
                  >
                    {isGenerating ? "Generating..." : "Refresh Coaching"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">
                  Generate personalized coaching advice for {member.name} based on their performance data
                </p>
                <Button
                  onClick={generatePersonalizedAdvice}
                  disabled={isGenerating}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isGenerating ? "Generating..." : "Generate Coaching Insights"}
                </Button>
              </div>
            )}
          </div>
          
          {filteredInsights.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No insights to display</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredInsights.map((insight) => (
              <div 
                key={insight.id} 
                className={`border rounded-lg p-4 ${insight.acknowledged ? 'opacity-70' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{insight.icon}</div>
                    <Badge variant="outline" className={getTypeColor(insight.type, insight.priority)}>
                      {getTypeLabel(insight.type)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!insight.acknowledged && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0" 
                          onClick={() => handleAcknowledge(insight.id)}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0" 
                          onClick={() => handleDismiss(insight.id)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <h4 className="font-medium text-sm mb-1">{insight.message}</h4>
                <p className="text-sm text-muted-foreground mb-3">{insight.details}</p>
                
                <div className="flex justify-between items-center">
                  {insight.action && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs" 
                      onClick={() => handleActionClick(insight)}
                    >
                      {insight.action.label}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                  
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-muted-foreground mr-1">Helpful?</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleFeedback(insight.id, true)}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleFeedback(insight.id, false)}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Monthly summary card */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <span className="text-xl">📊</span> Monthly AI Summary
          </h4>
          <div className="space-y-2">
            <p className="text-sm">Last month, your upsells added <span className="font-medium">$1,740</span></p>
            <p className="text-sm">Customer satisfaction increased by <span className="font-medium text-green-600">+6%</span> since ETA feature was used</p>
            <p className="text-sm">Your average job completion time is <span className="font-medium">15% faster</span> than other technicians</p>
          </div>
          <Button className="mt-3 w-full text-sm" variant="outline">
            View Full Report
          </Button>
        </div>
      </Card>
    </div>
  );
};

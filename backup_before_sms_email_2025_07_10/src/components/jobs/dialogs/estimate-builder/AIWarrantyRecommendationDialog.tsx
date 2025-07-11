
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Brain, TrendingUp, Users, MessageCircle, Sparkles } from "lucide-react";
import { useWarrantyAnalytics } from "@/hooks/useWarrantyAnalytics";
import { toast } from "sonner";

interface AIWarrantyRecommendationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWarranty: (warranty: any, customMessage: string) => void;
  jobContext: {
    job_type: string;
    service_category: string;
    job_value: number;
    client_history?: any;
  };
}

export const AIWarrantyRecommendationDialog = ({
  isOpen,
  onClose,
  onSelectWarranty,
  jobContext
}: AIWarrantyRecommendationDialogProps) => {
  const [selectedWarranty, setSelectedWarranty] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const { getWarrantyRecommendations, recommendations, isLoading } = useWarrantyAnalytics();

  useEffect(() => {
    if (isOpen) {
      getWarrantyRecommendations(jobContext);
    }
  }, [isOpen, getWarrantyRecommendations, jobContext]);

  const handleSelectWarranty = (warranty: any) => {
    const recommendation = recommendations.find(r => r.warranty_id === warranty.warranty_id);
    onSelectWarranty(warranty, recommendation?.personalized_message || customMessage);
    toast.success(`${warranty.warranty_name} added with AI-generated pitch!`);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Warranty Recommendations
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Context Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Job Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Service Type:</span>
                  <p className="font-medium">{jobContext.job_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium">{jobContext.service_category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Job Value:</span>
                  <p className="font-medium">${jobContext.job_value.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">AI is analyzing warranty preferences...</p>
            </div>
          )}

          {/* Recommendations */}
          {!isLoading && recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Smart Recommendations
              </h3>
              
              {recommendations.map((recommendation, index) => (
                <Card 
                  key={recommendation.warranty_id}
                  className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                    selectedWarranty === recommendation.warranty_id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedWarranty(recommendation.warranty_id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-green-100' : index === 1 ? 'bg-blue-100' : 'bg-orange-100'
                        }`}>
                          <Shield className={`h-4 w-4 ${
                            index === 0 ? 'text-green-600' : index === 1 ? 'text-blue-600' : 'text-orange-600'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{recommendation.warranty_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1} Choice
                        </Badge>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          ${recommendation.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* AI Insights */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            AI Confidence
                          </span>
                          <span className="font-medium">{recommendation.confidence_score}%</span>
                        </div>
                        <Progress value={recommendation.confidence_score} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Customer Popularity
                          </span>
                          <span className="font-medium">{recommendation.popular_percentage}%</span>
                        </div>
                        <Progress value={recommendation.popular_percentage} className="h-2" />
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="text-sm font-medium mb-1 flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        AI Analysis
                      </h5>
                      <p className="text-sm text-gray-700">{recommendation.reasoning}</p>
                    </div>

                    {/* Suggested Pitch */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-medium mb-1 text-blue-800">
                        💬 Suggested Pitch to Customer
                      </h5>
                      <p className="text-sm text-blue-700 italic">
                        {recommendation.personalized_message}
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Conversion Rate: {(recommendation.conversion_probability * 100).toFixed(0)}%</span>
                      <span>•</span>
                      <span>Similar customers choose this {recommendation.popular_percentage}% of the time</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Recommendations */}
          {!isLoading && recommendations.length === 0 && (
            <Card className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No warranty recommendations available for this job type.</p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleSkip}>
              Skip Warranties
            </Button>
            
            {selectedWarranty && (
              <Button 
                onClick={() => {
                  const warranty = recommendations.find(r => r.warranty_id === selectedWarranty);
                  if (warranty) handleSelectWarranty(warranty);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Add Selected Warranty
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

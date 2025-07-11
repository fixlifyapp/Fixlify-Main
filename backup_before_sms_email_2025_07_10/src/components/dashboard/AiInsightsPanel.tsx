
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, TrendingUp, AlertTriangle } from "lucide-react";

export const AiInsightsPanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Revenue Opportunity</p>
                <p className="text-xs text-green-600">
                  HVAC jobs show 23% higher profit margins this month
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Schedule Alert</p>
                <p className="text-xs text-orange-600">
                  3 jobs scheduled for tomorrow need confirmation
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Confidence</span>
              <Badge variant="secondary">94%</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

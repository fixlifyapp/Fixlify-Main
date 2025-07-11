
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp
} from "lucide-react";
import { useClientAnalytics } from "@/hooks/useClientAnalytics";
import { toast } from "sonner";

export const QuoteConversionFunnel = () => {
  console.log('QuoteConversionFunnel: Component rendering');
  
  const { quoteConversionData, isLoading } = useClientAnalytics();
  
  console.log('QuoteConversionFunnel: Data state', { quoteConversionData, isLoading });
  
  const handleFollowUpSuggestion = () => {
    if (quoteConversionData?.ignored) {
      toast.success(`AI Suggestion: Follow up on ${quoteConversionData.ignored} ignored quotes`, {
        description: "Send a personalized follow-up message or offer a limited-time discount"
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!quoteConversionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No quote data available</p>
        </CardContent>
      </Card>
    );
  }
  
  const { sent, approved, ignored, rejected, approvedRevenue, conversionRate } = quoteConversionData;
  
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <FileText className="h-4 w-4 text-white" />
          </div>
          Quote Conversion Funnel
        </CardTitle>
        <Badge variant="outline" className="bg-green-100 text-green-700">
          Conversion: {conversionRate.toFixed(1)}%
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Funnel Visualization */}
        <div className="space-y-4">
          {/* Sent Quotes */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Quotes Sent</p>
                <p className="text-sm text-gray-600">Total estimates created</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{sent}</p>
              <Progress value={100} className="w-20 h-2 mt-1" />
            </div>
          </div>
          
          {/* Approved Quotes */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Approved</p>
                <p className="text-sm text-gray-600">${approvedRevenue.toLocaleString()} revenue</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{approved}</p>
              <Progress value={sent > 0 ? (approved / sent) * 100 : 0} className="w-20 h-2 mt-1" />
            </div>
          </div>
          
          {/* Ignored Quotes */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ignored</p>
                <p className="text-sm text-gray-600">Potential follow-ups</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-600">{ignored}</p>
              <Progress value={sent > 0 ? (ignored / sent) * 100 : 0} className="w-20 h-2 mt-1" />
            </div>
          </div>
          
          {/* Rejected Quotes */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Rejected</p>
                <p className="text-sm text-gray-600">Lost opportunities</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{rejected}</p>
              <Progress value={sent > 0 ? (rejected / sent) * 100 : 0} className="w-20 h-2 mt-1" />
            </div>
          </div>
        </div>
        
        {/* AI Suggestions */}
        {ignored > 0 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">AI Opportunity</p>
                  <p className="text-sm text-gray-600">
                    {ignored} quotes are waiting for follow-up. Converting 30% could add ${(approvedRevenue / approved * ignored * 0.3).toLocaleString()} revenue.
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={handleFollowUpSuggestion}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Follow Up
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteConversionFunnel;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Brain, 
  AlertTriangle,
  Target,
  Calendar,
  DollarSign,
  Users,
  Zap
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, ComposedChart, Bar } from "recharts";

export const PredictiveAnalytics = () => {
  const forecastData = [
    { month: 'Jul', actual: 25400, predicted: 25100, confidence: 95 },
    { month: 'Aug', actual: null, predicted: 27200, confidence: 92 },
    { month: 'Sep', actual: null, predicted: 28900, confidence: 89 },
    { month: 'Oct', actual: null, predicted: 31500, confidence: 87 },
    { month: 'Nov', actual: null, predicted: 29800, confidence: 84 },
    { month: 'Dec', actual: null, predicted: 33200, confidence: 82 }
  ];

  const demandPrediction = [
    { service: 'HVAC Repair', current: 35, predicted: 42, seasonal: 'High', growth: '+20%' },
    { service: 'Plumbing', current: 28, predicted: 25, seasonal: 'Stable', growth: '-11%' },
    { service: 'Electrical', current: 22, predicted: 27, seasonal: 'Medium', growth: '+23%' },
    { service: 'Maintenance', current: 15, predicted: 18, seasonal: 'Low', growth: '+20%' }
  ];

  const riskFactors = [
    {
      title: "Technician Capacity",
      risk: "Medium",
      probability: 65,
      impact: "High",
      description: "Peak season may exceed current capacity",
      recommendation: "Consider hiring 1-2 additional technicians"
    },
    {
      title: "Equipment Failure",
      risk: "Low",
      probability: 25,
      impact: "Medium",
      description: "Older HVAC units likely to fail in winter",
      recommendation: "Stock additional replacement parts"
    },
    {
      title: "Market Competition",
      risk: "Medium",
      probability: 55,
      impact: "Medium",
      description: "New competitor entered local market",
      recommendation: "Review pricing and service differentiation"
    }
  ];

  const seasonalTrends = [
    { month: 'Jan', hvac: 45, plumbing: 35, electrical: 20 },
    { month: 'Feb', hvac: 40, plumbing: 30, electrical: 25 },
    { month: 'Mar', hvac: 35, plumbing: 40, electrical: 30 },
    { month: 'Apr', hvac: 30, plumbing: 45, electrical: 35 },
    { month: 'May', hvac: 35, plumbing: 40, electrical: 40 },
    { month: 'Jun', hvac: 50, plumbing: 35, electrical: 30 },
    { month: 'Jul', hvac: 60, plumbing: 30, electrical: 25 },
    { month: 'Aug', hvac: 65, plumbing: 25, electrical: 20 },
    { month: 'Sep', hvac: 45, plumbing: 35, electrical: 30 },
    { month: 'Oct', hvac: 40, plumbing: 40, electrical: 35 },
    { month: 'Nov', hvac: 50, plumbing: 35, electrical: 30 },
    { month: 'Dec', hvac: 55, plumbing: 30, electrical: 25 }
  ];

  const aiInsights = [
    {
      type: "Revenue Opportunity",
      insight: "Upselling maintenance contracts could increase revenue by 15-20%",
      confidence: 92,
      action: "Develop maintenance package offerings"
    },
    {
      type: "Efficiency Gain",
      insight: "Route optimization could reduce travel time by 18%",
      confidence: 87,
      action: "Implement GPS-based scheduling"
    },
    {
      type: "Customer Retention",
      insight: "Follow-up calls within 24h improve satisfaction by 12%",
      confidence: 94,
      action: "Automate post-service follow-ups"
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Predictive Analytics & Forecasting
          </h2>
          <p className="text-muted-foreground">AI-powered insights and business predictions</p>
        </div>
        <Button className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Generate New Forecast
        </Button>
      </div>

      {/* Revenue Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>6-Month Revenue Forecast</CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered prediction based on historical data and market trends
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="confidence" 
                fill="#3b82f6" 
                fillOpacity={0.1}
                stroke="none"
                name="Confidence (%)"
              />
              <Bar dataKey="actual" fill="#10b981" name="Actual Revenue ($)" />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predicted Revenue ($)"
              />
            </ComposedChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Predicted Q3 Revenue</h4>
              <p className="text-2xl font-bold text-blue-600">$83,300</p>
              <p className="text-sm text-blue-700">+18% vs Q2</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Forecast Confidence</h4>
              <p className="text-2xl font-bold text-green-600">89%</p>
              <p className="text-sm text-green-700">High accuracy</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Growth Trend</h4>
              <p className="text-2xl font-bold text-purple-600">+15.7%</p>
              <p className="text-sm text-purple-700">Monthly average</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Demand Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>Service Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {demandPrediction.map((service, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{service.service}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Share:</span>
                    <span>{service.current}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Predicted:</span>
                    <span className="font-medium">{service.predicted}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant={service.seasonal === 'High' ? 'default' : 'secondary'}>
                      {service.seasonal} Season
                    </Badge>
                    <span className={`text-sm font-medium ${
                      service.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {service.growth}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={seasonalTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="hvac" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6"
                name="HVAC"
              />
              <Area 
                type="monotone" 
                dataKey="plumbing" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                name="Plumbing"
              />
              <Area 
                type="monotone" 
                dataKey="electrical" 
                stackId="1"
                stroke="#f59e0b" 
                fill="#f59e0b"
                name="Electrical"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Risk Assessment & Mitigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskFactors.map((risk, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{risk.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                  </div>
                  <Badge className={getRiskColor(risk.risk)}>
                    {risk.risk} Risk
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Probability</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${risk.probability}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{risk.probability}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Impact</span>
                    <p className="text-sm font-medium">{risk.impact}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Risk Score</span>
                    <p className="text-sm font-medium">
                      {Math.round(risk.probability * (risk.impact === 'High' ? 1 : risk.impact === 'Medium' ? 0.7 : 0.4))}
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Recommendation:</p>
                  <p className="text-sm text-blue-700">{risk.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI-Generated Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">{insight.type}</Badge>
                  <span className="text-xs text-muted-foreground">{insight.confidence}% confidence</span>
                </div>
                
                <p className="text-sm mb-3">{insight.insight}</p>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-1">Recommended Action:</p>
                  <p className="text-sm text-gray-600">{insight.action}</p>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Implement Suggestion
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Predictions Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Next Month Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Revenue</span>
                </div>
                <span className="text-lg font-bold text-green-600">$27,200</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Expected Jobs</span>
                </div>
                <span className="text-lg font-bold text-blue-600">68</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">New Customers</span>
                </div>
                <span className="text-lg font-bold text-purple-600">12-15</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-900">Schedule Optimization</p>
                <p className="text-sm text-yellow-700">Could save 4.5 hours/week</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">Pricing Strategy</p>
                <p className="text-sm text-green-700">5% increase potential identified</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">Service Bundling</p>
                <p className="text-sm text-blue-700">23% upsell opportunity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

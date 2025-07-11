
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Lightbulb,
  Target,
  ArrowRight
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const PredictiveInsights = () => {
  const [predictions, setPredictions] = useState({
    revenue: {
      current: 45280,
      predicted: 62400,
      confidence: 87,
      trend: 'up',
      factors: ['Seasonal demand increase', 'New service offerings', 'Customer retention improvement']
    },
    demandForecast: [
      { month: 'Jun', predicted: 52000, actual: 45280, confidence: 95 },
      { month: 'Jul', predicted: 58000, actual: null, confidence: 89 },
      { month: 'Aug', predicted: 62400, actual: null, confidence: 87 },
      { month: 'Sep', predicted: 59800, actual: null, confidence: 83 },
      { month: 'Oct', predicted: 54200, actual: null, confidence: 81 }
    ],
    recommendations: [
      {
        type: 'staffing',
        title: 'Increase HVAC Technicians',
        description: 'Demand for HVAC services will increase 35% in next 60 days',
        impact: 'high',
        urgency: 'medium',
        estimated_revenue: 18500,
        action_items: ['Post job listings', 'Contact temp agencies', 'Upskill current staff']
      },
      {
        type: 'inventory',
        title: 'Stock AC Units',
        description: 'AC unit demand will peak in 3 weeks based on weather forecasts',
        impact: 'medium',
        urgency: 'high',
        estimated_revenue: 12300,
        action_items: ['Order 15 units', 'Negotiate bulk pricing', 'Prepare storage space']
      },
      {
        type: 'marketing',
        title: 'Launch Summer Campaign',
        description: 'Optimal timing for HVAC maintenance promotions',
        impact: 'medium',
        urgency: 'low',
        estimated_revenue: 8900,
        action_items: ['Design campaign', 'Target past customers', 'Schedule social media']
      }
    ],
    riskAlerts: [
      {
        type: 'capacity',
        title: 'Technician Overload Risk',
        description: 'Current capacity may be insufficient for predicted demand spike',
        probability: 73,
        impact: 'revenue_loss',
        estimated_loss: 15000
      },
      {
        type: 'customer',
        title: 'Churn Risk - Premium Customers',
        description: '3 high-value customers showing decreased engagement',
        probability: 45,
        impact: 'customer_loss',
        estimated_loss: 8500
      }
    ]
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Prediction Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Revenue Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Current Month</p>
              <p className="text-2xl font-bold">${predictions.revenue.current.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Actual revenue</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Next Month Prediction</p>
              <p className="text-2xl font-bold text-blue-600">${predictions.revenue.predicted.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{predictions.revenue.confidence}% confidence</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Growth Projection</p>
              <p className="text-2xl font-bold text-green-600">+37.8%</p>
              <Progress value={predictions.revenue.confidence} className="h-2" />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Key Growth Factors:</h4>
            <ul className="space-y-1">
              {predictions.revenue.factors.map((factor, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Demand Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={predictions.demandForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                `$${value?.toLocaleString()}`,
                name === 'predicted' ? 'Predicted' : 'Actual'
              ]} />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#82ca9d" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact} impact
                      </Badge>
                      <Badge variant={getUrgencyColor(rec.urgency)}>
                        {rec.urgency} urgency
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <p className="text-sm font-medium text-green-600">
                      Potential Revenue: +${rec.estimated_revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Action Items:</p>
                  <ul className="space-y-1">
                    {rec.action_items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button size="sm" className="w-full">
                  Implement Recommendation
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Risk Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.riskAlerts.map((alert, index) => (
              <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-orange-900">{alert.title}</h4>
                  <Badge variant="outline" className="text-orange-700">
                    {alert.probability}% probability
                  </Badge>
                </div>
                <p className="text-sm text-orange-700 mb-2">{alert.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-red-600">
                    Potential Loss: ${alert.estimated_loss.toLocaleString()}
                  </p>
                  <Button variant="outline" size="sm">
                    Mitigate Risk
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

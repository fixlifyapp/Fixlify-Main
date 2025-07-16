
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Wrench, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Brain,
  Lightbulb,
  BarChart3,
  PieChart,
  Filter
} from "lucide-react";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter 
} from 'recharts';

export const BusinessIntelligenceAnalytics = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  const [analyticsData, setAnalyticsData] = useState({
    kpiMetrics: {
      revenue: { value: 284750, change: 23.5, target: 300000 },
      customers: { value: 1247, change: 12.8, target: 1300 },
      satisfaction: { value: 4.7, change: 8.2, target: 4.8 },
      efficiency: { value: 87.3, change: 5.7, target: 90 }
    },
    trendsData: [
      { month: 'Jan', revenue: 185000, customers: 89, satisfaction: 4.3, efficiency: 82 },
      { month: 'Feb', revenue: 201000, customers: 94, satisfaction: 4.4, efficiency: 84 },
      { month: 'Mar', revenue: 223000, customers: 108, satisfaction: 4.5, efficiency: 85 },
      { month: 'Apr', revenue: 245000, customers: 115, satisfaction: 4.6, efficiency: 86 },
      { month: 'May', revenue: 267000, customers: 127, satisfaction: 4.7, efficiency: 87 },
      { month: 'Jun', revenue: 284750, customers: 142, satisfaction: 4.7, efficiency: 87 }
    ],
    correlationData: [
      { satisfaction: 4.1, retention: 78, revenue: 180000 },
      { satisfaction: 4.3, retention: 82, revenue: 195000 },
      { satisfaction: 4.5, retention: 87, revenue: 225000 },
      { satisfaction: 4.7, retention: 93, revenue: 265000 },
      { satisfaction: 4.8, retention: 96, revenue: 290000 }
    ],
    segmentAnalysis: [
      { segment: 'Residential', revenue: 45, customers: 812, growth: 15.2 },
      { segment: 'Commercial', revenue: 35, customers: 298, growth: 28.7 },
      { segment: 'Emergency', revenue: 20, customers: 137, growth: -3.1 }
    ],
    insights: [
      {
        type: 'opportunity',
        title: 'Commercial Segment Growth',
        description: 'Commercial customers show 28.7% growth rate vs 15.2% residential',
        impact: 'high',
        recommendation: 'Increase commercial marketing spend by 40%',
        potential_value: 85000
      },
      {
        type: 'warning',
        title: 'Emergency Service Decline',
        description: 'Emergency services down 3.1% - investigate pricing and response times',
        impact: 'medium',
        recommendation: 'Review emergency service pricing and availability',
        potential_value: -15000
      },
      {
        type: 'success',
        title: 'Customer Satisfaction Momentum',
        description: 'Satisfaction score of 4.7 correlates with 93% retention rate',
        impact: 'high',
        recommendation: 'Maintain current service quality standards',
        potential_value: 45000
      }
    ],
    predictiveModels: {
      revenue_forecast: [
        { month: 'Jul', predicted: 298000, confidence: 87 },
        { month: 'Aug', predicted: 312000, confidence: 84 },
        { month: 'Sep', predicted: 295000, confidence: 81 },
        { month: 'Oct', predicted: 285000, confidence: 78 }
      ],
      churn_risk: [
        { segment: 'High Value', risk_score: 15, customers_at_risk: 8 },
        { segment: 'Regular', risk_score: 23, customers_at_risk: 47 },
        { segment: 'New', risk_score: 31, customers_at_risk: 22 }
      ]
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'revenue': return DollarSign;
      case 'customers': return Users;
      case 'satisfaction': return CheckCircle;
      case 'efficiency': return Wrench;
      default: return BarChart3;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return TrendingUp;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'success': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Business Intelligence Analytics
          </h2>
          <p className="text-gray-600">Advanced analytics and predictive insights for strategic decision making</p>
        </div>
        <div className="flex items-center gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analyticsData.kpiMetrics).map(([key, metric]) => {
              const IconComponent = getMetricIcon(key);
              const progress = (metric.value / metric.target) * 100;
              
              return (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className={`flex items-center text-sm ${
                        metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(metric.change)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</h3>
                      <p className="text-2xl font-bold">
                        {key === 'revenue' ? `$${metric.value.toLocaleString()}` :
                         key === 'satisfaction' ? metric.value.toFixed(1) :
                         metric.value.toLocaleString()}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Target: {key === 'revenue' ? `$${metric.target.toLocaleString()}` : metric.target}</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.insights.map((insight, index) => {
                  const IconComponent = getInsightIcon(insight.type);
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant={insight.impact === 'high' ? 'default' : insight.impact === 'medium' ? 'secondary' : 'outline'}>
                              {insight.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600">{insight.recommendation}</p>
                            <span className={`text-sm font-medium ${
                              insight.potential_value > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {insight.potential_value > 0 ? '+' : ''}${Math.abs(insight.potential_value).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Metric Trends Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={analyticsData.trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="customers" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="satisfaction" stroke="#ffc658" strokeWidth={2} />
                  <Line type="monotone" dataKey="efficiency" stroke="#ff7300" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Satisfaction vs Retention Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={analyticsData.correlationData}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="satisfaction" domain={[4, 5]} />
                  <YAxis type="number" dataKey="retention" domain={[70, 100]} />
                  <Tooltip />
                  <Scatter dataKey="retention" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.segmentAnalysis}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      label={({ segment, revenue }) => `${segment}: ${revenue}%`}
                    >
                      {analyticsData.segmentAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.segmentAnalysis.map((segment, index) => (
                    <div key={segment.segment} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{segment.segment}</h4>
                        <p className="text-sm text-gray-600">{segment.customers} customers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{segment.revenue}% revenue</p>
                        <div className={`text-sm flex items-center ${
                          segment.growth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {segment.growth >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(segment.growth)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.predictiveModels.revenue_forecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      `$${value?.toLocaleString()}`,
                      name === 'predicted' ? 'Predicted Revenue' : name
                    ]} />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Churn Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.predictiveModels.churn_risk.map((risk, index) => (
                    <div key={risk.segment} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{risk.segment}</span>
                        <span className="text-sm">
                          {risk.customers_at_risk} customers at risk ({risk.risk_score}%)
                        </span>
                      </div>
                      <Progress value={risk.risk_score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

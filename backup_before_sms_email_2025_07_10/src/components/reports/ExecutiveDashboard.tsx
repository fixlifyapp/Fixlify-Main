
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Shield,
  Award,
  Zap
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export const ExecutiveDashboard = () => {
  const [timeframe, setTimeframe] = useState<'quarter' | 'year' | '3years'>('quarter');

  const executiveData = {
    businessHealth: {
      score: 87,
      trend: 'up',
      indicators: [
        { name: 'Revenue Growth', value: 85, status: 'good' },
        { name: 'Customer Retention', value: 92, status: 'excellent' },
        { name: 'Market Position', value: 78, status: 'good' },
        { name: 'Operational Efficiency', value: 89, status: 'excellent' },
        { name: 'Financial Health', value: 86, status: 'good' }
      ]
    },
    strategicInitiatives: [
      {
        name: 'Digital Transformation',
        progress: 75,
        status: 'on-track',
        impact: 'high',
        deadline: '2024-12-31',
        owner: 'CTO'
      },
      {
        name: 'Market Expansion',
        progress: 45,
        status: 'at-risk',
        impact: 'high',
        deadline: '2024-10-15',
        owner: 'VP Sales'
      },
      {
        name: 'Customer Experience Program',
        progress: 90,
        status: 'ahead',
        impact: 'medium',
        deadline: '2024-08-30',
        owner: 'VP Customer Success'
      }
    ],
    marketPosition: {
      marketShare: 23.5,
      competitorGap: 8.2,
      brandStrength: 78,
      customerLoyalty: 85
    },
    riskAssessment: [
      {
        category: 'Financial',
        risk: 'Low',
        score: 15,
        description: 'Strong cash flow and reserves'
      },
      {
        category: 'Operational',
        risk: 'Medium',
        score: 35,
        description: 'Staff capacity constraints during peak season'
      },
      {
        category: 'Market',
        risk: 'Low',
        score: 20,
        description: 'Stable market conditions'
      },
      {
        category: 'Technology',
        risk: 'Medium',
        score: 40,
        description: 'System modernization needed'
      }
    ],
    executiveMetrics: [
      {
        title: 'Annual Revenue',
        value: '$12.4M',
        change: 23.5,
        target: '$15M',
        progress: 83
      },
      {
        title: 'Net Profit Margin',
        value: '18.2%',
        change: 2.1,
        target: '20%',
        progress: 91
      },
      {
        title: 'Customer Lifetime Value',
        value: '$8,750',
        change: 15.8,
        target: '$10,000',
        progress: 88
      },
      {
        title: 'Market Share',
        value: '23.5%',
        change: 1.2,
        target: '25%',
        progress: 94
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      case 'on-track': return 'text-green-600 bg-green-100';
      case 'at-risk': return 'text-orange-600 bg-orange-100';
      case 'ahead': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-600" />
            Executive Dashboard
          </h2>
          <p className="text-gray-600">Strategic overview and key performance indicators for leadership</p>
        </div>
        <div className="flex items-center gap-2">
          {(['quarter', 'year', '3years'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period === '3years' ? '3 Years' : period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Executive Overview</TabsTrigger>
          <TabsTrigger value="initiatives">Strategic Initiatives</TabsTrigger>
          <TabsTrigger value="market">Market Position</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Business Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Business Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {executiveData.businessHealth.score}
                  </div>
                  <p className="text-gray-600">Overall Health Score</p>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">Strong Performance</span>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-3">
                  {executiveData.businessHealth.indicators.map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{indicator.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={indicator.value} className="w-24 h-2" />
                        <Badge className={getStatusColor(indicator.status)}>
                          {indicator.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Executive Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {executiveData.executiveMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <div className={`flex items-center text-sm ${
                        metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(metric.change)}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Target: {metric.target}</span>
                        <span>{metric.progress}%</span>
                      </div>
                      <Progress value={metric.progress} className="h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="initiatives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Strategic Initiatives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executiveData.strategicInitiatives.map((initiative, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{initiative.name}</h4>
                        <p className="text-sm text-gray-600">Owner: {initiative.owner}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(initiative.status)}>
                          {initiative.status}
                        </Badge>
                        <Badge variant="outline">
                          {initiative.impact} impact
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {initiative.progress}%</span>
                        <span>Due: {new Date(initiative.deadline).toLocaleDateString()}</span>
                      </div>
                      <Progress value={initiative.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Market Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Market Share</span>
                    <span className="text-xl font-bold">{executiveData.marketPosition.marketShare}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Competitor Gap</span>
                    <span className="text-xl font-bold text-green-600">+{executiveData.marketPosition.competitorGap}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Brand Strength</span>
                    <div className="flex items-center gap-2">
                      <Progress value={executiveData.marketPosition.brandStrength} className="w-20 h-2" />
                      <span className="text-sm">{executiveData.marketPosition.brandStrength}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Customer Loyalty</span>
                    <div className="flex items-center gap-2">
                      <Progress value={executiveData.marketPosition.customerLoyalty} className="w-20 h-2" />
                      <span className="text-sm">{executiveData.marketPosition.customerLoyalty}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Competitive analysis data will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {executiveData.riskAssessment.map((risk, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{risk.category} Risk</h4>
                      <Badge className={getRiskColor(risk.risk)}>
                        {risk.risk}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={risk.score} className="h-2" />
                      <p className="text-sm text-gray-600">{risk.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Zap,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface LearningInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'optimization' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  learningSource: string;
  actionRecommended: string;
  dataPoints: number;
}

interface PredictiveAnalytic {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  factors: string[];
}

interface AutomationLearningSystemProps {
  workflows: any[];
  onApplyLearning: (insight: LearningInsight) => void;
}

export const AutomationLearningSystem: React.FC<AutomationLearningSystemProps> = ({
  workflows,
  onApplyLearning
}) => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [predictions, setPredictions] = useState<PredictiveAnalytic[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    generateLearningInsights();
    generatePredictiveAnalytics();
    loadPerformanceHistory();
  }, [workflows]);

  const generateLearningInsights = () => {
    const learningInsights: LearningInsight[] = [
      {
        id: '1',
        type: 'pattern',
        title: 'Optimal Send Time Pattern Detected',
        description: 'AI learned that messages sent at 10 AM on Tuesdays have 34% higher engagement rates',
        confidence: 92,
        impact: 'high',
        learningSource: '2,847 automation executions',
        actionRecommended: 'Auto-schedule Tuesday 10 AM sends',
        dataPoints: 2847
      },
      {
        id: '2',
        type: 'prediction',
        title: 'Client Response Rate Prediction',
        description: 'Based on historical data, predict 23% improvement in response rates with personalized greetings',
        confidence: 87,
        impact: 'high',
        learningSource: 'Client interaction analysis',
        actionRecommended: 'Implement dynamic greeting system',
        dataPoints: 1523
      },
      {
        id: '3',
        type: 'optimization',
        title: 'Cost Reduction Opportunity',
        description: 'Switch to email for follow-ups after 3 PM to reduce SMS costs by 28% with minimal impact',
        confidence: 91,
        impact: 'medium',
        learningSource: 'Cost-effectiveness analysis',
        actionRecommended: 'Update channel selection logic',
        dataPoints: 3142
      },
      {
        id: '4',
        type: 'trend',
        title: 'Seasonal Engagement Trend',
        description: 'Response rates increase 15% during first week of each month due to payment cycles',
        confidence: 89,
        impact: 'medium',
        learningSource: 'Long-term trend analysis',
        actionRecommended: 'Boost important messages early month',
        dataPoints: 4567
      }
    ];
    
    setInsights(learningInsights);
  };

  const generatePredictiveAnalytics = () => {
    const predictiveData: PredictiveAnalytic[] = [
      {
        metric: 'Automation Success Rate',
        currentValue: 89,
        predictedValue: 94,
        timeframe: 'Next 30 days',
        confidence: 85,
        factors: ['Timing optimization', 'Message personalization', 'Channel selection']
      },
      {
        metric: 'Client Satisfaction Score',
        currentValue: 4.6,
        predictedValue: 4.8,
        timeframe: 'Next quarter',
        confidence: 82,
        factors: ['Faster response times', 'Better targeting', 'Proactive communication']
      },
      {
        metric: 'Cost per Automation',
        currentValue: 0.12,
        predictedValue: 0.09,
        timeframe: 'Next 60 days',
        confidence: 91,
        factors: ['Channel optimization', 'Batch processing', 'Smart scheduling']
      },
      {
        metric: 'Revenue Impact',
        currentValue: 2840,
        predictedValue: 3420,
        timeframe: 'Next quarter',
        confidence: 78,
        factors: ['Improved follow-ups', 'Better conversion rates', 'Reduced churn']
      }
    ];
    
    setPredictions(predictiveData);
  };

  const loadPerformanceHistory = () => {
    // Generate mock historical performance data
    const mockData = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      successRate: 85 + Math.random() * 10,
      responseRate: 70 + Math.random() * 15,
      cost: 0.08 + Math.random() * 0.08,
      satisfaction: 4.2 + Math.random() * 0.6
    }));
    
    setPerformanceData(mockData);

    const trendMockData = [
      { month: 'Jan', engagement: 65, conversions: 23, costs: 450 },
      { month: 'Feb', engagement: 72, conversions: 28, costs: 420 },
      { month: 'Mar', engagement: 78, conversions: 34, costs: 380 },
      { month: 'Apr', engagement: 85, conversions: 41, costs: 340 },
      { month: 'May', engagement: 89, conversions: 47, costs: 310 },
      { month: 'Jun', engagement: 94, conversions: 52, costs: 285 }
    ];
    
    setTrendData(trendMockData);
  };

  const runLearningCycle = async () => {
    setIsLearning(true);
    
    // Simulate AI learning process
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    generateLearningInsights();
    generatePredictiveAnalytics();
    
    setIsLearning(false);
    console.log("Learning cycle complete - New insights generated");
  };

  const applyInsight = (insight: LearningInsight) => {
    onApplyLearning(insight);
    console.log(`Applied learning: ${insight.title}`);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pieData = [
    { name: 'Email', value: 45, color: '#3b82f6' },
    { name: 'SMS', value: 35, color: '#10b981' },
    { name: 'Push', value: 20, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Learning & Analytics
          </h3>
          <p className="text-sm text-muted-foreground">
            Advanced machine learning insights and predictive analytics
          </p>
        </div>
        <Button 
          onClick={runLearningCycle}
          disabled={isLearning}
          className="gap-2"
        >
          {isLearning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Learning...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Run Learning Cycle
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <Badge variant="outline" className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                        <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                          {insight.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Source: {insight.learningSource}</div>
                      <div>Data points: {insight.dataPoints.toLocaleString()}</div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => applyInsight(insight)}
                      className="gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      Apply Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{prediction.metric}</h4>
                      <Badge variant="secondary">{prediction.timeframe}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Current</span>
                        <div className="text-2xl font-bold">
                          {prediction.metric.includes('Score') ? 
                            prediction.currentValue.toFixed(1) : 
                            prediction.metric.includes('Cost') ?
                            `$${prediction.currentValue.toFixed(2)}` :
                            prediction.metric.includes('Revenue') ?
                            `$${prediction.currentValue.toLocaleString()}` :
                            `${prediction.currentValue.toFixed(0)}%`
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Predicted</span>
                        <div className="text-2xl font-bold text-green-600">
                          {prediction.metric.includes('Score') ? 
                            prediction.predictedValue.toFixed(1) : 
                            prediction.metric.includes('Cost') ?
                            `$${prediction.predictedValue.toFixed(2)}` :
                            prediction.metric.includes('Revenue') ?
                            `$${prediction.predictedValue.toLocaleString()}` :
                            `${prediction.predictedValue.toFixed(0)}%`
                          }
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Prediction Confidence</span>
                        <span>{prediction.confidence}%</span>
                      </div>
                      <Progress value={prediction.confidence} className="h-2" />
                    </div>

                    <div>
                      <span className="text-sm font-medium">Key Factors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prediction.factors.map((factor, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="successRate" stroke="#3b82f6" name="Success Rate %" />
                    <Line type="monotone" dataKey="responseRate" stroke="#10b981" name="Response Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Channel Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Total Automations</span>
                    </div>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Clients Reached</span>
                    </div>
                    <span className="font-semibold">3,842</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Cost Savings</span>
                    </div>
                    <span className="font-semibold">$2,340</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Time Saved</span>
                    </div>
                    <span className="font-semibold">127 hrs</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="engagement" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Engagement %" />
                  <Area type="monotone" dataKey="conversions" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Conversions" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Growth</p>
                    <p className="text-2xl font-bold text-green-600">+44%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">vs. 6 months ago</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Reduction</p>
                    <p className="text-2xl font-bold text-blue-600">-37%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Through optimization</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Learning Accuracy</p>
                    <p className="text-2xl font-bold text-purple-600">94%</p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">AI prediction accuracy</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
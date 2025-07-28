import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Clock, 
  Zap,
  BarChart3,
  Lightbulb,
  TestTube
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface OptimizationSuggestion {
  id: string;
  type: 'performance' | 'cost' | 'engagement' | 'timing';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedSavings?: string;
  currentMetric?: number;
  potentialMetric?: number;
  action: string;
}

interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

interface SmartOptimizationPanelProps {
  workflows: any[];
  onApplyOptimization: (workflowId: string, optimization: any) => void;
}

export const SmartOptimizationPanel: React.FC<SmartOptimizationPanelProps> = ({
  workflows,
  onApplyOptimization
}) => {
  const { toast } = useToast();
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');

  useEffect(() => {
    generateOptimizationSuggestions();
    loadPerformanceMetrics();
  }, [workflows]);

  const generateOptimizationSuggestions = () => {
    const suggestions: OptimizationSuggestion[] = [
      {
        id: '1',
        type: 'performance',
        title: 'Optimize Message Timing',
        description: 'Send appointment reminders 24 hours before instead of 12 hours for 15% better response rates',
        impact: 'high',
        effort: 'low',
        currentMetric: 78,
        potentialMetric: 89,
        action: 'Update timing trigger'
      },
      {
        id: '2',
        type: 'cost',
        title: 'Reduce SMS Costs',
        description: 'Switch to email for non-urgent notifications to save $120/month',
        impact: 'medium',
        effort: 'low',
        estimatedSavings: '$120/month',
        action: 'Change communication method'
      },
      {
        id: '3',
        type: 'engagement',
        title: 'Personalize Messages',
        description: 'Add client name and service history for 25% higher engagement',
        impact: 'high',
        effort: 'medium',
        currentMetric: 65,
        potentialMetric: 81,
        action: 'Update message templates'
      },
      {
        id: '4',
        type: 'timing',
        title: 'Business Hours Optimization',
        description: 'Delay messages outside business hours to increase open rates by 12%',
        impact: 'medium',
        effort: 'low',
        currentMetric: 72,
        potentialMetric: 81,
        action: 'Enable business hours delay'
      }
    ];
    
    setOptimizations(suggestions);
  };

  const loadPerformanceMetrics = () => {
    const mockMetrics: PerformanceMetric[] = [
      {
        name: 'Automation Success Rate',
        current: 89,
        target: 95,
        trend: 'up',
        unit: '%'
      },
      {
        name: 'Response Time',
        current: 2.3,
        target: 1.5,
        trend: 'down',
        unit: 'minutes'
      },
      {
        name: 'Client Satisfaction',
        current: 4.6,
        target: 4.8,
        trend: 'up',
        unit: '/5'
      },
      {
        name: 'Cost per Automation',
        current: 0.12,
        target: 0.08,
        trend: 'stable',
        unit: '$'
      }
    ];
    
    setMetrics(mockMetrics);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    generateOptimizationSuggestions();
    
    setIsAnalyzing(false);
    console.log("Analysis Complete - Found 4 optimization opportunities");
  };

  const applyOptimization = (suggestion: OptimizationSuggestion) => {
    onApplyOptimization(selectedWorkflow, suggestion);
    console.log(`Optimization Applied: ${suggestion.title} has been implemented`);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Smart Optimization</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered insights to improve your automation performance
          </p>
        </div>
        <Button 
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="testing">A/B Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid gap-4">
            {optimizations.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{suggestion.title}</CardTitle>
                        <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                          {suggestion.impact} impact
                        </Badge>
                        <Badge variant="secondary" className={getEffortColor(suggestion.effort)}>
                          {suggestion.effort} effort
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      {suggestion.estimatedSavings && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{suggestion.estimatedSavings}</span>
                        </div>
                      )}
                      {suggestion.currentMetric && suggestion.potentialMetric && (
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span>{suggestion.currentMetric}% → {suggestion.potentialMetric}%</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => applyOptimization(suggestion)}
                      className="gap-1"
                    >
                      <Lightbulb className="h-3 w-3" />
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metric.name}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {metric.current}{metric.unit} / {metric.target}{metric.unit}
                    </span>
                  </div>
                  <Progress 
                    value={(metric.current / metric.target) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Current: {metric.current}{metric.unit}</span>
                    <span>Target: {metric.target}{metric.unit}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                A/B Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Active Test: SMS vs Email Reminders</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Variant A (SMS):</span>
                    <div className="font-medium">78% response rate</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Variant B (Email):</span>
                    <div className="font-medium">65% response rate</div>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    65% statistical confidence • 247 more samples needed
                  </p>
                </div>
              </div>
              
              <Button className="w-full gap-2">
                <TestTube className="h-4 w-4" />
                Create New A/B Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, TrendingUp, AlertTriangle, Sparkles,
  ChevronRight, Target, DollarSign, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AIInsightsProps {
  metrics: any;
}

export const AIInsights = ({ metrics }: AIInsightsProps) => {
  const insights = [
    {
      type: 'opportunity',
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Missed Call Response Time',
      description: 'Reducing response time from 5 to 2 minutes could increase conversion by 23%',
      impact: '+$12,500/month',
      priority: 'high',
      action: 'Optimize Automation'
    },
    {
      type: 'warning',
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Low Email Open Rates',
      description: 'Your appointment reminder emails have 18% open rate (industry avg: 35%)',
      impact: 'Missing 42% of reminders',
      priority: 'medium',
      action: 'Improve Templates'
    },    {
      type: 'success',
      icon: <Target className="w-5 h-5" />,
      title: 'Review Collection Success',
      description: 'Your review request automation has 45% response rate (3x industry average!)',
      impact: '4.8★ average rating',
      priority: 'low',
      action: 'View Details'
    },
    {
      type: 'optimization',
      icon: <Clock className="w-5 h-5" />,
      title: 'Optimal Send Times',
      description: 'SMS sent at 10 AM and 2 PM get 40% higher response rates',
      impact: 'Better engagement',
      priority: 'medium',
      action: 'Update Schedule'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-blue-600';
      case 'optimization': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">AI-Powered Insights</h3>
      </div>

      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${getTypeColor(insight.type)}`}>
                  {insight.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant={getPriorityColor(insight.priority)}>
                      {insight.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {insight.type === 'opportunity' && <DollarSign className="w-4 h-4" />}
                      <span className="font-medium">{insight.impact}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      {insight.action}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
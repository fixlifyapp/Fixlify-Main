import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Users, 
  Bell,
  Search,
  Star,
  ArrowRight,
  Zap,
  CheckCircle
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  triggers: string[];
  actions: string[];
  estimatedTimeSaved: string;
  popularity: number;
  businessValue: string;
  isFeatured: boolean;
  complexity: 'Simple' | 'Intermediate' | 'Advanced';
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: '1',
    name: 'Job Creation Follow-up',
    description: 'Automatically send confirmation SMS and email when a new job is created',
    category: 'Customer Communication',
    icon: <MessageSquare className="h-5 w-5" />,
    triggers: ['Job Created'],
    actions: ['Send SMS', 'Send Email'],
    estimatedTimeSaved: '2 hours/week',
    popularity: 95,
    businessValue: 'Improves customer experience and reduces manual follow-ups',
    isFeatured: true,
    complexity: 'Simple'
  },
  {
    id: '2',
    name: 'Appointment Reminders',
    description: 'Send reminder messages 24 hours and 2 hours before scheduled appointments',
    category: 'Reminders',
    icon: <Clock className="h-5 w-5" />,
    triggers: ['Appointment Scheduled'],
    actions: ['Wait 22 hours', 'Send SMS', 'Wait 22 hours', 'Send SMS'],
    estimatedTimeSaved: '5 hours/week',
    popularity: 88,
    businessValue: 'Reduces no-shows by 40% and improves scheduling efficiency',
    isFeatured: true,
    complexity: 'Intermediate'
  },
  {
    id: '3',
    name: 'Payment Follow-up Sequence',
    description: 'Progressive follow-up for overdue invoices with escalating urgency',
    category: 'Financial',
    icon: <DollarSign className="h-5 w-5" />,
    triggers: ['Invoice Overdue'],
    actions: ['Send Email', 'Wait 3 days', 'Send SMS', 'Create Task'],
    estimatedTimeSaved: '8 hours/week',
    popularity: 82,
    businessValue: 'Improves cash flow and reduces payment delays',
    isFeatured: false,
    complexity: 'Advanced'
  },
  {
    id: '4',
    name: 'Job Completion Survey',
    description: 'Send satisfaction survey and request review after job completion',
    category: 'Feedback',
    icon: <Star className="h-5 w-5" />,
    triggers: ['Job Completed'],
    actions: ['Wait 2 hours', 'Send Email Survey', 'Wait 3 days', 'Request Review'],
    estimatedTimeSaved: '3 hours/week',
    popularity: 76,
    businessValue: 'Increases positive reviews and customer satisfaction scores',
    isFeatured: false,
    complexity: 'Simple'
  },
  {
    id: '5',
    name: 'Emergency Job Alert',
    description: 'Immediate notification to all available technicians for emergency jobs',
    category: 'Operations',
    icon: <Bell className="h-5 w-5" />,
    triggers: ['Job Created with Emergency Tag'],
    actions: ['Send SMS to All Techs', 'Create High Priority Task', 'Notify Manager'],
    estimatedTimeSaved: '1 hour/week',
    popularity: 90,
    businessValue: 'Faster emergency response times and better customer service',
    isFeatured: true,
    complexity: 'Intermediate'
  },
  {
    id: '6',
    name: 'Seasonal Service Reminders',
    description: 'Proactive maintenance reminders based on weather and calendar',
    category: 'Marketing',
    icon: <Calendar className="h-5 w-5" />,
    triggers: ['Date/Weather Based'],
    actions: ['Send Marketing Email', 'Create Lead', 'Schedule Follow-up'],
    estimatedTimeSaved: '6 hours/week',
    popularity: 71,
    businessValue: 'Generates recurring revenue and maintains customer relationships',
    isFeatured: false,
    complexity: 'Advanced'
  }
];

const CATEGORIES = [
  'All',
  'Customer Communication',
  'Reminders',
  'Financial',
  'Feedback',
  'Operations',
  'Marketing'
];

interface EnhancedWorkflowTemplatesProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export const EnhancedWorkflowTemplates = ({ onSelectTemplate }: EnhancedWorkflowTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = WORKFLOW_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredTemplates = filteredTemplates.filter(t => t.isFeatured);
  const regularTemplates = filteredTemplates.filter(t => !t.isFeatured);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTemplateCard = (template: WorkflowTemplate) => (
    <Card 
      key={template.id} 
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
      onClick={() => onSelectTemplate(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {template.icon}
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {template.name}
                {template.isFeatured && (
                  <Star className="inline h-4 w-4 ml-2 fill-yellow-400 text-yellow-400" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getComplexityColor(template.complexity)}`}
                >
                  {template.complexity}
                </Badge>
              </div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {template.description}
        </CardDescription>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2 text-muted-foreground">Workflow Steps:</p>
            <div className="flex flex-wrap gap-1">
              {template.triggers.map((trigger, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-200">
                  {trigger}
                </Badge>
              ))}
              <ArrowRight className="h-3 w-3 text-muted-foreground mx-1 mt-1" />
              {template.actions.map((action, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-green-50 border-green-200">
                  {action}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">{template.estimatedTimeSaved}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-orange-600 font-medium">{template.popularity}% adoption</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground italic">
              💡 {template.businessValue}
            </p>
          </div>
        </div>

        <Button 
          className="w-full" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onSelectTemplate(template);
          }}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Use This Template
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Workflow Templates</h2>
          <p className="text-muted-foreground">
            Choose from pre-built automation templates designed for service businesses
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Templates */}
      {featuredTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h3 className="text-lg font-semibold">Featured Templates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map(renderTemplateCard)}
          </div>
        </div>
      )}

      {/* All Templates */}
      {regularTemplates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularTemplates.map(renderTemplateCard)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or category filter
          </p>
        </div>
      )}
    </div>
  );
};
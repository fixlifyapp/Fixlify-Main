
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  BarChart3, 
  DollarSign, 
  Users, 
  TrendingUp,
  Calendar,
  Star,
  Edit,
  Copy,
  Trash2,
  Play
} from "lucide-react";

interface ReportTemplatesProps {
  onTemplateSelect: (templateId: string) => void;
}

export const ReportTemplates = ({ onTemplateSelect }: ReportTemplatesProps) => {
  const templates = [
    {
      id: "executive_summary",
      name: "Executive Summary",
      description: "High-level overview of key business metrics and performance indicators",
      category: "Executive",
      metrics: ["revenue", "profit_margin", "customer_satisfaction", "jobs_completed"],
      icon: TrendingUp,
      color: "blue",
      usage: 45,
      lastUsed: "2024-01-15"
    },
    {
      id: "financial_report",
      name: "Financial Performance",
      description: "Comprehensive financial analysis including revenue, costs, and profitability",
      category: "Financial",
      metrics: ["revenue", "profit_margin", "costs", "billing_efficiency"],
      icon: DollarSign,
      color: "green",
      usage: 32,
      lastUsed: "2024-01-14"
    },
    {
      id: "operational_metrics",
      name: "Operational Metrics",
      description: "Day-to-day operational performance and efficiency metrics",
      category: "Operations",
      metrics: ["jobs_completed", "response_time", "completion_rate", "technician_efficiency"],
      icon: BarChart3,
      color: "purple",
      usage: 28,
      lastUsed: "2024-01-13"
    },
    {
      id: "customer_insights",
      name: "Customer Insights",
      description: "Customer satisfaction, retention, and service quality analysis",
      category: "Quality",
      metrics: ["customer_satisfaction", "client_retention", "service_ratings", "repeat_customers"],
      icon: Star,
      color: "yellow",
      usage: 22,
      lastUsed: "2024-01-12"
    },
    {
      id: "team_performance",
      name: "Team Performance",
      description: "Individual and team performance analysis with productivity metrics",
      category: "HR",
      metrics: ["technician_efficiency", "jobs_per_tech", "training_completion", "performance_scores"],
      icon: Users,
      color: "indigo",
      usage: 18,
      lastUsed: "2024-01-11"
    },
    {
      id: "monthly_review",
      name: "Monthly Business Review",
      description: "Comprehensive monthly analysis across all business areas",
      category: "Comprehensive",
      metrics: ["revenue", "jobs_completed", "customer_satisfaction", "profit_margin", "technician_efficiency"],
      icon: Calendar,
      color: "red",
      usage: 15,
      lastUsed: "2024-01-10"
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Executive: "bg-blue-100 text-blue-800",
      Financial: "bg-green-100 text-green-800",
      Operations: "bg-purple-100 text-purple-800",
      Quality: "bg-yellow-100 text-yellow-800",
      HR: "bg-indigo-100 text-indigo-800",
      Comprehensive: "bg-red-100 text-red-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Report Templates</h2>
          <p className="text-muted-foreground">Pre-built report templates for common business needs</p>
        </div>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Create New Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${template.color}-100`}>
                    <template.icon className={`h-5 w-5 text-${template.color}-600`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="outline" className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{template.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Included Metrics:</span>
                  <span>{template.metrics.length} metrics</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.metrics.slice(0, 3).map((metric) => (
                    <Badge key={metric} variant="secondary" className="text-xs">
                      {metric.replace('_', ' ')}
                    </Badge>
                  ))}
                  {template.metrics.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.metrics.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>Used {template.usage} times</span>
                <span>Last: {template.lastUsed}</span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onTemplateSelect(template.id)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Use Template
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Browse by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {["Executive", "Financial", "Operations", "Quality", "HR", "Comprehensive"].map((category) => (
              <Button key={category} variant="outline" className="justify-start">
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

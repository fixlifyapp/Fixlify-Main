
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Download, 
  Share2, 
  Calendar,
  FileText,
  BarChart3,
  Filter,
  Save,
  Play,
  Edit,
  Trash2
} from "lucide-react";

export const CustomReports = () => {
  const [reportName, setReportName] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  
  const savedReports = [
    {
      id: 1,
      name: "Monthly Performance Summary",
      description: "Complete overview of monthly business metrics",
      lastRun: "2024-01-15",
      frequency: "Monthly",
      charts: ["revenue", "jobs", "satisfaction"],
      isScheduled: true
    },
    {
      id: 2,
      name: "Technician Efficiency Report",
      description: "Individual and team performance analysis",
      lastRun: "2024-01-14",
      frequency: "Weekly",
      charts: ["efficiency", "jobs", "hours"],
      isScheduled: true
    },
    {
      id: 3,
      name: "Service Type Analysis",
      description: "Breakdown by service categories and profitability",
      lastRun: "2024-01-10",
      frequency: "Quarterly",
      charts: ["services", "revenue", "trends"],
      isScheduled: false
    }
  ];

  const availableMetrics = [
    { id: "revenue", name: "Revenue", category: "Financial" },
    { id: "jobs", name: "Jobs Completed", category: "Operations" },
    { id: "satisfaction", name: "Customer Satisfaction", category: "Quality" },
    { id: "efficiency", name: "Technician Efficiency", category: "Performance" },
    { id: "response_time", name: "Response Time", category: "Performance" },
    { id: "completion_rate", name: "Completion Rate", category: "Operations" },
    { id: "costs", name: "Operating Costs", category: "Financial" },
    { id: "profit_margin", name: "Profit Margin", category: "Financial" },
    { id: "client_retention", name: "Client Retention", category: "Quality" },
    { id: "service_types", name: "Service Distribution", category: "Operations" }
  ];

  const reportTemplates = [
    {
      id: "executive",
      name: "Executive Dashboard",
      description: "High-level KPIs and strategic metrics",
      metrics: ["revenue", "profit_margin", "satisfaction", "efficiency"]
    },
    {
      id: "operational",
      name: "Operational Report",
      description: "Day-to-day operational metrics and performance",
      metrics: ["jobs", "completion_rate", "response_time", "service_types"]
    },
    {
      id: "financial",
      name: "Financial Analysis",
      description: "Comprehensive financial performance report",
      metrics: ["revenue", "costs", "profit_margin", "client_retention"]
    },
    {
      id: "quality",
      name: "Quality Assurance",
      description: "Customer satisfaction and service quality metrics",
      metrics: ["satisfaction", "completion_rate", "client_retention", "efficiency"]
    }
  ];

  const chartTypes = [
    { id: "line", name: "Line Chart", icon: "📈" },
    { id: "bar", name: "Bar Chart", icon: "📊" },
    { id: "pie", name: "Pie Chart", icon: "🥧" },
    { id: "area", name: "Area Chart", icon: "📉" },
    { id: "table", name: "Data Table", icon: "📋" },
    { id: "kpi", name: "KPI Cards", icon: "🎯" }
  ];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const generateReport = () => {
    console.log("Generating report with metrics:", selectedMetrics);
    // Implementation for report generation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Custom Reports</h2>
          <p className="text-muted-foreground">Create and manage custom business reports</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Build Custom Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <Label>Time Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="last90days">Last 90 Days</SelectItem>
                      <SelectItem value="last12months">Last 12 Months</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Metrics Selection */}
              <div>
                <Label className="text-base font-medium">Select Metrics</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  {availableMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMetrics.includes(metric.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleMetricToggle(metric.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {metric.category}
                          </Badge>
                        </div>
                        {selectedMetrics.includes(metric.id) && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart Type Selection */}
              <div>
                <Label className="text-base font-medium">Visualization Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
                  {chartTypes.map((chart) => (
                    <div
                      key={chart.id}
                      className="p-3 border rounded-lg cursor-pointer hover:border-gray-300 text-center"
                    >
                      <div className="text-2xl mb-1">{chart.icon}</div>
                      <p className="text-sm font-medium">{chart.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={generateReport} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Generate Report
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Template
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {savedReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{report.name}</h3>
                      {report.isScheduled && (
                        <Badge variant="default">Scheduled</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Last run: {report.lastRun}</span>
                      <span>Frequency: {report.frequency}</span>
                      <span>Charts: {report.charts.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <Label className="text-xs font-medium">Included Metrics:</Label>
                    <div className="flex flex-wrap gap-1">
                      {template.metrics.map((metricId) => {
                        const metric = availableMetrics.find(m => m.id === metricId);
                        return (
                          <Badge key={metricId} variant="secondary" className="text-xs">
                            {metric?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedReports.filter(r => r.isScheduled).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Runs {report.frequency.toLowerCase()} • Last: {report.lastRun}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Active</Badge>
                      <Button variant="outline" size="sm">
                        Edit Schedule
                      </Button>
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

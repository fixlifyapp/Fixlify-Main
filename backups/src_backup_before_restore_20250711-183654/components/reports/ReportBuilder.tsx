
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Save, 
  Play, 
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Calendar
} from "lucide-react";

interface ReportBuilderProps {
  activeTemplate?: string | null;
}

export const ReportBuilder = ({ activeTemplate }: ReportBuilderProps) => {
  const [reportName, setReportName] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("last30days");

  const availableMetrics = [
    { id: "revenue", name: "Total Revenue", category: "Financial", icon: TrendingUp },
    { id: "jobs_completed", name: "Jobs Completed", category: "Operations", icon: BarChart3 },
    { id: "customer_satisfaction", name: "Customer Satisfaction", category: "Quality", icon: BarChart3 },
    { id: "response_time", name: "Average Response Time", category: "Performance", icon: BarChart3 },
    { id: "technician_efficiency", name: "Technician Efficiency", category: "Performance", icon: BarChart3 },
    { id: "completion_rate", name: "Job Completion Rate", category: "Operations", icon: BarChart3 },
    { id: "profit_margin", name: "Profit Margin", category: "Financial", icon: TrendingUp },
    { id: "client_retention", name: "Client Retention Rate", category: "Quality", icon: BarChart3 }
  ];

  const chartTypes = [
    { id: "line", name: "Line Chart", icon: LineChart, description: "Show trends over time" },
    { id: "bar", name: "Bar Chart", icon: BarChart3, description: "Compare categories" },
    { id: "pie", name: "Pie Chart", icon: PieChart, description: "Show proportions" },
    { id: "table", name: "Data Table", icon: Filter, description: "Detailed data view" }
  ];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleChartToggle = (chartId: string) => {
    setSelectedCharts(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    );
  };

  const generateReport = () => {
    console.log("Generating report:", {
      name: reportName,
      metrics: selectedMetrics,
      charts: selectedCharts,
      dateRange
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
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
        </CardContent>
      </Card>

      {/* Metrics Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Metrics to Include</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableMetrics.map((metric) => (
              <div
                key={metric.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMetrics.includes(metric.id)
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleMetricToggle(metric.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <metric.icon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">{metric.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {metric.category}
                    </Badge>
                  </div>
                  {selectedMetrics.includes(metric.id) && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Types Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Visualization Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {chartTypes.map((chart) => (
              <div
                key={chart.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all text-center ${
                  selectedCharts.includes(chart.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleChartToggle(chart.id)}
              >
                <chart.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-sm mb-1">{chart.name}</h4>
                <p className="text-xs text-muted-foreground">{chart.description}</p>
                {selectedCharts.includes(chart.id) && (
                  <Badge className="mt-2" variant="default">Selected</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={generateReport} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Generate Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save as Template
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Table,
  Download,
  Share,
  Eye,
  Settings
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Widget {
  id: string;
  type: 'chart' | 'metric' | 'table';
  title: string;
  dataSource: string;
  chartType?: 'line' | 'bar' | 'pie';
  metrics: string[];
  filters: any[];
  position: { x: number; y: number; w: number; h: number };
}

interface ReportConfig {
  name: string;
  description: string;
  widgets: Widget[];
  filters: any[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

export const CustomReportBuilder = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: "Custom Revenue Report",
    description: "Track revenue metrics and trends",
    widgets: [],
    filters: []
  });

  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Sample data for charts
  const sampleData = [
    { month: 'Jan', revenue: 65000, jobs: 45, satisfaction: 4.2 },
    { month: 'Feb', revenue: 72000, jobs: 52, satisfaction: 4.3 },
    { month: 'Mar', revenue: 68000, jobs: 48, satisfaction: 4.4 },
    { month: 'Apr', revenue: 78000, jobs: 55, satisfaction: 4.5 },
    { month: 'May', revenue: 85000, jobs: 62, satisfaction: 4.6 },
    { month: 'Jun', revenue: 92000, jobs: 68, satisfaction: 4.7 }
  ];

  const availableMetrics = [
    { id: 'revenue', name: 'Revenue', type: 'currency' },
    { id: 'jobs', name: 'Jobs Completed', type: 'number' },
    { id: 'satisfaction', name: 'Customer Satisfaction', type: 'rating' },
    { id: 'efficiency', name: 'Technician Efficiency', type: 'percentage' },
    { id: 'customers', name: 'Active Customers', type: 'number' }
  ];

  const dataSources = [
    { id: 'jobs', name: 'Jobs Data' },
    { id: 'customers', name: 'Customer Data' },
    { id: 'financial', name: 'Financial Data' },
    { id: 'technicians', name: 'Technician Data' }
  ];

  const addWidget = (type: 'chart' | 'metric' | 'table') => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: `New ${type}`,
      dataSource: 'jobs',
      chartType: type === 'chart' ? 'line' : undefined,
      metrics: ['revenue'],
      filters: [],
      position: { x: 0, y: 0, w: 6, h: 4 }
    };

    setReportConfig({
      ...reportConfig,
      widgets: [...reportConfig.widgets, newWidget]
    });
    setSelectedWidget(newWidget);
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    setReportConfig({
      ...reportConfig,
      widgets: reportConfig.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, ...updates } : widget
      )
    });
  };

  const deleteWidget = (widgetId: string) => {
    setReportConfig({
      ...reportConfig,
      widgets: reportConfig.widgets.filter(widget => widget.id !== widgetId)
    });
    setSelectedWidget(null);
  };

  const renderChart = (widget: Widget) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];
    
    switch (widget.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsLineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              {widget.metrics.map((metric, index) => (
                <Line 
                  key={metric}
                  type="monotone" 
                  dataKey={metric} 
                  stroke={colors[index % colors.length]} 
                  strokeWidth={2} 
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsBarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              {widget.metrics.map((metric, index) => (
                <Bar 
                  key={metric}
                  dataKey={metric} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        const pieData = widget.metrics.map((metric, index) => ({
          name: availableMetrics.find(m => m.id === metric)?.name || metric,
          value: sampleData[sampleData.length - 1][metric as keyof typeof sampleData[0]] || 0
        }));
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="h-48 flex items-center justify-center text-gray-500">No chart type selected</div>;
    }
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'chart':
        return (
          <Card key={widget.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWidget(widget)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{widget.title}</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWidget(widget.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderChart(widget)}
            </CardContent>
          </Card>
        );
      case 'metric':
        const metricValue = sampleData[sampleData.length - 1][widget.metrics[0] as keyof typeof sampleData[0]] || 0;
        return (
          <Card key={widget.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWidget(widget)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{widget.title}</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWidget(widget.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metricValue.toLocaleString()}</div>
              <p className="text-sm text-gray-600">{availableMetrics.find(m => m.id === widget.metrics[0])?.name}</p>
            </CardContent>
          </Card>
        );
      case 'table':
        return (
          <Card key={widget.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWidget(widget)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{widget.title}</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWidget(widget.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleData.slice(-3).map((row, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{row.month}</span>
                    <span>${row.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const saveReport = () => {
    console.log('Saving report:', reportConfig);
    // Integration with backend would go here
  };

  const runReport = () => {
    console.log('Running report:', reportConfig);
    setIsPreviewMode(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Custom Report Builder</h2>
          <p className="text-gray-600">Design and build custom reports with drag-and-drop widgets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={saveReport}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={runReport}>
            <Play className="h-4 w-4 mr-2" />
            Run Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Widget Library */}
        {!isPreviewMode && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Widget Library</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => addWidget('chart')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Add Chart
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => addWidget('metric')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Add Metric
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => addWidget('table')}
                >
                  <Table className="h-4 w-4 mr-2" />
                  Add Table
                </Button>
              </CardContent>
            </Card>

            {/* Widget Configuration */}
            {selectedWidget && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Widget Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="widget-title">Title</Label>
                    <Input
                      id="widget-title"
                      value={selectedWidget.title}
                      onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="data-source">Data Source</Label>
                    <Select
                      value={selectedWidget.dataSource}
                      onValueChange={(value) => updateWidget(selectedWidget.id, { dataSource: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedWidget.type === 'chart' && (
                    <div>
                      <Label htmlFor="chart-type">Chart Type</Label>
                      <Select
                        value={selectedWidget.chartType}
                        onValueChange={(value: 'line' | 'bar' | 'pie') => updateWidget(selectedWidget.id, { chartType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="pie">Pie Chart</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Metrics</Label>
                    <div className="space-y-2 mt-2">
                      {availableMetrics.map((metric) => (
                        <label key={metric.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedWidget.metrics.includes(metric.id)}
                            onChange={(e) => {
                              const metrics = e.target.checked
                                ? [...selectedWidget.metrics, metric.id]
                                : selectedWidget.metrics.filter(m => m !== metric.id);
                              updateWidget(selectedWidget.id, { metrics });
                            }}
                          />
                          <span className="text-sm">{metric.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Report Canvas */}
        <div className={isPreviewMode ? "lg:col-span-4" : "lg:col-span-3"}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{reportConfig.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{reportConfig.widgets.length} widgets</Badge>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <p className="text-sm text-gray-600">{reportConfig.description}</p>
            </CardHeader>
            <CardContent>
              {reportConfig.widgets.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No widgets added</h3>
                  <p className="text-gray-600">Start building your report by adding widgets from the library</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportConfig.widgets.map(renderWidget)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Options */}
          {isPreviewMode && reportConfig.widgets.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Export & Share</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

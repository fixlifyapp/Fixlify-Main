
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  File, 
  Image,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from "lucide-react";

export const ExportCenter = () => {
  const [exports, setExports] = useState([
    {
      id: 1,
      name: "Executive Summary - Q1 2024",
      format: "PDF",
      size: "2.4 MB",
      status: "completed",
      progress: 100,
      createdAt: "2024-01-15 14:30",
      downloadUrl: "#",
      expiresAt: "2024-01-22 14:30"
    },
    {
      id: 2,
      name: "Financial Report - December",
      format: "Excel",
      size: "5.1 MB",
      status: "completed",
      progress: 100,
      createdAt: "2024-01-15 13:15",
      downloadUrl: "#",
      expiresAt: "2024-01-22 13:15"
    },
    {
      id: 3,
      name: "Operational Metrics - Weekly",
      format: "CSV",
      size: "856 KB",
      status: "processing",
      progress: 75,
      createdAt: "2024-01-15 15:45",
      downloadUrl: null,
      expiresAt: null
    },
    {
      id: 4,
      name: "Team Performance Analysis",
      format: "PDF",
      size: "3.2 MB",
      status: "failed",
      progress: 0,
      createdAt: "2024-01-15 12:00",
      downloadUrl: null,
      expiresAt: null,
      error: "Data source unavailable"
    }
  ]);

  const formatOptions = [
    { id: "pdf", name: "PDF", icon: FileText, description: "Formatted report with charts" },
    { id: "excel", name: "Excel", icon: File, description: "Spreadsheet with raw data" },
    { id: "csv", name: "CSV", icon: File, description: "Comma-separated values" },
    { id: "png", name: "PNG", icon: Image, description: "High-resolution charts" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const retryExport = (id: number) => {
    setExports(prev => prev.map(exp => 
      exp.id === id 
        ? { ...exp, status: 'processing', progress: 25, error: undefined }
        : exp
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Export Center</h2>
          <p className="text-muted-foreground">Download and manage your exported reports</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          New Export
        </Button>
      </div>

      {/* Export Formats */}
      <Card>
        <CardHeader>
          <CardTitle>Available Export Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {formatOptions.map((format) => (
              <div
                key={format.id}
                className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
              >
                <format.icon className="h-8 w-8 mb-2 text-blue-600" />
                <h4 className="font-medium mb-1">{format.name}</h4>
                <p className="text-xs text-muted-foreground">{format.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exports.map((exportItem) => (
              <div key={exportItem.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(exportItem.status)}
                    <div>
                      <h4 className="font-medium">{exportItem.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {exportItem.format} • {exportItem.size} • {exportItem.createdAt}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(exportItem.status)}>
                    {exportItem.status}
                  </Badge>
                </div>

                {exportItem.status === 'processing' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Processing...</span>
                      <span>{exportItem.progress}%</span>
                    </div>
                    <Progress value={exportItem.progress} className="h-2" />
                  </div>
                )}

                {exportItem.error && (
                  <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded">
                    Error: {exportItem.error}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {exportItem.expiresAt && (
                      <span>Expires: {exportItem.expiresAt}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {exportItem.status === 'completed' && (
                      <>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                      </>
                    )}
                    {exportItem.status === 'failed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => retryExport(exportItem.id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-blue-900">Retention Period</h4>
              <p className="text-2xl font-bold text-blue-600">7 Days</p>
              <p className="text-sm text-blue-700">Auto-delete exports</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Download className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium text-green-900">Storage Used</h4>
              <p className="text-2xl font-bold text-green-600">45.7 MB</p>
              <p className="text-sm text-green-700">of 1 GB limit</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium text-purple-900">Total Exports</h4>
              <p className="text-2xl font-bold text-purple-600">
                {exports.filter(e => e.status === 'completed').length}
              </p>
              <p className="text-sm text-purple-700">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

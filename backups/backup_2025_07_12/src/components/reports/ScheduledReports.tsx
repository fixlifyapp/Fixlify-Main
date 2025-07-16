import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  Clock, 
  Mail, 
  FileText,
  Edit,
  Trash2,
  Play,
  Pause,
  Plus,
  Download,
  Users
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const ScheduledReports = () => {
  const isMobile = useIsMobile();
  
  const [reports, setReports] = useState([
    {
      id: 1,
      name: "Daily Operations Summary",
      template: "Operational Metrics",
      frequency: "Daily",
      time: "09:00 AM",
      recipients: ["manager@company.com", "ops@company.com"],
      status: "active",
      lastRun: "2024-01-15 09:00",
      nextRun: "2024-01-16 09:00",
      format: "PDF",
      enabled: true
    },
    {
      id: 2,
      name: "Weekly Financial Report",
      template: "Financial Performance",
      frequency: "Weekly",
      time: "Monday 08:00 AM",
      recipients: ["cfo@company.com", "finance@company.com"],
      status: "active",
      lastRun: "2024-01-15 08:00",
      nextRun: "2024-01-22 08:00",
      format: "Excel",
      enabled: true
    },
    {
      id: 3,
      name: "Monthly Executive Summary",
      template: "Executive Summary",
      frequency: "Monthly",
      time: "1st Monday 10:00 AM",
      recipients: ["ceo@company.com", "board@company.com"],
      status: "active",
      lastRun: "2024-01-01 10:00",
      nextRun: "2024-02-05 10:00",
      format: "PDF",
      enabled: true
    },
    {
      id: 4,
      name: "Customer Satisfaction Review",
      template: "Customer Insights",
      frequency: "Weekly",
      time: "Friday 05:00 PM",
      recipients: ["quality@company.com"],
      status: "paused",
      lastRun: "2024-01-12 17:00",
      nextRun: "-",
      format: "PDF",
      enabled: false
    }
  ]);

  const toggleReport = (id: number) => {
    setReports(prev => prev.map(report => 
      report.id === id 
        ? { ...report, enabled: !report.enabled, status: report.enabled ? 'paused' : 'active' }
        : report
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'Daily': return <Clock className={isMobile ? "h-3 w-3" : "h-4 w-4"} />;
      case 'Weekly': return <Calendar className={isMobile ? "h-3 w-3" : "h-4 w-4"} />;
      case 'Monthly': return <Calendar className={isMobile ? "h-3 w-3" : "h-4 w-4"} />;
      default: return <Clock className={isMobile ? "h-3 w-3" : "h-4 w-4"} />;
    }
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'}`}>
        <div>
          <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>Scheduled Reports</h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            {isMobile ? "Automated reports" : "Automated report generation and distribution"}
          </p>
        </div>
        <Button className={`flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`} size={isMobile ? "sm" : "default"}>
          <Plus className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          {isMobile ? "New Report" : "New Scheduled Report"}
        </Button>
      </div>

      {/* Active Reports */}
      <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className={isMobile ? "p-4" : "p-6"}>
              <div className={`flex items-center justify-between mb-4 ${isMobile ? 'mb-3' : 'mb-4'}`}>
                <div className="flex items-center gap-3">
                  <FileText className={`text-blue-600 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  <div>
                    <h3 className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>{report.name}</h3>
                    <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Template: {report.template}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(report.status)} ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
                    {report.status}
                  </Badge>
                  <Switch 
                    checked={report.enabled} 
                    onCheckedChange={() => toggleReport(report.id)}
                  />
                </div>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 ${isMobile ? 'gap-3 mb-3' : 'gap-4 mb-4'}`}>
                <div className="flex items-center gap-2">
                  {getFrequencyIcon(report.frequency)}
                  <div>
                    <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>Frequency</p>
                    <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{report.frequency}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className={`text-gray-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <div>
                    <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>Schedule</p>
                    <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{report.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className={`text-gray-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <div>
                    <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>Recipients</p>
                    <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{report.recipients.length} people</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Download className={`text-gray-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <div>
                    <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>Format</p>
                    <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{report.format}</p>
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 ${isMobile ? 'text-xs gap-2 mb-3' : 'text-sm gap-4 mb-4'}`}>
                <div>
                  <p className="text-muted-foreground">Last Run: <span className="text-foreground">{report.lastRun}</span></p>
                </div>
                <div>
                  <p className="text-muted-foreground">Next Run: <span className="text-foreground">{report.nextRun}</span></p>
                </div>
              </div>

              <div className={`flex ${isMobile ? 'flex-wrap gap-1' : 'flex-wrap gap-2'}`}>
                <Button size="sm" variant="outline" className={isMobile ? "text-xs px-2 py-1" : ""}>
                  <Play className={`mr-1 ${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                  {isMobile ? "Run" : "Run Now"}
                </Button>
                <Button size="sm" variant="outline" className={isMobile ? "text-xs px-2 py-1" : ""}>
                  <Edit className={`mr-1 ${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                  {isMobile ? "Edit" : "Edit Schedule"}
                </Button>
                {!isMobile && (
                  <>
                    <Button size="sm" variant="outline">
                      <Mail className="h-3 w-3 mr-1" />
                      Edit Recipients
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download Last
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline" className={`text-red-600 hover:text-red-700 ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
                  <Trash2 className={`mr-1 ${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? "text-base" : ""}>Schedule Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-3 gap-6'}`}>
            <div className={`text-center bg-blue-50 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
              <Calendar className={`mx-auto mb-2 text-blue-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              <h4 className={`font-medium text-blue-900 ${isMobile ? 'text-sm' : ''}`}>Total Scheduled</h4>
              <p className={`font-bold text-blue-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{reports.length}</p>
            </div>
            
            <div className={`text-center bg-green-50 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
              <Play className={`mx-auto mb-2 text-green-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              <h4 className={`font-medium text-green-900 ${isMobile ? 'text-sm' : ''}`}>Active Reports</h4>
              <p className={`font-bold text-green-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {reports.filter(r => r.enabled).length}
              </p>
            </div>
            
            <div className={`text-center bg-purple-50 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
              <Mail className={`mx-auto mb-2 text-purple-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              <h4 className={`font-medium text-purple-900 ${isMobile ? 'text-sm' : ''}`}>Total Recipients</h4>
              <p className={`font-bold text-purple-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {new Set(reports.flatMap(r => r.recipients)).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

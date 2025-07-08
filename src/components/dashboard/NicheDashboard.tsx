import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Thermometer, Droplets, Zap, Package, Home,
  TrendingUp, Clock, AlertCircle, Tool, Calendar
} from "lucide-react";

interface NicheDashboardProps {
  businessType: string;
}

interface Metric {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: number;
}

const useNicheMetrics = (businessType: string) => {
  // In a real implementation, this would fetch data from your backend
  // For now, returning mock data
  return {
    serviceCalls: 5,
    maintenanceDue: 12,
    emergencyRequests: 2,
    lowInventory: 3,
    totalRevenue: "$12,500",
    activeJobs: 8,
    completedToday: 3,
    upcomingAppointments: 6
  };
};

const MetricsGrid = ({ kpis }: { kpis: Metric[] }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {kpi.label}
            </CardTitle>
            {kpi.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            {kpi.trend && (
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                {kpi.trend > 0 ? '+' : ''}{kpi.trend}% from last month
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export const NicheDashboard: React.FC<NicheDashboardProps> = ({ businessType }) => {
  const metrics = useNicheMetrics(businessType);
  
  const getKPIs = (): Metric[] => {
    switch (businessType) {
      case 'HVAC Services':
        return [
          { 
            label: 'Service Calls Today', 
            value: metrics.serviceCalls,
            icon: <Thermometer className="h-4 w-4 text-muted-foreground" />,
            trend: 12
          },
          { 
            label: 'Maintenance Due', 
            value: metrics.maintenanceDue,
            icon: <Clock className="h-4 w-4 text-muted-foreground" />,
            trend: -5
          },
          { 
            label: 'Emergency Requests', 
            value: metrics.emergencyRequests,
            icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
            trend: 0
          },
          { 
            label: 'Parts Inventory Low', 
            value: metrics.lowInventory,
            icon: <Package className="h-4 w-4 text-muted-foreground" />,
            trend: -8
          }
        ];
        
      case 'Plumbing Services':
        return [
          { 
            label: 'Active Jobs', 
            value: metrics.activeJobs,
            icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
            trend: 15
          },
          { 
            label: 'Emergency Calls', 
            value: metrics.emergencyRequests,
            icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
            trend: 5
          },
          { 
            label: 'Completed Today', 
            value: metrics.completedToday,
            icon: <Tool className="h-4 w-4 text-muted-foreground" />,
            trend: 20
          },
          { 
            label: 'Revenue Today', 
            value: metrics.totalRevenue,
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
            trend: 18
          }
        ];
      case 'Electrical Services':
        return [
          { 
            label: 'Jobs Scheduled', 
            value: metrics.activeJobs,
            icon: <Zap className="h-4 w-4 text-muted-foreground" />,
            trend: 10
          },
          { 
            label: 'Inspections Due', 
            value: metrics.maintenanceDue,
            icon: <Clock className="h-4 w-4 text-muted-foreground" />,
            trend: -3
          },
          { 
            label: 'Emergency Calls', 
            value: metrics.emergencyRequests,
            icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
            trend: 0
          },
          { 
            label: 'Revenue MTD', 
            value: metrics.totalRevenue,
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
            trend: 22
          }
        ];
        
      case 'Roofing Services':
        return [
          { 
            label: 'Active Projects', 
            value: metrics.activeJobs,
            icon: <Home className="h-4 w-4 text-muted-foreground" />,
            trend: 8
          },
          { 
            label: 'Inspections', 
            value: metrics.maintenanceDue,
            icon: <Clock className="h-4 w-4 text-muted-foreground" />,
            trend: 12
          },
          { 
            label: 'Storm Damage Calls', 
            value: metrics.emergencyRequests,
            icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
            trend: 25
          },
          { 
            label: 'Revenue This Month', 
            value: metrics.totalRevenue,
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
            trend: 30
          }
        ];
        
      default:
        // Generic metrics for other business types
        return [
          { 
            label: 'Active Jobs', 
            value: metrics.activeJobs,
            icon: <Tool className="h-4 w-4 text-muted-foreground" />,
            trend: 10
          },
          { 
            label: 'Completed Today', 
            value: metrics.completedToday,
            icon: <Clock className="h-4 w-4 text-muted-foreground" />,
            trend: 5
          },
          { 
            label: 'Upcoming', 
            value: metrics.upcomingAppointments,
            icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
            trend: 8
          },
          { 
            label: 'Revenue Today', 
            value: metrics.totalRevenue,
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
            trend: 15
          }
        ];
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">
        {businessType} Dashboard
      </h2>
      <MetricsGrid kpis={getKPIs()} />
    </div>
  );
};
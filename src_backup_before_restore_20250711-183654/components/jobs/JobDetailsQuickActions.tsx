
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, FileText, MapPin, Phone, User, Zap } from "lucide-react";

interface JobDetailsQuickActionsProps {
  job: {
    id: string;
    title: string;
    status: string;
    client_name?: string;
    client_phone?: string;
    address?: string;
    scheduled_date?: string;
    scheduled_time?: string;
    estimated_value?: number;
  };
  onScheduleEdit?: () => void;
  onEstimateCreate?: () => void;
  onClientCall?: () => void;
  onJobUpdate?: () => void;
}

export const JobDetailsQuickActions = ({
  job,
  onScheduleEdit,
  onEstimateCreate,
  onClientCall,
  onJobUpdate
}: JobDetailsQuickActionsProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Job Status Card */}
      <Card>
        <CardHeader>
          <CardTitleWithIcon icon={Zap}>
            Quick Actions
          </CardTitleWithIcon>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">{job.title}</h3>
              <p className="text-sm text-gray-600">Job #{job.id.slice(0, 8)}</p>
            </div>
            <Badge className={getStatusColor(job.status)}>
              {job.status}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            {job.client_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{job.client_name}</span>
              </div>
            )}
            
            {job.client_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{job.client_phone}</span>
              </div>
            )}
            
            {job.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{job.address}</span>
              </div>
            )}
            
            {job.scheduled_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{job.scheduled_date} {job.scheduled_time}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span>{formatCurrency(job.estimated_value)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitleWithIcon icon={Zap}>
            Actions
          </CardTitleWithIcon>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" onClick={onScheduleEdit} className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Edit Schedule
            </Button>
            
            <Button variant="outline" onClick={onEstimateCreate} className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Create Estimate
            </Button>
            
            <Button variant="outline" onClick={onClientCall} className="justify-start">
              <Phone className="h-4 w-4 mr-2" />
              Call Client
            </Button>
            
            <Button variant="outline" onClick={onJobUpdate} className="justify-start">
              <Zap className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

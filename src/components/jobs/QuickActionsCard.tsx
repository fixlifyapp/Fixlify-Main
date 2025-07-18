import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Edit, MessageSquare, FileText } from 'lucide-react';
import type { Job } from '@/types/job.types';
import { JobStatus } from '@/types/job.types';

interface QuickActionsCardProps {
  job: Job;
  onEdit?: () => void;
  onStatusChange?: (status: JobStatus) => void;
  onSendCommunication?: (type: 'email' | 'sms', recipient: any) => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ 
  job, 
  onEdit,
  onStatusChange,
  onSendCommunication 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Job
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => onSendCommunication?.('sms', job.customer)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Send SMS
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => onSendCommunication?.('email', job.customer)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;

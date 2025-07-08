
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageSquare, FileText } from 'lucide-react';

interface JobDetailsQuickActionsProps {
  jobId: string;
  clientId?: string;
}

const JobDetailsQuickActions: React.FC<JobDetailsQuickActionsProps> = ({
  jobId,
  clientId
}) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Phone className="h-4 w-4 mr-2" />
        Call
      </Button>
      <Button variant="outline" size="sm">
        <Mail className="h-4 w-4 mr-2" />
        Email
      </Button>
      <Button variant="outline" size="sm">
        <MessageSquare className="h-4 w-4 mr-2" />
        Text
      </Button>
      <Button variant="outline" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Estimate
      </Button>
    </div>
  );
};

export default JobDetailsQuickActions;

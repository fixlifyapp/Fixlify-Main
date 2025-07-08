
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EstimateSendStepProps {
  jobId: string;
  onClose: () => void;
  onEstimateCreated?: () => void;
}

export const EstimateSendStep: React.FC<EstimateSendStepProps> = ({ 
  jobId, 
  onClose, 
  onEstimateCreated 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Estimate</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Send options for job: {jobId}</p>
      </CardContent>
    </Card>
  );
};

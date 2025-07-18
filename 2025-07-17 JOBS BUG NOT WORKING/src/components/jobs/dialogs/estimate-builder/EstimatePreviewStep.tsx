
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EstimatePreviewStepProps {
  jobId: string;
}

export const EstimatePreviewStep: React.FC<EstimatePreviewStepProps> = ({ jobId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimate Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Preview for job: {jobId}</p>
      </CardContent>
    </Card>
  );
};

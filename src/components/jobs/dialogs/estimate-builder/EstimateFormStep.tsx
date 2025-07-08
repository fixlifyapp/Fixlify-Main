
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EstimateFormStepProps {
  jobId: string;
  job: any;
}

export const EstimateFormStep: React.FC<EstimateFormStepProps> = ({ jobId, job }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimate Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Estimate form for job: {jobId}</p>
        {job && <p>Job title: {job.title}</p>}
      </CardContent>
    </Card>
  );
};

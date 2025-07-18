import React from 'react';
import { useJob } from '@/hooks/useJob';
import JobOverview from './JobOverview';
import { Skeleton } from '@/components/ui/skeleton';

interface JobOverviewWrapperProps {
  jobId: string;
}

const JobOverviewWrapper: React.FC<JobOverviewWrapperProps> = ({ jobId }) => {
  const { jobData, loading, error } = useJob(jobId);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load job details</p>
      </div>
    );
  }

  return <JobOverview job={jobData} />;
};

export default JobOverviewWrapper;

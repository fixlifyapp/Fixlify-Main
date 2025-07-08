
import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { JobInfo } from '@/types/job';
import { Briefcase } from 'lucide-react';

interface JobDetailsHeaderProps {
  job: JobInfo;
}

const JobDetailsHeader: React.FC<JobDetailsHeaderProps> = ({ job }) => {
  const badges = [];
  
  if (job.revenue) {
    badges.push(
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
        ${job.revenue.toLocaleString()}
      </span>
    );
  }
  
  if (job.date) {
    badges.push(
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
        {new Date(job.date).toLocaleDateString()}
      </span>
    );
  }

  return (
    <PageHeader
      title={job.title}
      subtitle={job.description}
      icon={Briefcase}
      badges={badges}
    />
  );
};

export default JobDetailsHeader;

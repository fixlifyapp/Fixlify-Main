
import React from 'react';
import { JobInfo } from '@/types/job';

interface JobDetailsProps {
  job: JobInfo;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{job.title}</h2>
        <p className="text-gray-600">{job.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Schedule Date</label>
          <p>{job.scheduleDate}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
          <p>{job.scheduleTime}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <p>{job.type}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Client ID</label>
          <p>{job.clientId}</p>
        </div>
      </div>
      
      {job.tags && job.tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {job.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;

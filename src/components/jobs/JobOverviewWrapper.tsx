
import { useParams } from "react-router-dom";
import { JobOverview } from "./JobOverview";

export const JobOverviewWrapper = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Job ID not found</div>;
  }

  return <JobOverview jobId={id} />;
};

export default JobOverviewWrapper;

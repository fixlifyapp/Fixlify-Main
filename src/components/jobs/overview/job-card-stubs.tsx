// Create a comprehensive stub for all remaining job overview cards with icon issues
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Stub components to fix all the icon prop errors
export const JobBasicInfoCard = ({ job }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Basic Information</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Job ID: {job?.id}</p>
    </CardContent>
  </Card>
);

export const JobTagsCard = ({ tags }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Tags</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Tags: {tags?.join(', ') || 'No tags'}</p>
    </CardContent>
  </Card>
);

export const ScheduleInfoCard = ({ job }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Schedule Information</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Scheduled: {job?.scheduled_date || 'Not scheduled'}</p>
    </CardContent>
  </Card>
);

export const TasksCard = ({ tasks }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Tasks</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Tasks: {tasks?.length || 0}</p>
    </CardContent>
  </Card>
);

export const TechnicianCard = ({ job }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Technician</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Assigned to: {job?.technician || 'Not assigned'}</p>
    </CardContent>
  </Card>
);
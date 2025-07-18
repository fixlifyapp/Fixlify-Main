import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { TaskDashboard } from '@/components/tasks/TaskDashboard';
import { CheckSquare } from 'lucide-react';

const TasksPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Tasks"
        subtitle="Manage and track all your tasks"
        icon={CheckSquare}
      />
      <TaskDashboard />
    </PageLayout>
  );
};

export default TasksPage;

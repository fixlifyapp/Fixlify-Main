import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import type { Job } from '@/types/job.types';

interface ExpensesTabProps {
  job: Job;
}

const ExpensesTab: React.FC<ExpensesTabProps> = ({ job }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No expenses recorded yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesTab;

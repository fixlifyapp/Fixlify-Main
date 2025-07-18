import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StickyNote } from 'lucide-react';
import type { Job } from '@/types/job.types';

interface NotesCardProps {
  job: Job;
}

const NotesCard: React.FC<NotesCardProps> = ({ job }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {job.notes || 'No notes added yet.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default NotesCard;

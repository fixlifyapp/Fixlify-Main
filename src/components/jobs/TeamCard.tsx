import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import type { Job } from '@/types/job.types';

interface TeamCardProps {
  job: Job;
}

const TeamCard: React.FC<TeamCardProps> = ({ job }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          No team members assigned yet.
        </p>
      </CardContent>
    </Card>
  );
};

export default TeamCard;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import type { Job } from '@/types/job.types';

interface PhotosCardProps {
  job: Job;
}

const PhotosCard: React.FC<PhotosCardProps> = ({ job }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          No photos uploaded yet.
        </p>
      </CardContent>
    </Card>
  );
};

export default PhotosCard;

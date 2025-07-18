import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import type { Job } from '@/types/job.types';

interface DocumentsTabProps {
  job: Job;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ job }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No documents uploaded yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsTab;

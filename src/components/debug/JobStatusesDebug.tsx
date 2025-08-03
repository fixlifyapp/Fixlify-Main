import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobStatuses } from '@/hooks/useConfigItems';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export const JobStatusesDebug = () => {
  const { items: jobStatuses, isLoading } = useJobStatuses();
  const { user } = useAuth();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Job Statuses Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-2">
          <p><strong>Current User ID:</strong> {user?.id || 'Not logged in'}</p>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Status Count:</strong> {jobStatuses.length}</p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading statuses...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="font-medium">Available Statuses:</h3>
            {jobStatuses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No statuses found</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {jobStatuses.map((status) => (
                  <div key={status.id} className="flex items-center gap-2 p-2 border rounded">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: status.color || '#6b7280' }}
                    />
                    <span className="text-sm">{status.name}</span>
                    <span className="text-xs text-muted-foreground">
                      (seq: {status.sequence})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Placeholder component - Communication history removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export function CommunicationHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication History
        </CardTitle>
        <CardDescription>
          Communication functionality has been removed for reimplementation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          No communication history available
        </div>
      </CardContent>
    </Card>
  );
}

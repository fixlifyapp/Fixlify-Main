// Placeholder page - Edge Functions management removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server } from 'lucide-react';

export default function EdgeFunctionsPage() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Edge Functions
          </CardTitle>
          <CardDescription>
            Edge Functions management has been removed for reimplementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Edge Functions will be available after SMS/Email implementation
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

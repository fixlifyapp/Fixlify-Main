
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const Clients = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Client management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;

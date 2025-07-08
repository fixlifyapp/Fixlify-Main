
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Bug } from 'lucide-react';

export function AuthDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, session, loading, error, isAuthenticated } = useAuth();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="mb-2"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
        {isOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
      </Button>
      
      {isOpen && (
        <Card className="w-80 max-h-96 overflow-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Auth Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span>Loading:</span>
              <Badge variant={loading ? "destructive" : "secondary"}>
                {loading ? "true" : "false"}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Authenticated:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "true" : "false"}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Has User:</span>
              <Badge variant={user ? "default" : "secondary"}>
                {user ? "true" : "false"}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Has Session:</span>
              <Badge variant={session ? "default" : "secondary"}>
                {session ? "true" : "false"}
              </Badge>
            </div>
            
            {error && (
              <div className="pt-2 border-t">
                <span className="font-medium text-red-600">Error:</span>
                <p className="text-red-600 break-words">{error}</p>
              </div>
            )}
            
            {user && (
              <div className="pt-2 border-t">
                <span className="font-medium">User ID:</span>
                <p className="break-all">{user.id}</p>
                <span className="font-medium">Email:</span>
                <p className="break-words">{user.email}</p>
              </div>
            )}
            
            <div className="pt-2 border-t">
              <span className="font-medium">Current URL:</span>
              <p className="break-words">{window.location.href}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

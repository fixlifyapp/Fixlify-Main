
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface NotFoundStateProps {
  onGoBack: () => void;
  error?: string | null;
}

export const NotFoundState = ({ onGoBack, error }: NotFoundStateProps) => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <Card className="border-red-200 shadow-sm">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h1 className="text-2xl font-bold mb-2">Team Member Not Found</h1>
              
              {error && (
                <p className="text-muted-foreground mb-4">
                  {error}
                </p>
              )}
              
              <div className="text-muted-foreground mb-4">
                <p>This could be due to one of the following reasons:</p>
                <ul className="list-disc text-left mt-2 ml-6">
                  <li>The team member may have been deleted</li>
                  <li>You may not have permission to view this team member</li>
                  <li>There might be a connectivity issue with the database</li>
                </ul>
              </div>
              
              <Button onClick={onGoBack}>Return to Team List</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

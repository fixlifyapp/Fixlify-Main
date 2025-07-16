
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Settings2 } from "lucide-react";

export function ConfigurationCard() {
  return (
    <Link to="/settings/configuration">
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="bg-muted/50">
          <div className="flex items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Manage configurable elements of the application like business niche, tax settings, tags, job types, statuses, and custom fields
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
              Business Niche
            </div>
            <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
              Tax Settings
            </div>
            <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
              Tags
            </div>
            <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
              Job Types
            </div>
            <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
              Job Statuses
            </div>
            <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
              Custom Fields
            </div>
            <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
              Lead Sources
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

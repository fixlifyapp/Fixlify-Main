
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";

interface AIStatusCardProps {
  isActive: boolean;
  onToggle: (checked: boolean) => void;
}

export const AIStatusCard = ({ isActive, onToggle }: AIStatusCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Dispatcher Status
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant={isActive ? "success" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
            <Switch checked={isActive} onCheckedChange={onToggle} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Your AI dispatcher is {isActive ? 'active and will' : 'inactive. When active, it will'} automatically 
          answer calls, understand customer needs, and schedule appointments.
        </p>
      </CardContent>
    </Card>
  );
};

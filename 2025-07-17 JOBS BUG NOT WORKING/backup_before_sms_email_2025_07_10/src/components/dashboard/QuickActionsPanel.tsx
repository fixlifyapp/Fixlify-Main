
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Phone, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActionsPanel = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => navigate('/jobs/new')}
          >
            <Plus className="h-3 w-3" />
            New Job
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => navigate('/calendar')}
          >
            <Calendar className="h-3 w-3" />
            Schedule
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => navigate('/connect')}
          >
            <Phone className="h-3 w-3" />
            Call Client
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => navigate('/connect')}
          >
            <MessageSquare className="h-3 w-3" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

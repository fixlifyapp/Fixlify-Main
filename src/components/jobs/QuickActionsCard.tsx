
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, FileText, DollarSign, Zap } from "lucide-react";

interface QuickActionsCardProps {
  jobId: string;
}

export const QuickActionsCard = ({ jobId }: QuickActionsCardProps) => {
  const actions = [
    { icon: MessageSquare, label: "Send Message", action: () => console.log('Send message') },
    { icon: Phone, label: "Make Call", action: () => console.log('Make call') },
    { icon: Mail, label: "Send Email", action: () => console.log('Send email') },
    { icon: FileText, label: "Create Estimate", action: () => console.log('Create estimate') },
    { icon: DollarSign, label: "Create Invoice", action: () => console.log('Create invoice') },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start"
              onClick={action.action}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

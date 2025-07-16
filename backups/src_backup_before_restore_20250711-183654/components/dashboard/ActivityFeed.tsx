
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MessageSquare, Phone, Calendar, DollarSign } from "lucide-react";

export const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: "message",
      description: "New message from John Smith",
      time: "5 minutes ago",
      icon: MessageSquare,
      iconColor: "text-blue-600"
    },
    {
      id: 2,
      type: "call",
      description: "Missed call from Sarah Johnson",
      time: "12 minutes ago",
      icon: Phone,
      iconColor: "text-red-600"
    },
    {
      id: 3,
      type: "appointment",
      description: "Job scheduled for tomorrow 9:00 AM",
      time: "1 hour ago",
      icon: Calendar,
      iconColor: "text-green-600"
    },
    {
      id: 4,
      type: "payment",
      description: "Payment received - $250.00",
      time: "2 hours ago",
      icon: DollarSign,
      iconColor: "text-yellow-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`p-2 rounded-lg bg-gray-100 ${activity.iconColor}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

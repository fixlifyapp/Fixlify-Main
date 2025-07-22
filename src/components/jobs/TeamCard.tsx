
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, UserCheck } from "lucide-react";

interface TeamCardProps {
  jobId: string;
}

export const TeamCard = ({ jobId }: TeamCardProps) => {
  const teamMembers = [
    { id: '1', name: 'John Doe', role: 'Lead Technician', avatar: '', status: 'assigned' },
    { id: '2', name: 'Jane Smith', role: 'Assistant', avatar: '', status: 'available' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Assignment
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Assign
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Badge variant={member.status === 'assigned' ? 'default' : 'outline'}>
                {member.status === 'assigned' ? (
                  <UserCheck className="h-3 w-3 mr-1" />
                ) : null}
                {member.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

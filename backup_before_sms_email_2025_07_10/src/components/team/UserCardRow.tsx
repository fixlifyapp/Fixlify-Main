
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { RoleDropdown } from "@/components/team/RoleDropdown";
import { TeamActionMenu } from "@/components/team/TeamActionMenu";
import { TeamMemberProfile } from "@/types/team-member";
import { useNavigate } from "react-router-dom";

interface UserCardRowProps {
  user: TeamMemberProfile;
}

export const UserCardRow = ({ user }: UserCardRowProps) => {
  const [userStatus, setUserStatus] = useState(user.status);
  const navigate = useNavigate();

  const handleRoleChange = (userId: string, newRole: string) => {
    console.log(`Role changed for user ${userId}: ${newRole}`);
  };

  const handleViewDetails = () => {
    navigate(`/admin/team/${user.id}`);
  };

  return (
    <TableRow key={user.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            {user.role && (
              <div className="text-sm text-muted-foreground capitalize">
                {user.role}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      
      <TableCell>{user.email}</TableCell>
      
      <TableCell>
        <RoleDropdown
          userId={user.id}
          role={user.role}
          onRoleChange={handleRoleChange}
          testMode={true}
        />
      </TableCell>
      
      <TableCell>
        <Badge
          variant="outline"
          className={`capitalize ${
            userStatus === "active"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {userStatus}
        </Badge>
      </TableCell>
      
      <TableCell>
        {user.lastLogin
          ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
          : "Never"}
      </TableCell>
      
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleViewDetails}>
            View
          </Button>
          <TeamActionMenu
            userId={user.id}
            status={userStatus}
            testMode={true}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

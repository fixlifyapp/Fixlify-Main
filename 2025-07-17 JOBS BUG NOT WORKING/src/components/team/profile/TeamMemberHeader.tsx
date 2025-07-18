
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Edit, Save, Check } from "lucide-react";
import { TeamMemberProfile } from "@/types/team-member";
import { RoleDropdown } from "@/components/team/RoleDropdown";
import { useRBAC } from "@/components/auth/RBACProvider";

interface TeamMemberHeaderProps {
  member: TeamMemberProfile;
  isEditing: boolean;
  canEdit: boolean;
  onGoBack: () => void;
  onEdit: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const TeamMemberHeader = ({
  member,
  isEditing,
  canEdit,
  onGoBack,
  onEdit,
  onSave,
  isSaving = false
}: TeamMemberHeaderProps) => {
  const { hasPermission } = useRBAC();
  const [roleChanged, setRoleChanged] = useState(false);

  const canEditRoles = hasPermission("users.roles.assign");
  
  const handleRoleChange = (userId: string, newRole: string) => {
    setRoleChanged(true);
    setTimeout(() => {
      setRoleChanged(false);
    }, 2000);
  };
  
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onGoBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>
                {member.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold">{member.name}</h2>
                {roleChanged && <Check className="h-4 w-4 text-green-500 animate-pulse" />}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">{member.email}</span>
                <div>
                  <RoleDropdown 
                    userId={member.id} 
                    role={member.role}
                    disabled={!canEditRoles}
                    onRoleChange={handleRoleChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex justify-end">
              {isEditing ? (
                <Button onClick={onSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

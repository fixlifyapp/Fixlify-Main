
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRBAC } from "@/components/auth/RBACProvider";
import { UserRole } from "@/components/auth/types";

export const RolePreviewSection = () => {
  const { currentUser, setCurrentUser } = useRBAC();
  
  const handleRoleChange = (value: UserRole) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: value
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Role Preview</h3>
      <p className="text-muted-foreground text-sm">
        Test how the application looks with different roles. This only affects your current session.
      </p>
      
      <div className="bg-fixlyfy/5 p-4 rounded-lg">
        <RadioGroup 
          defaultValue={currentUser?.role}
          onValueChange={(value) => handleRoleChange(value as UserRole)}
          className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="admin" id="r-admin" />
            <Label htmlFor="r-admin">Administrator</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manager" id="r-manager" />
            <Label htmlFor="r-manager">Manager</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dispatcher" id="r-dispatcher" />
            <Label htmlFor="r-dispatcher">Dispatcher</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="technician" id="r-technician" />
            <Label htmlFor="r-technician">Technician</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

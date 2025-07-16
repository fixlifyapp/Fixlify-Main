
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRBAC, PermissionRequired } from "@/components/auth/RBACProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { UserRole } from "@/components/auth/types";

export const SettingsUser = () => {
  const { currentUser, setCurrentUser } = useRBAC();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser?.role || 'technician');
  
  const handleRoleChange = (value: UserRole) => {
    setSelectedRole(value);
    
    // In a real app, this would make an API call to update the user's role
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: value
      });
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Profile Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-32 w-32">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">Change Avatar</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" defaultValue="Tom" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" defaultValue="Cook" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="tom.cook@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="(555) 987-6543" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                defaultValue={currentUser?.role || "technician"}
                onValueChange={(value) => handleRoleChange(value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <PermissionRequired permission="users.roles.assign">
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="dispatcher">Dispatcher</SelectItem>
                  </PermissionRequired>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" defaultValue="05/15/2022" />
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="col-span-1 md:col-span-2"></div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </div>
        <Button variant="outline" className="mt-4">Update Password</Button>
      </div>
      
      <Separator />
      
      <PermissionRequired permission="settings.view">
        <div>
          <h3 className="text-lg font-medium mb-4">Personal Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="notification-email">Notification Email</Label>
              <Input id="notification-email" type="email" defaultValue="tom.cook@example.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calendar-sync">Calendar Integration</Label>
              <Select defaultValue="google">
                <SelectTrigger id="calendar-sync">
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Outlook Calendar</SelectItem>
                  <SelectItem value="apple">Apple Calendar</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PermissionRequired>
      
      <div className="md:col-span-2 space-y-4">
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
      
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-fixlyfy hover:bg-fixlyfy/90">Save Changes</Button>
      </div>
    </div>
  );
};

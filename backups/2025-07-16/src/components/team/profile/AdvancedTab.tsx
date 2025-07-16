import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Copy, ShieldCheck } from "lucide-react";
import { TeamMemberProfile, Permission } from "@/types/team-member";
import { toast } from "sonner";
import { useRBAC } from "@/components/auth/RBACProvider";

// Mock permissions data
const mockPermissions: Permission[] = [
  // Jobs module
  { id: "1", name: "View Jobs", module: "jobs", type: "view", enabled: true },
  { id: "2", name: "Edit Jobs", module: "jobs", type: "edit", enabled: true },
  { id: "3", name: "Create Jobs", module: "jobs", type: "create", enabled: true },
  { id: "4", name: "Delete Jobs", module: "jobs", type: "delete", enabled: false },
  
  // Clients module
  { id: "5", name: "View Clients", module: "clients", type: "view", enabled: true },
  { id: "6", name: "Edit Clients", module: "clients", type: "edit", enabled: true },
  { id: "7", name: "Create Clients", module: "clients", type: "create", enabled: true },
  { id: "8", name: "Delete Clients", module: "clients", type: "delete", enabled: false },
  
  // Estimates/Invoices
  { id: "9", name: "View Estimates", module: "estimates", type: "view", enabled: true },
  { id: "10", name: "Edit Estimates", module: "estimates", type: "edit", enabled: true },
  { id: "11", name: "Create Estimates", module: "estimates", type: "create", enabled: true },
  { id: "12", name: "Delete Estimates", module: "estimates", type: "delete", enabled: false },
  
  // Reports
  { id: "13", name: "View Reports", module: "reports", type: "view", enabled: true },
  { id: "14", name: "Create Reports", module: "reports", type: "create", enabled: false },
  
  // Finance
  { id: "15", name: "View Finance", module: "finance", type: "view", enabled: true },
  { id: "16", name: "Edit Finance", module: "finance", type: "edit", enabled: false },
  
  // Schedule
  { id: "17", name: "View Schedule", module: "schedule", type: "view", enabled: true },
  { id: "18", name: "Edit Schedule", module: "schedule", type: "edit", enabled: true },
  
  // Automation
  { id: "19", name: "View Automation", module: "automation", type: "view", enabled: true },
  { id: "20", name: "Edit Automation", module: "automation", type: "edit", enabled: false },
];

interface AdvancedTabProps {
  member: TeamMemberProfile;
  isEditing: boolean;
}

export const AdvancedTab = ({ member, isEditing }: AdvancedTabProps) => {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [selectedPreset, setSelectedPreset] = useState<string>(member.role);
  const { hasRole } = useRBAC();
  
  const isAdmin = hasRole('admin');
  const modules = Array.from(new Set(permissions.map(p => p.module)));
  
  const handleTogglePermission = (id: string) => {
    if (!isEditing || !isAdmin) return;
    
    setPermissions(permissions.map(permission => 
      permission.id === id 
        ? { ...permission, enabled: !permission.enabled } 
        : permission
    ));
    
    // Clear the preset when custom permissions are set
    setSelectedPreset("custom");
    
    toast.success("Permission updated");
  };
  
  const applyPreset = (preset: string) => {
    if (!isEditing || !isAdmin) return;
    
    // In a real app, this would be replaced with actual preset logic
    // Here we're just simulating it
    let newPermissions = [...permissions];
    
    if (preset === "admin") {
      // Admin gets all permissions
      newPermissions = newPermissions.map(p => ({ ...p, enabled: true }));
    } else if (preset === "manager") {
      // Managers get most permissions except delete and some finance
      newPermissions = newPermissions.map(p => ({
        ...p,
        enabled: !(p.type === "delete" || (p.module === "finance" && p.type === "edit"))
      }));
    } else if (preset === "technician") {
      // Technicians get limited permissions
      newPermissions = newPermissions.map(p => ({
        ...p,
        enabled: (
          p.type === "view" || 
          (p.module === "jobs" && (p.type === "edit" || p.type === "create")) ||
          (p.module === "schedule" && p.type === "edit")
        )
      }));
    } else if (preset === "dispatcher") {
      // Dispatchers focus on scheduling and client management
      newPermissions = newPermissions.map(p => ({
        ...p,
        enabled: (
          p.type === "view" || 
          (p.module === "schedule" && (p.type === "edit" || p.type === "create")) ||
          (p.module === "clients" && p.type !== "delete")
        )
      }));
    }
    
    setPermissions(newPermissions);
    setSelectedPreset(preset);
    
    toast.success(`Applied ${preset.charAt(0).toUpperCase() + preset.slice(1)} permission preset`);
  };
  
  const handleDuplicateRole = () => {
    if (!isEditing || !isAdmin) return;
    
    toast.success("Role duplicated. You can now customize it.");
    setSelectedPreset("custom");
  };
  
  // If user is not admin, show message
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-2">Admin Access Required</h3>
              <p className="text-muted-foreground">
                Only administrators can view and modify permission settings.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="p-6 border-fixlyfy-border shadow-sm">
        <div className="flex items-center mb-6">
          <ShieldCheck className="h-5 w-5 mr-2 text-indigo-500" />
          <h3 className="text-lg font-medium">Permissions & Access Control</h3>
        </div>
        
        <div className="mb-6">
          <Label className="mb-2 block">Role Preset</Label>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedPreset === "admin" ? "default" : "outline"} 
              size="sm"
              onClick={() => applyPreset("admin")}
              disabled={!isEditing}
            >
              Admin
            </Button>
            <Button 
              variant={selectedPreset === "manager" ? "default" : "outline"} 
              size="sm"
              onClick={() => applyPreset("manager")}
              disabled={!isEditing}
            >
              Manager
            </Button>
            <Button 
              variant={selectedPreset === "technician" ? "default" : "outline"} 
              size="sm"
              onClick={() => applyPreset("technician")}
              disabled={!isEditing}
            >
              Technician
            </Button>
            <Button 
              variant={selectedPreset === "dispatcher" ? "default" : "outline"} 
              size="sm"
              onClick={() => applyPreset("dispatcher")}
              disabled={!isEditing}
            >
              Dispatcher
            </Button>
            {selectedPreset === "custom" && (
              <Button 
                variant="default" 
                size="sm"
                disabled
              >
                Custom
              </Button>
            )}
          </div>
          
          {isEditing && (
            <div className="mt-2 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDuplicateRole}
                className="text-xs flex items-center"
              >
                <Copy className="h-3 w-3 mr-1" />
                Duplicate & Customize
              </Button>
            </div>
          )}
        </div>
        
        {modules.map(module => (
          <div key={module} className="mb-6">
            <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-fixlyfy">
              {module.charAt(0).toUpperCase() + module.slice(1)}
            </h4>
            
            <div className="space-y-3 bg-gray-50 p-3 rounded-md">
              {permissions
                .filter(p => p.module === module)
                .map(permission => (
                  <div 
                    key={permission.id} 
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <Label htmlFor={`permission-${permission.id}`} className="font-normal">
                        {permission.name}
                      </Label>
                    </div>
                    <Switch
                      id={`permission-${permission.id}`}
                      checked={permission.enabled}
                      onCheckedChange={() => handleTogglePermission(permission.id)}
                      disabled={!isEditing}
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Changing permissions may impact what this team member can see and do in the system.
          </AlertDescription>
        </Alert>
      </Card>
    </div>
  );
};

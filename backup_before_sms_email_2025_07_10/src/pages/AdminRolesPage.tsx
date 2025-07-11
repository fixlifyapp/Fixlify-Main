
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Users, Settings, Target } from "lucide-react";
import { useRBAC } from "@/components/auth/RBACProvider";

const AdminRolesPage = () => {
  const { hasPermission } = useRBAC();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Sample roles data
  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full access to all features and settings',
      userCount: 2,
      permissions: ['users.create', 'users.delete', 'system.manage']
    },
    {
      id: 'manager',
      name: 'Manager', 
      description: 'Manage jobs, clients, and team members',
      userCount: 5,
      permissions: ['jobs.manage', 'clients.manage', 'users.view']
    },
    {
      id: 'technician',
      name: 'Technician',
      description: 'View and update assigned jobs',
      userCount: 12,
      permissions: ['jobs.view', 'jobs.update']
    }
  ];

  if (!hasPermission('users.roles.manage')) {
    return (
      <PageLayout>
        <PageHeader
          title="Role Management"
          subtitle="Manage user roles and permissions across your organization"
          icon={Shield}
          badges={[
            { text: "Access Control", icon: Shield, variant: "fixlyfy" },
            { text: "User Management", icon: Users, variant: "success" },
            { text: "Security", icon: Target, variant: "info" }
          ]}
        />
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to manage roles.
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Role Management"
        subtitle="Manage user roles and permissions across your organization"
        icon={Shield}
        badges={[
          { text: "Access Control", icon: Shield, variant: "fixlyfy" },
          { text: "User Management", icon: Users, variant: "success" },
          { text: "Security", icon: Target, variant: "info" }
        ]}
        actionButton={{
          text: "Create Role",
          icon: Plus,
          onClick: () => {}
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Roles Overview</CardTitle>
              <CardDescription>
                Manage roles and their associated permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div 
                    key={role.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRole === role.id 
                        ? 'border-fixlyfy bg-fixlyfy/5' 
                        : 'border-border hover:border-fixlyfy/50'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{role.name}</h3>
                      <Badge variant="outline">
                        {role.userCount} users
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {role.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Role Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRole ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure permissions and settings for the selected role.
                  </p>
                  <Button className="w-full" variant="outline">
                    Edit Permissions
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a role to view and edit its details.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Assign Users
              </Button>
              <Button variant="outline" className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Audit Permissions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminRolesPage;

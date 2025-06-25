import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User, UserRole, DEFAULT_PERMISSIONS } from './types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

interface RBACContextType {
  currentUser: User | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  userRole: UserRole | null;
  setCurrentUser: (user: User | null) => void;
  allRoles: UserRole[];
  customRoles: CustomRole[];
  createCustomRole: (name: string, description: string, permissions: string[]) => Promise<boolean>;
  updateCustomRole: (id: string, name: string, description: string, permissions: string[]) => Promise<boolean>;
  deleteCustomRole: (id: string) => Promise<boolean>;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  
  const fetchCustomRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching custom roles:", error);
      } else {
        const mappedRoles = (data || []).map(role => ({
          id: role.id,
          name: role.name,
          description: role.description || '',
          permissions: Array.isArray(role.permissions) 
            ? role.permissions.filter((p): p is string => typeof p === 'string')
            : []
        }));
        setCustomRoles(mappedRoles);
      }
    } catch (error) {
      console.error("Error in fetchCustomRoles:", error);
    }
  };
  
  useEffect(() => {
    // Fetch the current authenticated user from Supabase
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user profile data with custom role information
          const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
              *,
              custom_role:custom_roles(id, name, description, permissions)
            `)
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user profile:", error);
            console.warn("Profile not found - this should be created by the database trigger");
            setCurrentUser(null);
          } else if (profile) {
            // Set the current user from profile data
            setCurrentUser({
              id: profile.id,
              name: profile.name || session.user.email?.split('@')[0] || 'User',
              email: profile.email || session.user.email || 'unknown@example.com',
              role: (profile.role as UserRole) || 'technician',
              avatar: profile.avatar_url || "https://github.com/shadcn.png",
              customRole: profile.custom_role ? {
                id: profile.custom_role.id,
                name: profile.custom_role.name,
                description: profile.custom_role.description,
                permissions: Array.isArray(profile.custom_role.permissions) 
                  ? profile.custom_role.permissions.filter((p): p is string => typeof p === 'string')
                  : []
              } : undefined
            });
          }
          
          // Fetch custom roles for the current user
          await fetchCustomRoles();
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error in RBAC provider:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchCurrentUser();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced permission check that properly handles wildcards, granular permissions, and custom roles
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role;
    let rolePermissions = DEFAULT_PERMISSIONS[userRole] || [];
    
    // If user has a custom role, use its permissions instead
    if (currentUser.customRole) {
      rolePermissions = currentUser.customRole.permissions;
    }
    
    // Admin has all permissions
    if (rolePermissions.includes('*')) return true;
    
    // Check if the user has the specific permission
    if (rolePermissions.includes(permission)) return true;
    
    // Check for broader permissions (e.g., 'jobs.view.all' covers 'jobs.view.assigned')
    const permissionParts = permission.split('.');
    if (permissionParts.length > 2) {
      const broaderPermission = permissionParts.slice(0, -1).join('.') + '.all';
      if (rolePermissions.includes(broaderPermission)) return true;
    }
    
    // Check for category-level permissions
    if (permissionParts.length > 1) {
      const categoryPermission = permissionParts[0] + '.*';
      if (rolePermissions.includes(categoryPermission)) return true;
    }
    
    return false;
  };

  // Function to check if user has a specific role or one of multiple roles
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;
    
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    
    return currentUser.role === role;
  };

  // Custom role management functions
  const createCustomRole = async (name: string, description: string, permissions: string[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('custom_roles')
        .insert({
          name,
          description,
          permissions,
          created_by: currentUser?.id
        });

      if (error) {
        toast.error('Failed to create custom role');
        return false;
      }

      await fetchCustomRoles();
      toast.success('Custom role created successfully');
      return true;
    } catch (error) {
      console.error('Error creating custom role:', error);
      toast.error('Failed to create custom role');
      return false;
    }
  };

  const updateCustomRole = async (id: string, name: string, description: string, permissions: string[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('custom_roles')
        .update({
          name,
          description,
          permissions
        })
        .eq('id', id);

      if (error) {
        toast.error('Failed to update custom role');
        return false;
      }

      await fetchCustomRoles();
      toast.success('Custom role updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating custom role:', error);
      toast.error('Failed to update custom role');
      return false;
    }
  };

  const deleteCustomRole = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete custom role');
        return false;
      }

      await fetchCustomRoles();
      toast.success('Custom role deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting custom role:', error);
      toast.error('Failed to delete custom role');
      return false;
    }
  };

  // Get all available roles from DEFAULT_PERMISSIONS
  const defaultRoleKeys = Object.keys(DEFAULT_PERMISSIONS) as UserRole[] || [];
  const allRoles: UserRole[] = defaultRoleKeys;

  const value = {
    currentUser,
    loading,
    hasPermission,
    hasRole,
    userRole: currentUser?.role || null,
    setCurrentUser,
    allRoles,
    customRoles,
    createCustomRole,
    updateCustomRole,
    deleteCustomRole,
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within a RBACProvider');
  }
  return context;
};

// Helper components for permission-based rendering
export const PermissionRequired = ({ 
  permission, 
  fallback = null,
  children 
}: { 
  permission: string; 
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { hasPermission } = useRBAC();
  
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
};

export const RoleRequired = ({ 
  role, 
  fallback = null,
  children 
}: { 
  role: UserRole | UserRole[]; 
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { hasRole } = useRBAC();
  
  const hasAccess = hasRole(role);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Component for testing pre-Supabase functionality
export const TestModeIndicator = () => {
  return process.env.NODE_ENV === 'development' ? (
    <div className="fixed bottom-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-medium m-2 rounded-full">
      Development Mode
    </div>
  ) : null;
};

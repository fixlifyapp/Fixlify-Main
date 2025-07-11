# Fixlify Code Patterns Library

## 📦 Component Patterns

### Basic Component Pattern
```typescript
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ComponentNameProps {
  id: string;
  onSuccess?: () => void;
}

export const ComponentName = ({ id, onSuccess }: ComponentNameProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      // Action logic here
      toast.success('Operation completed successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error in ComponentName:', error);
      toast.error('Failed to complete operation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAction} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Action'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### List Component with Selection
```typescript
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface ListItem {
  id: string;
  name: string;
}

interface SelectableListProps {
  items: ListItem[];
  onBulkAction?: (selectedIds: string[]) => void;
}

export const SelectableList = ({ items, onBulkAction }: SelectableListProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? items.map(item => item.id) : []);
  };
  
  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    );
  };
  
  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
        />
        <span>Select All ({items.length})</span>
      </div>
      
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox
              checked={selectedItems.includes(item.id)}
              onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
            />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
      
      {selectedItems.length > 0 && (
        <Button 
          onClick={() => onBulkAction?.(selectedItems)}
          className="mt-4"
        >
          Perform Bulk Action ({selectedItems.length})
        </Button>
      )}
    </div>
  );
};
```

### Modal/Dialog Pattern
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ModalComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export const ModalComponent = ({ open, onOpenChange, onConfirm }: ModalComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Modal content */}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## 🪝 Hook Patterns

### Data Fetching Hook
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useClients = (page = 1, pageSize = 10) => {
  const queryClient = useQueryClient();
  
  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        clients: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    }
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newClient: any) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created successfully');
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
    }
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client updated successfully');
    }
  });
  
  return {
    clients: data?.clients || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending
  };
};
```

### Form Hook Pattern
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'lead'])
});

type FormData = z.infer<typeof formSchema>;

export const useClientForm = (defaultValues?: Partial<FormData>) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      status: 'active',
      ...defaultValues
    }
  });
  
  const handleSubmit = async (data: FormData) => {
    try {
      // Submit logic
      console.log('Form data:', data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };
  
  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: form.formState.isSubmitting
  };
};
```

## 🗄️ Supabase Patterns

### Basic Query Pattern
```typescript
// Simple select
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('organization_id', organizationId)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Query error:', error);
  throw error;
}

// Select with joins
const { data, error } = await supabase
  .from('jobs')
  .select(`
    *,
    clients (
      id,
      name,
      email
    ),
    invoices (
      id,
      total,
      status
    )
  `)
  .eq('id', jobId)
  .maybeSingle();
```

### Safe Single Query Pattern
```typescript
// Instead of .single() which throws on no results
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('id', clientId)
  .maybeSingle();

if (error) {
  console.error('Error fetching client:', error);
  return null;
}

if (!data) {
  console.log('Client not found');
  return null;
}

return data;
```

### Upsert Pattern
```typescript
const { data, error } = await supabase
  .from('settings')
  .upsert(
    {
      user_id: userId,
      key: 'theme',
      value: 'dark',
      updated_at: new Date().toISOString()
    },
    {
      onConflict: 'user_id,key'
    }
  )
  .select()
  .single();
```

### Real-time Subscription Pattern
```typescript
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `organization_id=eq.${organizationId}`
      },
      (payload) => {
        console.log('Change received:', payload);
        refetch();
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [organizationId, refetch]);
```

## 🎨 UI Patterns

### Responsive Grid Pattern
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

### Mobile-First Spacing
```typescript
// Padding
className="p-4 sm:p-6 lg:p-8"

// Margin
className="mt-4 sm:mt-6 lg:mt-8"

// Text size
className="text-sm sm:text-base lg:text-lg"

// Flex direction
className="flex flex-col sm:flex-row"
```

### Status Badge Pattern
```typescript
const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: { 
      label: 'Active', 
      className: 'bg-green-100 text-green-800 border-green-200' 
    },
    inactive: { 
      label: 'Inactive', 
      className: 'bg-gray-100 text-gray-800 border-gray-200' 
    },
    pending: { 
      label: 'Pending', 
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
    }
  };
  
  const config = statusConfig[status] || statusConfig.inactive;
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};
```

### Loading State Pattern
```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

if (error) {
  return (
    <div className="text-center py-8">
      <p className="text-red-500">Error loading data</p>
      <Button onClick={refetch} className="mt-4">
        Retry
      </Button>
    </div>
  );
}

if (!data || data.length === 0) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">No data found</p>
    </div>
  );
}
```

## 🔐 Auth Patterns

### Protected Route Pattern
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

### Permission Check Pattern
```typescript
const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };
  
  const hasRole = (role: string) => {
    return user?.role === role;
  };
  
  return { hasPermission, hasRole };
};

// Usage
const { hasPermission } = usePermissions();

if (!hasPermission('edit_clients')) {
  return <div>You don't have permission to edit clients</div>;
}
```

## 🧪 Testing Patterns

### Debug Pattern
```typescript
// Development only debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', {
    state,
    props,
    data
  });
}

// Conditional debug based on localStorage
const DEBUG = localStorage.getItem('debug') === 'true';
if (DEBUG) {
  console.log('Debug mode active');
}
```

### Error Boundary Pattern
```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    
    return this.props.children;
  }
}
```

---

*These patterns represent proven solutions used throughout the Fixlify codebase. Always prefer these patterns over creating new ones unless absolutely necessary.*
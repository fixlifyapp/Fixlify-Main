---
name: feature-builder
description: Feature scaffolding and implementation skill for Fixlify. Automatically activates when building new features, creating components, adding pages, or implementing user stories. Follows Fixlify architecture patterns and best practices.
version: 1.0.0
author: Fixlify Team
tags: [feature, scaffolding, components, architecture, react, typescript]
---

# Feature Builder Skill

You are a senior full-stack developer building new features for Fixlify following established patterns and best practices.

## Feature Development Workflow

```
1. 📋 Requirements Analysis
   └── Understand user story and acceptance criteria

2. 🏗️ Architecture Design
   └── Plan components, hooks, types, and API

3. 📊 Database Schema (if needed)
   └── Create migration with RLS policies

4. 🔧 Backend Implementation
   └── Edge functions, API endpoints

5. 🎨 Frontend Implementation
   └── Components, pages, hooks

6. ✅ Testing
   └── Unit tests, integration tests

7. 📝 Documentation
   └── Update CLAUDE.md if needed
```

## Component Architecture

### File Structure for New Feature
```
src/
├── components/
│   └── feature-name/
│       ├── FeatureName.tsx           # Main component
│       ├── FeatureNameList.tsx       # List view
│       ├── FeatureNameCard.tsx       # Card component
│       ├── FeatureNameDialog.tsx     # Modal/dialog
│       ├── FeatureNameForm.tsx       # Form component
│       └── components/               # Sub-components
│           ├── FeatureNameHeader.tsx
│           └── FeatureNameActions.tsx
├── hooks/
│   └── useFeatureName.ts             # Custom hook
├── types/
│   └── feature-name.ts               # TypeScript types
└── pages/
    └── FeatureNamePage.tsx           # Page component
```

## Component Templates

### Main Component
```typescript
import { useState } from 'react';
import { useFeatureName } from '@/hooks/useFeatureName';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';

export function FeatureName() {
  const { data, isLoading, error } = useFeatureName();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        Error loading data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Feature Name</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((item) => (
          <FeatureNameCard key={item.id} item={item} />
        ))}
      </div>

      <FeatureNameDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
```

### Custom Hook
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/use-organization';
import { useToast } from '@/hooks/use-toast';
import type { FeatureNameType } from '@/types/feature-name';

export function useFeatureName() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['feature-name', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('feature_name')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FeatureNameType[];
    },
    enabled: !!organization?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (newItem: Partial<FeatureNameType>) => {
      const { data, error } = await supabase
        .from('feature_name')
        .insert({
          ...newItem,
          organization_id: organization?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-name'] });
      toast({
        title: 'Success',
        description: 'Item created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeatureNameType> & { id: string }) => {
      const { data, error } = await supabase
        .from('feature_name')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-name'] });
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feature_name')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-name'] });
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    ...query,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

### Form Component (with react-hook-form + zod)
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface FeatureNameFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

export function FeatureNameForm({
  defaultValues,
  onSubmit,
  isLoading,
}: FeatureNameFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
```

### Dialog Component
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FeatureNameForm } from './FeatureNameForm';
import { useFeatureName } from '@/hooks/useFeatureName';

interface FeatureNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: FeatureNameType | null;
}

export function FeatureNameDialog({
  open,
  onOpenChange,
  editItem,
}: FeatureNameDialogProps) {
  const { create, update, isCreating, isUpdating } = useFeatureName();

  const handleSubmit = (values: FormValues) => {
    if (editItem) {
      update({ id: editItem.id, ...values });
    } else {
      create(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editItem ? 'Edit Item' : 'Create New Item'}
          </DialogTitle>
          <DialogDescription>
            {editItem
              ? 'Update the item details below.'
              : 'Fill in the details to create a new item.'}
          </DialogDescription>
        </DialogHeader>

        <FeatureNameForm
          defaultValues={editItem ?? undefined}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### TypeScript Types
```typescript
// src/types/feature-name.ts

export interface FeatureNameType {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface FeatureNameCreateInput {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface FeatureNameUpdateInput {
  id: string;
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
}
```

## Database Migration Template

```sql
-- Migration: YYYYMMDDHHMMSS_create_feature_name_table
-- Author: [name]
-- Description: Create feature_name table for [purpose]

-- Create table
CREATE TABLE IF NOT EXISTS feature_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feature_name_org ON feature_name(organization_id);
CREATE INDEX IF NOT EXISTS idx_feature_name_status ON feature_name(organization_id, status);

-- Enable RLS
ALTER TABLE feature_name ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "org_isolation_select" ON feature_name
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "org_isolation_insert" ON feature_name
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "org_isolation_update" ON feature_name
  FOR UPDATE USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "org_isolation_delete" ON feature_name
  FOR DELETE USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Update trigger
CREATE TRIGGER update_feature_name_updated_at
  BEFORE UPDATE ON feature_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Page Component Template

```typescript
import { FeatureName } from '@/components/feature-name/FeatureName';
import PageLayout from '@/components/layout/PageLayout';

export default function FeatureNamePage() {
  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <FeatureName />
      </div>
    </PageLayout>
  );
}
```

## Route Configuration

```typescript
// Add to src/App.tsx or routes config
import { lazy } from 'react';

const FeatureNamePage = lazy(() => import('@/pages/FeatureNamePage'));

// In routes array:
{
  path: '/feature-name',
  element: <FeatureNamePage />,
}
```

## Checklist Before Marking Complete

- [ ] TypeScript compiles without errors
- [ ] Component renders correctly
- [ ] Form validation works
- [ ] CRUD operations work
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Responsive design verified
- [ ] RLS policies tested
- [ ] Organization isolation verified
- [ ] Unit tests written

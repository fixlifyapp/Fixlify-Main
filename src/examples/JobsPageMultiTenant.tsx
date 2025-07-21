import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';

const JobsPageMultiTenant = () => {
  return (
    <div className="p-6">
      <PageHeader 
        title="Multi-Tenant Jobs" 
        description="Example of multi-tenant job management"
      />
      
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Jobs List</h2>
        <p className="text-muted-foreground">
          Multi-tenant jobs implementation placeholder
        </p>
      </div>
    </div>
  );
};

export default JobsPageMultiTenant;
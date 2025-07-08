
import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConnectCenter: React.FC = () => {
  return (
    <div className="p-6">
      <PageHeader
        title="Connect Center"
        subtitle="Manage your integrations and connections"
        icon={Settings}
        actions={
          <Button>
            Add Integration
          </Button>
        }
      />
      <div className="mt-6">
        <p>Connect Center content goes here...</p>
      </div>
    </div>
  );
};

export default ConnectCenter;

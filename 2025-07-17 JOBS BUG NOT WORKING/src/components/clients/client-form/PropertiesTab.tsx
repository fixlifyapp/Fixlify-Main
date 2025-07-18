
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClientProperties } from "./hooks/useClientProperties";
import { EmptyTabContent } from "./EmptyTabContent";
import { PropertyCreateDialog } from "./PropertyCreateDialog";
import { Loader, Home, MapPin, CalendarDays, Plus } from "lucide-react";

interface PropertiesTabProps {
  clientId?: string;
}

export const PropertiesTab = ({ clientId }: PropertiesTabProps) => {
  const { properties, isLoading, refetch } = useClientProperties(clientId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateProperty = () => {
    setIsCreateDialogOpen(true);
  };

  const handlePropertyCreated = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size={32} className="animate-spin text-fixlyfy mr-2" />
        <span>Loading properties...</span>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <>
        <EmptyTabContent 
          message="No properties found for this client."
          actionLabel="Add Property"
          onAction={handleCreateProperty}
        />
        {clientId && (
          <PropertyCreateDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            clientId={clientId}
            onPropertyCreated={handlePropertyCreated}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Properties</h3>
          <Button onClick={handleCreateProperty} size="sm">
            <Plus size={16} className="mr-2" />
            Add Property
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map(property => (
            <Card key={property.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-md bg-fixlyfy/10 flex items-center justify-center mr-3">
                    <Home size={20} className="text-fixlyfy" />
                  </div>
                  <div>
                    <h3 className="font-medium">{property.type || 'Property'}</h3>
                    <p className="text-fixlyfy-text-secondary text-sm">{property.address}</p>
                    <p className="text-fixlyfy-text-secondary text-sm">
                      {property.city}, {property.state} {property.zip}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  <MapPin size={14} className="mr-1" />
                  View
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t flex items-center text-sm text-fixlyfy-text-secondary">
                <CalendarDays size={14} className="mr-2" />
                Last service: {property.lastService || 'Not available'}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {clientId && (
        <PropertyCreateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          clientId={clientId}
          onPropertyCreated={handlePropertyCreated}
        />
      )}
    </>
  );
};

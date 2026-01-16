import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnifiedJobTypeSelector } from "@/components/shared/UnifiedJobTypeSelector";
import { FormData } from "./useScheduleJobForm";
import { PropertyQuickAdd } from "./PropertyQuickAdd";
import { MapPin, Home, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobInformationSectionProps {
  formData: FormData;
  clients: any[];
  clientsLoading: boolean;
  clientProperties: any[];
  propertiesLoading: boolean;
  jobTypes: any[];
  jobTypesLoading: boolean;
  leadSources: any[];
  leadSourcesLoading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string) => (value: string) => void;
  onPropertyCreated?: (property: any) => void;
}

export const JobInformationSection = ({
  formData,
  clients,
  clientsLoading,
  clientProperties,
  propertiesLoading,
  jobTypes,
  jobTypesLoading,
  leadSources,
  leadSourcesLoading,
  handleChange,
  handleSelectChange,
  onPropertyCreated,
}: JobInformationSectionProps) => {
  const selectedClient = clients.find(c => c.id === formData.client_id);
  const selectedProperty = clientProperties.find(p => p.id === formData.property_id);

  // Format address for display
  const formatAddress = (property: any) => {
    if (!property) return '';
    const parts = [property.address, property.city, property.state, property.zip].filter(Boolean);
    return parts.join(', ');
  };

  // Handle quick property creation
  const handlePropertyCreated = (property: any) => {
    // Auto-select the newly created property
    handleSelectChange("property_id")(property.id);
    // Notify parent if callback provided
    onPropertyCreated?.(property);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Client Selection */}
        <div className="col-span-2">
          <Label htmlFor="client_id">Client *</Label>
          <Select onValueChange={handleSelectChange("client_id")} value={formData.client_id}>
            <SelectTrigger id="client_id">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clientsLoading ? (
                <SelectItem value="loading" disabled>Loading clients...</SelectItem>
              ) : (
                clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex flex-col">
                      <span>{client.name}</span>
                      {!client.phone && (
                        <span className="text-xs text-red-500">No phone number</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formData.client_id && !selectedClient?.phone && (
            <p className="text-sm text-red-600 mt-1">
              This client has no phone number. Please add one for messaging.
            </p>
          )}
        </div>

        {/* Property Selection - Always show when client is selected */}
        {formData.client_id && (
          <div className="col-span-2">
            <Label htmlFor="property_id" className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Service Location
            </Label>
            <div className="flex gap-2">
              <Select
                onValueChange={handleSelectChange("property_id")}
                value={formData.property_id}
              >
                <SelectTrigger id="property_id" className="flex-1">
                  <SelectValue placeholder={
                    clientProperties.length === 0
                      ? "No properties - add one"
                      : "Select property location"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {propertiesLoading ? (
                    <SelectItem value="loading" disabled>Loading properties...</SelectItem>
                  ) : clientProperties.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No properties yet. Click + to add.
                    </SelectItem>
                  ) : (
                    clientProperties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        <div className="flex items-start gap-2">
                          {property.property_type === 'Residential' ? (
                            <Home className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          ) : (
                            <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{property.property_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatAddress(property)}
                            </span>
                            {property.latitude && property.longitude && (
                              <span className="text-xs text-green-600">Geocoded</span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Quick Add Property Button */}
              <PropertyQuickAdd
                clientId={formData.client_id}
                onPropertyCreated={handlePropertyCreated}
                disabled={!formData.client_id}
              />
            </div>

            {/* Selected Property Preview */}
            {selectedProperty && (
              <div className={cn(
                "mt-2 p-3 rounded-lg border bg-muted/50",
                selectedProperty.latitude && selectedProperty.longitude
                  ? "border-green-200 bg-green-50/50"
                  : "border-amber-200 bg-amber-50/50"
              )}>
                <div className="flex items-start gap-2">
                  <MapPin className={cn(
                    "h-4 w-4 mt-0.5 shrink-0",
                    selectedProperty.latitude ? "text-green-600" : "text-amber-600"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{selectedProperty.property_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatAddress(selectedProperty)}
                    </p>
                    {selectedProperty.tenant_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tenant: {selectedProperty.tenant_name}
                      </p>
                    )}
                    {!selectedProperty.latitude && (
                      <p className="text-xs text-amber-600 mt-1">
                        Address not geocoded - Map View will estimate location
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No properties hint */}
            {formData.client_id && clientProperties.length === 0 && !propertiesLoading && (
              <p className="text-xs text-muted-foreground mt-2">
                Click the + button to add a service location for this client
              </p>
            )}
          </div>
        )}

        <div className="col-span-2">
          <Label htmlFor="description">Job Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the job details..."
            rows={3}
          />
        </div>

        <UnifiedJobTypeSelector
          value={formData.job_type}
          onValueChange={handleSelectChange("job_type")}
          jobTypes={jobTypes}
          isLoading={jobTypesLoading}
          required={true}
          className="w-full"
        />

        <div>
          <Label htmlFor="lead_source">Lead Source</Label>
          <Select onValueChange={handleSelectChange("lead_source")} value={formData.lead_source}>
            <SelectTrigger id="lead_source">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {leadSourcesLoading ? (
                <SelectItem value="loading" disabled>Loading sources...</SelectItem>
              ) : (
                leadSources
                  .filter(source => source.is_active)
                  .map(source => (
                    <SelectItem key={source.id} value={source.name}>{source.name}</SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

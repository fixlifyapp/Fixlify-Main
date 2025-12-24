import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UnifiedJobTypeSelector } from "@/components/shared/UnifiedJobTypeSelector";
import { FormData } from "./useScheduleJobForm";
import { ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobInformationSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
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
}

export const JobInformationSection = ({
  formData,
  setFormData,
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
}: JobInformationSectionProps) => {
  const selectedClient = clients.find(c => c.id === formData.client_id);
  const selectedProperty = clientProperties.find(p => p.id === formData.property_id);
  const [tenantSectionOpen, setTenantSectionOpen] = useState(false);

  // Auto-expand tenant section for commercial/landlord clients
  useEffect(() => {
    const clientType = selectedClient?.type;
    if (clientType === 'commercial' || clientType === 'landlord') {
      setTenantSectionOpen(true);
    }
  }, [selectedClient?.type]);

  // Auto-populate tenant info when property is selected
  useEffect(() => {
    if (selectedProperty) {
      setFormData(prev => ({
        ...prev,
        tenant_name: selectedProperty.tenant_name || '',
        tenant_phone: selectedProperty.tenant_phone || '',
        tenant_email: selectedProperty.tenant_email || '',
      }));
      // Open tenant section if property has tenant info
      if (selectedProperty.tenant_name || selectedProperty.tenant_phone) {
        setTenantSectionOpen(true);
      }
    }
  }, [selectedProperty, setFormData]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Job Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
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
                        <span className="text-xs text-red-500">⚠️ No phone number</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formData.client_id && !selectedClient?.phone && (
            <p className="text-sm text-red-600 mt-1">
              ⚠️ This client has no phone number. Please add one for messaging and communication.
            </p>
          )}
        </div>

        {/* Property Selection - Show only when client has multiple properties */}
        {formData.client_id && clientProperties.length > 1 && (
          <div className="col-span-2">
            <Label htmlFor="property_id">Property Location</Label>
            <Select onValueChange={handleSelectChange("property_id")} value={formData.property_id}>
              <SelectTrigger id="property_id">
                <SelectValue placeholder="Select property location" />
              </SelectTrigger>
              <SelectContent>
                {propertiesLoading ? (
                  <SelectItem value="loading" disabled>Loading properties...</SelectItem>
                ) : (
                  clientProperties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{property.property_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {property.address}, {property.city}, {property.state}
                        </span>
                        {property.tenant_name && (
                          <span className="text-xs text-muted-foreground">
                            Tenant: {property.tenant_name}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tenant Contact Section - Collapsible */}
        {formData.client_id && (
          <div className="col-span-2">
            <Collapsible open={tenantSectionOpen} onOpenChange={setTenantSectionOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Tenant Contact</span>
                    <span className="text-xs text-muted-foreground">(for access)</span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    tenantSectionOpen && "rotate-180"
                  )} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Contact info for the person at the property (for scheduling access)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="tenant_name">Tenant Name</Label>
                      <Input
                        id="tenant_name"
                        value={formData.tenant_name}
                        onChange={handleChange}
                        placeholder="Name of tenant/occupant"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tenant_phone">Tenant Phone</Label>
                      <Input
                        id="tenant_phone"
                        value={formData.tenant_phone}
                        onChange={handleChange}
                        placeholder="Phone for access"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tenant_email">Tenant Email</Label>
                    <Input
                      id="tenant_email"
                      type="email"
                      value={formData.tenant_email}
                      onChange={handleChange}
                      placeholder="tenant@email.com"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
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
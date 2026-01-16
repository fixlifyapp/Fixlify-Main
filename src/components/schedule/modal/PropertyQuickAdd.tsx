// Property Quick Add - Inline form for adding new property during job creation
// Appears when clicking "+" button next to property dropdown

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, MapPin, Home, Building2, Factory, Store, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AddressAutocomplete, type AddressData } from '@/components/shared/AddressAutocomplete';
import { toast } from 'sonner';

interface PropertyQuickAddProps {
  clientId: string;
  onPropertyCreated: (property: {
    id: string;
    property_name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  disabled?: boolean;
}

const PROPERTY_TYPES = [
  { value: 'Residential', label: 'Residential', icon: Home },
  { value: 'Commercial', label: 'Commercial', icon: Building2 },
  { value: 'Industrial', label: 'Industrial', icon: Factory },
  { value: 'Retail', label: 'Retail', icon: Store },
  { value: 'Office', label: 'Office', icon: Building },
  { value: 'Other', label: 'Other', icon: MapPin },
];

export function PropertyQuickAdd({ clientId, onPropertyCreated, disabled }: PropertyQuickAddProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [addressData, setAddressData] = useState<AddressData | null>(null);

  const handleAddressSelect = (data: AddressData) => {
    setAddressData(data);
    // Auto-generate property name from address if empty
    if (!propertyName && data.address) {
      setPropertyName(data.address);
    }
  };

  const handleSubmit = async () => {
    if (!addressData?.address) {
      toast.error('Please select an address');
      return;
    }

    setLoading(true);

    try {
      const propertyData = {
        client_id: clientId,
        property_name: propertyName || addressData.address,
        property_type: propertyType,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        zip: addressData.zip,
        country: addressData.country,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        formatted_address: addressData.formatted_address,
        geocoded_at: addressData.latitude ? new Date().toISOString() : null,
        is_primary: false,
      };

      const { data, error } = await supabase
        .from('client_properties')
        .insert(propertyData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Property added successfully');

      onPropertyCreated({
        id: data.id,
        property_name: data.property_name,
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        latitude: data.latitude,
        longitude: data.longitude,
      });

      // Reset form
      setPropertyName('');
      setPropertyType('Residential');
      setAddressData(null);
      setOpen(false);
    } catch (error: any) {
      console.error('Failed to create property:', error);
      toast.error(error.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || !clientId}
          className="shrink-0"
          title="Add new property"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Add New Property</h4>
            <p className="text-xs text-muted-foreground">
              Quickly add a new service location for this client
            </p>
          </div>

          {/* Address Autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <AddressAutocomplete
              placeholder="Search for address..."
              onSelect={handleAddressSelect}
              autoGeocode
            />
            {addressData?.formatted_address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {addressData.formatted_address}
              </p>
            )}
          </div>

          {/* Property Name */}
          <div className="space-y-2">
            <Label htmlFor="property_name">Property Name</Label>
            <Input
              id="property_name"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="e.g., Main Office, Unit 2A"
            />
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="property_type">Property Type</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={loading || !addressData?.address}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default PropertyQuickAdd;

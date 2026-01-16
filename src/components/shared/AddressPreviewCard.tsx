// Address Preview Card - Visual confirmation of selected address with geocode indicator
// Used in client creation and property forms to show selected address

import * as React from 'react';
import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AddressPreviewData {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  formatted_address?: string;
  latitude?: number;
  longitude?: number;
}

interface AddressPreviewCardProps {
  address: AddressPreviewData;
  showGeocodeStatus?: boolean;
  className?: string;
  compact?: boolean;
}

export function AddressPreviewCard({
  address,
  showGeocodeStatus = true,
  className,
  compact = false,
}: AddressPreviewCardProps) {
  const isGeocoded = !!(address.latitude && address.longitude);

  // Format address for display
  const formatAddress = () => {
    if (address.formatted_address) {
      return address.formatted_address;
    }
    const parts = [
      address.address,
      address.city,
      address.state,
      address.zip,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const displayAddress = formatAddress();

  if (!displayAddress) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm",
        className
      )}>
        <MapPin className={cn(
          "h-4 w-4 shrink-0",
          isGeocoded ? "text-green-600" : "text-amber-600"
        )} />
        <span className="truncate text-muted-foreground">{displayAddress}</span>
        {showGeocodeStatus && isGeocoded && (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border p-3",
      isGeocoded
        ? "border-green-200 bg-green-50/50"
        : "border-amber-200 bg-amber-50/50",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-full p-2",
          isGeocoded ? "bg-green-100" : "bg-amber-100"
        )}>
          <MapPin className={cn(
            "h-4 w-4",
            isGeocoded ? "text-green-600" : "text-amber-600"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-foreground">
              {address.address || 'Address'}
            </p>
            {showGeocodeStatus && (
              isGeocoded ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  Not verified
                </span>
              )
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {[address.city, address.state, address.zip].filter(Boolean).join(', ')}
          </p>
          {address.country && address.country !== 'CA' && address.country !== 'Canada' && (
            <p className="text-xs text-muted-foreground">{address.country}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddressPreviewCard;

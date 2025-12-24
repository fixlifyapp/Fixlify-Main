import { useState } from "react";
import { ChevronDown, MapPin, Plus, Home, Building2, Star, ExternalLink, User, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Property {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  property_type?: string;
  is_primary?: boolean;
  notes?: string;
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
}

interface PropertiesCardProps {
  properties: Property[];
  onAddProperty?: () => void;
  onSetPrimary?: (propertyId: string) => void;
}

const getPropertyIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'commercial':
      return Building2;
    case 'residential':
    default:
      return Home;
  }
};

export const PropertiesCard = ({ properties, onAddProperty, onSetPrimary }: PropertiesCardProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const formatAddress = (property: Property) => {
    const parts = [
      property.address,
      property.city,
      property.state,
      property.zip
    ].filter(Boolean);
    return parts.join(', ');
  };

  const openInMaps = (property: Property) => {
    const address = formatAddress(property);
    if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-3 flex items-center justify-between border-b border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-foreground">Properties</h3>
              <Badge variant="secondary" className="text-xs">
                {properties.length}
              </Badge>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {properties.length > 0 ? (
            <div className="p-3 space-y-2">
              {properties.map((property) => {
                const Icon = getPropertyIcon(property.property_type);
                const address = formatAddress(property);

                return (
                  <div
                    key={property.id}
                    className={cn(
                      "rounded-lg border p-3 transition-all hover:shadow-sm",
                      property.is_primary
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/50 bg-card hover:border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "shrink-0 rounded-lg p-2",
                        property.is_primary ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "h-4 w-4",
                          property.is_primary ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          {property.name && (
                            <p className="text-sm font-medium text-foreground truncate">
                              {property.name}
                            </p>
                          )}
                          {property.is_primary && (
                            <Badge variant="outline" className="shrink-0 text-xs bg-primary/10 text-primary border-primary/30">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>

                        {address && (
                          <p className="text-sm text-muted-foreground">
                            {property.address}
                          </p>
                        )}

                        {(property.city || property.state || property.zip) && (
                          <p className="text-xs text-muted-foreground/70">
                            {[property.city, property.state, property.zip].filter(Boolean).join(', ')}
                          </p>
                        )}

                        {/* Tenant Info */}
                        {property.tenant_name && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <User className="h-3 w-3" />
                            <span>Tenant: {property.tenant_name}</span>
                            {property.tenant_phone && (
                              <>
                                <Phone className="h-3 w-3 ml-1" />
                                <span>{property.tenant_phone}</span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          {property.property_type && (
                            <Badge variant="secondary" className="text-xs capitalize">
                              {property.property_type}
                            </Badge>
                          )}
                          {address && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => openInMaps(property)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Maps
                            </Button>
                          )}
                          {/* Set as Primary Button - only show for non-primary properties */}
                          {!property.is_primary && onSetPrimary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                              onClick={() => onSetPrimary(property.id)}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Set Primary
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No properties added</p>
            </div>
          )}

          {/* Add Property Button */}
          <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={onAddProperty}
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

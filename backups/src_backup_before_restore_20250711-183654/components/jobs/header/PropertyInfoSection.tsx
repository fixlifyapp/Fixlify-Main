
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home, Building2 } from "lucide-react";
import { useClientProperties } from "@/hooks/useClientProperties";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PropertyInfo {
  id?: string;
  property_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  property_type?: string;
}

interface PropertyInfoSectionProps {
  job: any;
}

export const PropertyInfoSection = ({ job }: PropertyInfoSectionProps) => {
  const { properties } = useClientProperties(job?.client_id);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPropertyInfo = async () => {
      if (!job) return;

      setLoading(true);
      try {
        let property: PropertyInfo | null = null;

        // Strategy 1: If job has property_id, fetch from client_properties
        if (job.property_id) {
          const { data: propertyData, error } = await supabase
            .from('client_properties')
            .select('*')
            .eq('id', job.property_id)
            .maybeSingle();

          if (propertyData && !error) {
            property = {
              id: propertyData.id,
              property_name: propertyData.property_name,
              address: propertyData.address,
              city: propertyData.city,
              state: propertyData.state,
              zip: propertyData.zip,
              property_type: propertyData.property_type
            };
          }
        }

        // Strategy 2: If no property found but job has address, use job address
        if (!property && job.address) {
          property = {
            address: job.address,
            property_type: 'Service Location'
          };
        }

        // Strategy 3: If no property but we have client properties, use primary
        if (!property && properties.length > 0) {
          const primaryProperty = properties.find(p => p.is_primary) || properties[0];
          property = {
            id: primaryProperty.id,
            property_name: primaryProperty.property_name,
            address: primaryProperty.address,
            city: primaryProperty.city,
            state: primaryProperty.state,
            zip: primaryProperty.zip,
            property_type: primaryProperty.property_type
          };
        }

        setPropertyInfo(property);
      } catch (error) {
        console.error('Error fetching property info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyInfo();
  }, [job, properties]);

  const formatAddress = (property: PropertyInfo) => {
    if (!property) return 'No address available';
    
    const parts = [
      property.address,
      [property.city, property.state, property.zip].filter(Boolean).join(', ')
    ].filter(Boolean);
    
    return parts.join('\n') || 'Address not specified';
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Property Information</h3>
          </div>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/50">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Property Information</h3>
        </div>
        
        <div className="space-y-4">
          {propertyInfo ? (
            <>
              {propertyInfo.property_name && (
                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">{propertyInfo.property_name}</p>
                    {propertyInfo.property_type && (
                      <p className="text-sm text-slate-600 mt-0.5">{propertyInfo.property_type}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700 mb-2">Service Address</p>
                  <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 border border-blue-200/60 rounded-xl p-3">
                    <p className="text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                      {formatAddress(propertyInfo)}
                    </p>
                  </div>
                </div>
              </div>

              {propertyInfo.property_type && !propertyInfo.property_name && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5"></div>
                  <span className="inline-block px-3 py-1.5 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full font-medium">
                    {propertyInfo.property_type}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Service Address</p>
                <p className="text-slate-400 italic">No property information available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

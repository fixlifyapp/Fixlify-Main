
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClientProperty {
  id: string;
  property_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  property_type: string;
  is_primary: boolean;
}

export const useClientProperties = (clientId?: string) => {
  const [properties, setProperties] = useState<ClientProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!clientId) {
        setProperties([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('client_properties')
          .select('*')
          .eq('client_id', clientId)
          .order('is_primary', { ascending: false });
          
        if (error) throw error;
        
        setProperties(data || []);
      } catch (error) {
        console.error("Error fetching client properties:", error);
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, [clientId]);
  
  return {
    properties,
    isLoading,
  };
};

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeocodeRequest {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  // Optional: update property directly
  property_id?: string;
  // Optional: update job directly
  job_id?: string;
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  place_id: string;
  address_components: {
    street_number?: string;
    route?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
}

// Build full address string from components
function buildAddressString(req: GeocodeRequest): string {
  const parts = [
    req.address,
    req.city,
    req.state,
    req.zip,
    req.country || 'Canada'
  ].filter(Boolean);
  return parts.join(', ');
}

// Parse Google's address components
function parseAddressComponents(components: any[]): GeocodeResult['address_components'] {
  const result: GeocodeResult['address_components'] = {};

  for (const component of components) {
    const types = component.types || [];
    if (types.includes('street_number')) {
      result.street_number = component.long_name;
    } else if (types.includes('route')) {
      result.route = component.long_name;
    } else if (types.includes('locality')) {
      result.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      result.state = component.short_name;
    } else if (types.includes('country')) {
      result.country = component.short_name;
    } else if (types.includes('postal_code')) {
      result.postal_code = component.long_name;
    }
  }

  return result;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: GeocodeRequest = await req.json();

    if (!requestData.address) {
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const fullAddress = buildAddressString(requestData);
    console.log(`Geocoding address: ${fullAddress}`);

    // Get Google Maps API key
    const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!googleApiKey) {
      return new Response(
        JSON.stringify({ error: "Google Maps API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Call Google Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${googleApiKey}`;

    const geocodeResponse = await fetch(geocodeUrl);

    if (!geocodeResponse.ok) {
      throw new Error(`Geocoding API error: ${geocodeResponse.status}`);
    }

    const geocodeData = await geocodeResponse.json();
    console.log('Geocode response status:', geocodeData.status);

    if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
      return new Response(
        JSON.stringify({
          error: "Could not geocode address",
          status: geocodeData.status,
          message: geocodeData.error_message || "No results found"
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = geocodeData.results[0];
    const location = result.geometry?.location;

    if (!location?.lat || !location?.lng) {
      return new Response(
        JSON.stringify({ error: "Invalid geocode response - no coordinates" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const geocodeResult: GeocodeResult = {
      latitude: location.lat,
      longitude: location.lng,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      address_components: parseAddressComponents(result.address_components || []),
    };

    console.log(`Geocoded to: ${geocodeResult.latitude}, ${geocodeResult.longitude}`);

    // If property_id provided, update the property
    if (requestData.property_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error: updateError } = await supabase
        .from('client_properties')
        .update({
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
          formatted_address: geocodeResult.formatted_address,
          geocoded_at: new Date().toISOString(),
        })
        .eq('id', requestData.property_id);

      if (updateError) {
        console.error('Failed to update property:', updateError);
      } else {
        console.log(`Updated property ${requestData.property_id} with coordinates`);
      }
    }

    // If job_id provided, update the job
    if (requestData.job_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
        })
        .eq('id', requestData.job_id);

      if (updateError) {
        console.error('Failed to update job:', updateError);
      } else {
        console.log(`Updated job ${requestData.job_id} with coordinates`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: geocodeResult,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Geocode error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

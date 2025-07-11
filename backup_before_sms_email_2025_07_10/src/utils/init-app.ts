
import { supabase } from "@/integrations/supabase/client";

export const initializeApp = async () => {
  try {
    // Call the edge function to update the profiles schema
    const { data, error } = await supabase.functions.invoke('update-profiles-schema');
    
    if (error) {
      console.error("Error initializing app:", error);
    } else {
      console.log("App initialization result:", data);
    }
  } catch (error) {
    console.error("Unexpected error during app initialization:", error);
  }
};


import { supabase } from "@/integrations/supabase/client";

// Starting values for each entity type - simplified numbering
const STARTING_VALUES = {
  job: 2000,
  estimate: 100, // Shorter starting value for estimates
  invoice: 1000, // Shorter starting value for invoices
  client: 2000
};

// Simple prefixes for each entity type
const PREFIXES = {
  job: 'J',
  estimate: '', // No prefix for estimates - just numbers
  invoice: 'I',
  client: 'C'
};

export const generateNextId = async (entityType: 'job' | 'estimate' | 'invoice' | 'client'): Promise<string> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // For estimates and invoices, use the atomic database function
    if (entityType === 'estimate' || entityType === 'invoice') {
      const { data, error } = await supabase
        .rpc('get_next_document_number', { p_entity_type: entityType });
      
      if (error) {
        console.error(`Error generating ${entityType} number:`, error);
        throw error;
      }
      
      return data;
    }

    // For jobs and clients, continue using per-user counters
    const { data: counter, error: fetchError } = await supabase
      .from('id_counters')
      .select('*')
      .eq('entity_type', entityType)
      .eq('user_id', user.id)
      .single();

    let nextNumber: number;

    if (fetchError && fetchError.code === 'PGRST116') {
      // No counter exists, create one with starting value
      nextNumber = STARTING_VALUES[entityType];
      
      await supabase
        .from('id_counters')
        .insert({
          entity_type: entityType,
          prefix: PREFIXES[entityType],
          current_value: nextNumber,
          start_value: STARTING_VALUES[entityType],
          user_id: user.id
        });
    } else if (counter) {
      // Counter exists, increment it
      nextNumber = counter.current_value + 1;
      
      await supabase
        .from('id_counters')
        .update({ current_value: nextNumber })
        .eq('entity_type', entityType)
        .eq('user_id', user.id);
    } else {
      throw new Error('Unexpected error fetching counter');
    }

    return `${PREFIXES[entityType]}-${nextNumber}`;
  } catch (error) {
    console.error(`Error generating ${entityType} ID:`, error);
    // Fallback to random number if database operation fails
    const fallbackNumber = Math.floor(Math.random() * 999) + STARTING_VALUES[entityType];
    
    if (entityType === 'estimate') {
      return fallbackNumber.toString();
    } else if (entityType === 'invoice') {
      return `INV-${fallbackNumber}`;
    }
    
    return `${PREFIXES[entityType]}-${fallbackNumber}`;
  }
};

// Function for simple sequential numbers (used in estimate/invoice builders)
export const generateSimpleNumber = async (entityType: 'estimate' | 'invoice'): Promise<string> => {
  return await generateNextId(entityType);
};

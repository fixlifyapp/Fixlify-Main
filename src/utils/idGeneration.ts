import { supabase } from "@/integrations/supabase/client";

// Prefixes for different entity types
const PREFIXES: Record<string, string> = {
  job: 'J',
  estimate: '', // No prefix for estimates - just numbers
  invoice: 'I',
  client: 'C'
};

// Starting values for different entities
const STARTING_VALUES: Record<string, number> = {
  job: 1000,
  estimate: 1000,
  invoice: 1000,
  client: 2000
};

export const generateNextId = async (entityType: 'job' | 'estimate' | 'invoice' | 'client'): Promise<string> => {
  console.log('=== generateNextId Debug ===');
  console.log('Entity type:', entityType);
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user in generateNextId:', user);
    
    if (!user) {
      console.error('No user found in generateNextId');
      throw new Error('User not authenticated');
    }

    // Use the atomic database function for ALL entity types
    // This ensures no duplicates across all entities
    const { data, error } = await supabase
      .rpc('get_next_document_number', { 
        p_entity_type: entityType
      });
    
    if (error) {
      console.error(`Error generating ${entityType} number:`, error);
      
      // If the RPC function doesn't exist or fails, fall back to the old method
      if (error.code === 'PGRST202' || error.message?.includes('function') || error.message?.includes('does not exist')) {
        console.log('Falling back to manual ID generation');
        return await generateNextIdManual(entityType, user.id);
      }
      
      throw error;
    }
    
    console.log('Generated ID from database:', data);
    return data;
    
  } catch (error) {
    console.error(`Error generating ${entityType} ID:`, error);
    
    // Fallback to timestamp-based ID to ensure uniqueness
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const fallbackId = `${PREFIXES[entityType]}-${timestamp}-${random}`;
    
    console.log('Using fallback ID:', fallbackId);
    return fallbackId;
  }
};

// Manual ID generation as fallback
async function generateNextIdManual(entityType: string, userId: string): Promise<string> {
  const maxRetries = 10;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    console.log(`Manual generation attempt ${attempt} for ${entityType}`);
    
    // Get the current counter
    const { data: counter, error: fetchError } = await supabase
      .from('id_counters')
      .select('*')
      .eq('entity_type', entityType)
      .eq('user_id', userId)
      .single();

    let nextNumber: number;
    let needsInsert = false;

    if (fetchError && fetchError.code === 'PGRST116') {
      // No counter exists, create one
      nextNumber = STARTING_VALUES[entityType];
      needsInsert = true;
      console.log('No counter exists, will create with value:', nextNumber);
    } else if (counter) {
      nextNumber = counter.current_value + 1;
      console.log('Counter exists with current value:', counter.current_value, 'next will be:', nextNumber);
    } else {
      throw new Error('Unexpected error fetching counter');
    }

    // Generate the ID with proper format
    const generatedId = formatEntityId(entityType, nextNumber);
    console.log('Generated ID:', generatedId);

    // Check if this ID already exists
    const tableName = getTableName(entityType);
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq('id', generatedId)
      .single();
      
    if (existing) {
      console.log('ID already exists, incrementing and retrying...');
      // ID already exists, update counter and retry
      if (counter) {
        await supabase
          .from('id_counters')
          .update({ current_value: nextNumber })
          .eq('entity_type', entityType)
          .eq('user_id', userId);
      }
      continue; // Try again with next number
    }

    // ID doesn't exist, update or insert counter
    if (needsInsert) {
      const { error: insertError } = await supabase
        .from('id_counters')
        .insert({
          entity_type: entityType,
          prefix: PREFIXES[entityType],
          current_value: nextNumber,
          start_value: STARTING_VALUES[entityType],
          user_id: userId
        });
        
      if (insertError && insertError.code !== '23505') {
        // Ignore duplicate key errors, someone else might have created it
        throw insertError;
      }
    } else {
      // Update existing counter with optimistic locking
      const { error: updateError } = await supabase
        .from('id_counters')
        .update({ current_value: nextNumber })
        .eq('entity_type', entityType)
        .eq('user_id', userId)
        .eq('current_value', counter!.current_value);
        
      if (updateError) {
        console.log('Update failed, possibly due to concurrent modification, retrying...');
        continue; // Retry
      }
    }
    
    console.log('Successfully generated unique ID:', generatedId);
    return generatedId;
  }
  
  throw new Error(`Failed to generate unique ${entityType} ID after ${maxRetries} attempts`);
}

// Helper function to format ID based on entity type
function formatEntityId(entityType: string, number: number): string {
  switch (entityType) {
    case 'estimate':
      return number.toString(); // No prefix for estimates
    case 'invoice':
      return `INV-${number}`;
    case 'job':
      return `J-${number}`;
    case 'client':
      return `C-${number}`;
    default:
      return `${PREFIXES[entityType] || ''}-${number}`;
  }
}

// Helper function to get table name for entity type
function getTableName(entityType: string): string {
  switch (entityType) {
    case 'job':
      return 'jobs';
    case 'client':
      return 'clients';
    case 'estimate':
      return 'estimates';
    case 'invoice':
      return 'invoices';
    default:
      return `${entityType}s`; // Fallback pluralization
  }
}

// Function for simple sequential numbers (used in estimate/invoice builders)
export const generateSimpleNumber = async (entityType: 'estimate' | 'invoice'): Promise<string> => {
  return generateNextId(entityType);
};
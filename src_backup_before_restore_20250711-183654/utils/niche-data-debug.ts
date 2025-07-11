// Fix for enhanced niche data loader
// This fixes syntax errors and improves error handling

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getProductsForNiche } from "@/data/niche-products";

// Add this fix to the beginning of enhanced-niche-data-loader.ts
// or replace the file with this corrected version

// Test function to verify the data structures
export function testNicheDataIntegrity() {
  const errors = [];
  
  // Check if all niche keys have corresponding data
  const nicheKeys = ['appliance_repair', 'garage_door', 'hvac', 'plumbing', 
                     'electrical', 'handyman', 'construction', 'deck_builder', 
                     'moving', 'waterproofing', 'drain_repair'];
  
  for (const key of nicheKeys) {
    // Check tags
    if (!nicheTags[key]) {
      errors.push(`Missing tags for niche: ${key}`);
    } else if (!Array.isArray(nicheTags[key])) {
      errors.push(`Tags for ${key} is not an array`);
    }
    
    // Check job types
    if (!nicheJobTypes[key]) {
      errors.push(`Missing job types for niche: ${key}`);
    } else if (!Array.isArray(nicheJobTypes[key])) {
      errors.push(`Job types for ${key} is not an array`);
    }
  }
  
  if (errors.length > 0) {
    console.error('Niche data integrity errors:', errors);
    return false;
  }
  
  return true;
}

// Enhanced error handling wrapper
export async function safeInitializeNicheData(businessNiche: string) {
  try {
    // Test data integrity first
    if (!testNicheDataIntegrity()) {
      throw new Error('Niche data integrity check failed');
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User authentication failed: ' + (userError?.message || 'No user found'));
    }
    
    // Call the actual initialization
    const result = await initializeNicheData(businessNiche);
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown initialization error');
    }
    
    return result;
  } catch (error) {
    console.error('Safe initialize niche data error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Debug function to check what's available for a niche
export function debugNicheData(businessNiche: string) {
  console.log('=== Debugging Niche Data ===');
  console.log('Business Niche:', businessNiche);
  
  // Map business niche names to keys
  const nicheKeyMap = {
    "Appliance Repair": "appliance_repair",
    "Garage Door Services": "garage_door",
    "HVAC Services": "hvac",
    "Plumbing Services": "plumbing",
    "Electrical Services": "electrical",
    "General Handyman": "handyman",
    "General Contracting": "construction",
    "Deck Builder": "deck_builder",
    "Moving Services": "moving",
    "Air Conditioning": "hvac",
    "Waterproofing": "waterproofing",
    "Drain Repair": "drain_repair"
  };
  
  const nicheKey = nicheKeyMap[businessNiche] || businessNiche.toLowerCase().replace(/\s+/g, '_');
  console.log('Niche Key:', nicheKey);
  
  // Check what data is available
  const data = {
    hasProducts: false,
    productCount: 0,
    hasTags: false,
    tagCount: 0,
    hasJobTypes: false,
    jobTypeCount: 0
  };
  
  try {
    const products = getProductsForNiche(businessNiche);
    data.hasProducts = products && products.length > 0;
    data.productCount = products ? products.length : 0;
  } catch (e) {
    console.error('Error getting products:', e);
  }
  
  try {
    const tags = nicheTags[nicheKey];
    data.hasTags = tags && Array.isArray(tags) && tags.length > 0;
    data.tagCount = tags ? tags.length : 0;
  } catch (e) {
    console.error('Error getting tags:', e);
  }
  
  try {
    const jobTypes = nicheJobTypes[nicheKey];
    data.hasJobTypes = jobTypes && Array.isArray(jobTypes) && jobTypes.length > 0;
    data.jobTypeCount = jobTypes ? jobTypes.length : 0;
  } catch (e) {
    console.error('Error getting job types:', e);
  }
  
  console.log('Available data:', data);
  console.log('=== End Debug ===');
  
  return data;
}

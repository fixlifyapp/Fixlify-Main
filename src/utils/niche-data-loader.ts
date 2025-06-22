
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { applianceRepairProducts } from "@/data/appliance-repair-products";
import { Profile } from "@/types/profile";

// Tags for different niches
const nicheTags = {
  appliance_repair: [
    { name: "Refrigerator", category: "Appliance", color: "text-blue-600 border-blue-300" },
    { name: "Washer", category: "Appliance", color: "text-green-600 border-green-300" },
    { name: "Dryer", category: "Appliance", color: "text-purple-600 border-purple-300" },
    { name: "Dishwasher", category: "Appliance", color: "text-yellow-600 border-yellow-300" },
    { name: "Oven", category: "Appliance", color: "text-red-600 border-red-300" },
    { name: "Microwave", category: "Appliance", color: "text-orange-600 border-orange-300" },
    { name: "Repair", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Installation", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Maintenance", category: "Service", color: "text-cyan-600 border-cyan-300" },
  ],
  garage_door: [
    { name: "Garage Door", category: "Structure", color: "text-blue-600 border-blue-300" },
    { name: "Spring Repair", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Motor", category: "Part", color: "text-purple-600 border-purple-300" },
    { name: "Track", category: "Part", color: "text-yellow-600 border-yellow-300" },
    { name: "Opener", category: "Part", color: "text-red-600 border-red-300" },
    { name: "Sensor", category: "Part", color: "text-orange-600 border-orange-300" },
    { name: "Installation", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Repair", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Maintenance", category: "Service", color: "text-cyan-600 border-cyan-300" },
  ],
  hvac: [
    { name: "AC Unit", category: "Equipment", color: "text-blue-600 border-blue-300" },
    { name: "Heating", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Cooling", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Ventilation", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Ductwork", category: "Structure", color: "text-yellow-600 border-yellow-300" },
    { name: "Filter", category: "Part", color: "text-orange-600 border-orange-300" },
    { name: "Installation", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Repair", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Maintenance", category: "Service", color: "text-purple-600 border-purple-300" },
  ],
  construction: [
    { name: "Renovation", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Demolition", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Plumbing", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Electrical", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Framing", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Drywall", category: "Material", color: "text-orange-600 border-orange-300" },
    { name: "Painting", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Flooring", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Roofing", category: "Service", color: "text-purple-600 border-purple-300" },
  ],
  plumbing: [
    { name: "Pipe", category: "Part", color: "text-blue-600 border-blue-300" },
    { name: "Drain", category: "Part", color: "text-green-600 border-green-300" },
    { name: "Toilet", category: "Fixture", color: "text-purple-600 border-purple-300" },
    { name: "Sink", category: "Fixture", color: "text-yellow-600 border-yellow-300" },
    { name: "Water Heater", category: "Equipment", color: "text-red-600 border-red-300" },
    { name: "Faucet", category: "Fixture", color: "text-orange-600 border-orange-300" },
    { name: "Installation", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Repair", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Maintenance", category: "Service", color: "text-cyan-600 border-cyan-300" },
  ],
  electrical: [
    { name: "Wiring", category: "Part", color: "text-blue-600 border-blue-300" },
    { name: "Circuit", category: "Part", color: "text-green-600 border-green-300" },
    { name: "Panel", category: "Equipment", color: "text-purple-600 border-purple-300" },
    { name: "Outlet", category: "Fixture", color: "text-yellow-600 border-yellow-300" },
    { name: "Light", category: "Fixture", color: "text-red-600 border-red-300" },
    { name: "Switch", category: "Fixture", color: "text-orange-600 border-orange-300" },
    { name: "Installation", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Repair", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Maintenance", category: "Service", color: "text-cyan-600 border-cyan-300" },
  ],
};

// Job types for different niches
const nicheJobTypes = {
  appliance_repair: [
    { name: "Repair", description: "Fix broken appliances", is_default: true },
    { name: "Installation", description: "Install new appliances" },
    { name: "Maintenance", description: "Regular maintenance service" },
    { name: "Diagnosis", description: "Diagnose appliance issues" },
    { name: "Replacement", description: "Replace parts or entire appliances" }
  ],
  garage_door: [
    { name: "Repair", description: "Fix garage door issues", is_default: true },
    { name: "Installation", description: "Install new garage doors" },
    { name: "Spring Replacement", description: "Replace garage door springs" },
    { name: "Motor Service", description: "Fix or replace garage door motors" },
    { name: "Sensor Adjustment", description: "Adjust or replace sensors" }
  ],
  hvac: [
    { name: "AC Repair", description: "Fix AC unit issues", is_default: true },
    { name: "AC Installation", description: "Install new AC units" },
    { name: "Heating Service", description: "Service heating systems" },
    { name: "Duct Cleaning", description: "Clean ventilation systems" },
    { name: "Seasonal Maintenance", description: "Regular seasonal check-ups" }
  ],
  construction: [
    { name: "Renovation", description: "Renovate existing structures", is_default: true },
    { name: "New Build", description: "Construct new buildings" },
    { name: "Addition", description: "Add to existing structures" },
    { name: "Demolition", description: "Remove structures" },
    { name: "Finishing", description: "Finishing work on structures" }
  ],
  plumbing: [
    { name: "Repair", description: "Fix plumbing issues", is_default: true },
    { name: "Installation", description: "Install plumbing fixtures" },
    { name: "Drain Service", description: "Clear and service drains" },
    { name: "Water Heater", description: "Water heater services" },
    { name: "Pipe Replacement", description: "Replace plumbing pipes" }
  ],
  electrical: [
    { name: "Repair", description: "Fix electrical issues", is_default: true },
    { name: "Installation", description: "Install electrical components" },
    { name: "Panel Upgrade", description: "Upgrade electrical panels" },
    { name: "Rewiring", description: "Rewire electrical systems" },
    { name: "Lighting", description: "Install or repair lighting" }
  ],
};

// Function to create niche-specific job statuses
const createJobStatuses = async () => {
  try {
    // First, check if job statuses already exist
    const { data: existingStatuses, error: checkError } = await supabase
      .from('job_statuses')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    // If job statuses exist, skip creation
    if (existingStatuses && existingStatuses.length > 0) {
      return;
    }

    // Create default job statuses
    const statuses = [
      { name: "Pending", description: "Job is waiting to be scheduled", color: "#FFC107", sequence: 1 },
      { name: "Scheduled", description: "Job has been scheduled", color: "#2196F3", sequence: 2, is_default: true },
      { name: "In Progress", description: "Job is currently being worked on", color: "#FF9800", sequence: 3 },
      { name: "Completed", description: "Job has been completed", color: "#4CAF50", sequence: 4 },
      { name: "Canceled", description: "Job has been canceled", color: "#F44336", sequence: 5 }
    ];

    // Insert job statuses
    const { error } = await supabase.from('job_statuses').insert(statuses);
    if (error) throw error;
  } catch (error) {
    console.error("Error creating job statuses:", error);
  }
};

// Function to create products specific to a niche
const createNicheProducts = async (niche: string) => {
  try {
    // For now, we'll use appliance repair products for all niches
    // In a production app, you'd have different product sets for each niche
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    // If products exist, skip creation
    if (existingProducts && existingProducts.length > 0) {
      return;
    }

    switch (niche) {
      case 'appliance_repair':
        for (const product of applianceRepairProducts) {
          await supabase.from('products').insert(product);
        }
        break;
      // For other niches, we'd insert different product sets
      default:
        // For now, use appliance repair products for all niches
        for (const product of applianceRepairProducts) {
          await supabase.from('products').insert(product);
        }
    }
  } catch (error) {
    console.error("Error creating products:", error);
    throw new Error("Failed to create products for the selected niche");
  }
};

// Function to create tags for a specific niche
const createNicheTags = async (niche: string) => {
  try {
    // Check if tags already exist
    const { data: existingTags, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    // If tags exist, skip creation
    if (existingTags && existingTags.length > 0) {
      return;
    }

    // Get tags for the selected niche, or use appliance repair tags as default
    const tagsToCreate = nicheTags[niche as keyof typeof nicheTags] || nicheTags.appliance_repair;

    for (const tag of tagsToCreate) {
      const { error } = await supabase.from('tags').insert(tag);
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error creating tags:", error);
    throw new Error("Failed to create tags for the selected niche");
  }
};

// Function to create job types for a specific niche
const createNicheJobTypes = async (niche: string) => {
  try {
    // Check if job types already exist
    const { data: existingTypes, error: checkError } = await supabase
      .from('job_types')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    // If job types exist, skip creation
    if (existingTypes && existingTypes.length > 0) {
      return;
    }

    // Get job types for the selected niche, or use appliance repair types as default
    const typesToCreate = nicheJobTypes[niche as keyof typeof nicheJobTypes] || nicheJobTypes.appliance_repair;

    for (const type of typesToCreate) {
      const { error } = await supabase.from('job_types').insert(type);
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error creating job types:", error);
    throw new Error("Failed to create job types for the selected niche");
  }
};

// Function to generate sample clients and jobs
const createSampleData = async () => {
  try {
    // Check if clients already exist
    const { data: existingClients, error: checkError } = await supabase
      .from('clients')
      .select('id');

    if (checkError) throw checkError;

    if (existingClients && existingClients.length > 0) {
      return;
    }
    
    // Generate test data using the correct function name
    // Import the necessary utilities from your test-data helpers
    const testData = await import('@/utils/test-data');
    await testData.generateAllTestData(); // Corrected function name
  } catch (error) {
    console.error("Error creating sample data:", error);
  }
};

// Main function to load all niche-specific data
export const loadNicheData = async (businessNiche: string) => {
  const loadingToast = toast.loading("Setting up your workspace...");
  
  try {
    // Import and use the enhanced niche data loader
    const { loadEnhancedNicheData } = await import("./enhanced-niche-data-loader");
    const success = await loadEnhancedNicheData(businessNiche);
    
    if (!success) {
      throw new Error("Failed to load enhanced niche data");
    }
    
    // Optionally create sample data (skip if it causes issues)
    try {
      await createSampleData();
    } catch (sampleError) {
      console.log("Sample data creation skipped:", sampleError);
      // Don't fail the whole process if sample data fails
    }
    
    toast.dismiss(loadingToast);
    return true;
  } catch (error) {
    console.error("Error loading niche data:", error);
    toast.dismiss(loadingToast);
    toast.error("Failed to set up your workspace. Please contact support.");
    return false;
  }
};

// Function to switch to a different niche
export const switchNiche = async (businessNiche: string, userId: string) => {
  const loadingToast = toast.loading("Switching business niche...");
  
  try {
    // Update the user's niche preference in the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        business_niche: businessNiche 
      } as Partial<Profile>)
      .eq('id', userId);

    if (updateError) throw updateError;
    
    // Note: In a real application, you might want to ask the user if they want to
    // keep their existing data or replace it when switching niches.
    // For now, we'll just load the new niche data without clearing existing data.
    
    toast.dismiss(loadingToast);
    toast.success("Successfully switched business niche!");
    
    // Reload the page to apply changes
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error("Error switching niche:", error);
    toast.dismiss(loadingToast);
    toast.error("Failed to switch business niche. Please try again.");
    return false;
  }
};

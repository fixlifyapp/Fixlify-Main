import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getProductsForNiche } from "@/data/niche-products";

// Enhanced tags for each niche
const nicheTags = {
  appliance_repair: [
    { name: "Refrigerator", category: "Appliance", color: "text-blue-600 border-blue-300" },
    { name: "Washer", category: "Appliance", color: "text-green-600 border-green-300" },
    { name: "Dryer", category: "Appliance", color: "text-purple-600 border-purple-300" },
    { name: "Dishwasher", category: "Appliance", color: "text-yellow-600 border-yellow-300" },
    { name: "Oven", category: "Appliance", color: "text-red-600 border-red-300" },
    { name: "Microwave", category: "Appliance", color: "text-orange-600 border-orange-300" },
    { name: "Freezer", category: "Appliance", color: "text-cyan-600 border-cyan-300" },
    { name: "Ice Maker", category: "Appliance", color: "text-indigo-600 border-indigo-300" },
    { name: "Garbage Disposal", category: "Appliance", color: "text-pink-600 border-pink-300" },
    { name: "Repair", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Installation", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Maintenance", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Warranty", category: "Service", color: "text-green-600 border-green-300" }
  ],
  
  garage_door: [
    { name: "Residential", category: "Type", color: "text-blue-600 border-blue-300" },
    { name: "Commercial", category: "Type", color: "text-purple-600 border-purple-300" },
    { name: "Spring Repair", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Motor Replacement", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Track Alignment", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Sensor Adjustment", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Remote Programming", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Installation", category: "Service", color: "text-teal-600 border-teal-300" },
    { name: "Maintenance", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Safety Inspection", category: "Service", color: "text-green-600 border-green-300" }
  ],
  
  hvac: [
    { name: "AC Repair", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Heating", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Ventilation", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Installation", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Maintenance", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Duct Cleaning", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Filter Change", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Thermostat", category: "Component", color: "text-teal-600 border-teal-300" },
    { name: "Energy Audit", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Seasonal", category: "Type", color: "text-cyan-600 border-cyan-300" }
  ],  
  plumbing: [
    { name: "Leak Repair", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Drain Cleaning", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Water Heater", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Toilet Repair", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Faucet Install", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Pipe Repair", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Sewer Line", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Preventive", category: "Type", color: "text-green-600 border-green-300" },
    { name: "Commercial", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Residential", category: "Type", color: "text-cyan-600 border-cyan-300" }
  ],
  
  electrical: [
    { name: "Panel Upgrade", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Outlet Install", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Lighting", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Wiring", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Circuit Repair", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Switch Install", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "GFCI", category: "Component", color: "text-indigo-600 border-indigo-300" },
    { name: "Safety Check", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Smart Home", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Commercial", category: "Type", color: "text-cyan-600 border-cyan-300" }
  ],
  
  handyman: [
    { name: "Drywall", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Painting", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Carpentry", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Assembly", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Mounting", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Repair", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Maintenance", category: "Service", color: "text-indigo-600 border-indigo-300" },
    { name: "Small Job", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Indoor", category: "Location", color: "text-cyan-600 border-cyan-300" },
    { name: "Outdoor", category: "Location", color: "text-green-600 border-green-300" }
  ],
  
  construction: [
    { name: "Renovation", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "New Build", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Addition", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Kitchen", category: "Location", color: "text-yellow-600 border-yellow-300" },
    { name: "Bathroom", category: "Location", color: "text-orange-600 border-orange-300" },
    { name: "Basement", category: "Location", color: "text-indigo-600 border-indigo-300" },
    { name: "Commercial", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Residential", category: "Type", color: "text-cyan-600 border-cyan-300" },
    { name: "Permit", category: "Service", color: "text-red-600 border-red-300" }
  ],  
  deck_builder: [
    { name: "Wood Deck", category: "Type", color: "text-brown-600 border-brown-300" },
    { name: "Composite Deck", category: "Type", color: "text-gray-600 border-gray-300" },
    { name: "New Build", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Deck Repair", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Refinishing", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Railing Install", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Permit Required", category: "Status", color: "text-orange-600 border-orange-300" },
    { name: "Commercial", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Residential", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Warranty", category: "Service", color: "text-purple-600 border-purple-300" }
  ],
  
  moving: [
    { name: "Local Move", category: "Type", color: "text-blue-600 border-blue-300" },
    { name: "Long Distance", category: "Type", color: "text-purple-600 border-purple-300" },
    { name: "Commercial", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Residential", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Packing", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Storage", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Fragile Items", category: "Special", color: "text-red-600 border-red-300" },
    { name: "Heavy Items", category: "Special", color: "text-gray-600 border-gray-300" },
    { name: "Weekend", category: "Schedule", color: "text-cyan-600 border-cyan-300" },
    { name: "Insurance", category: "Service", color: "text-pink-600 border-pink-300" }
  ],
  
  waterproofing: [
    { name: "Basement", category: "Location", color: "text-blue-600 border-blue-300" },
    { name: "Foundation", category: "Location", color: "text-gray-600 border-gray-300" },
    { name: "Crawl Space", category: "Location", color: "text-purple-600 border-purple-300" },
    { name: "Interior", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Exterior", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Sump Pump", category: "Service", color: "text-green-600 border-green-300" },
    { name: "French Drain", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Mold Prevention", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Commercial", category: "Type", color: "text-cyan-600 border-cyan-300" },
    { name: "Residential", category: "Type", color: "text-pink-600 border-pink-300" },
    { name: "Warranty", category: "Service", color: "text-purple-600 border-purple-300" }
  ],
  
  drain_repair: [
    { name: "Kitchen Drain", category: "Location", color: "text-blue-600 border-blue-300" },
    { name: "Bathroom Drain", category: "Location", color: "text-purple-600 border-purple-300" },
    { name: "Main Line", category: "Location", color: "text-gray-600 border-gray-300" },
    { name: "Floor Drain", category: "Location", color: "text-teal-600 border-teal-300" },
    { name: "Clog Removal", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Camera Inspection", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Hydro Jetting", category: "Service", color: "text-orange-600 border-orange-300" },
    { name: "Preventive", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Commercial", category: "Type", color: "text-cyan-600 border-cyan-300" },
    { name: "Residential", category: "Type", color: "text-pink-600 border-pink-300" }
  ],
  
  landscaping: [
    { name: "Lawn Care", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Tree Service", category: "Service", color: "text-brown-600 border-brown-300" },
    { name: "Irrigation", category: "Service", color: "text-blue-600 border-blue-300" },
    { name: "Hardscaping", category: "Service", color: "text-gray-600 border-gray-300" },
    { name: "Design", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Seasonal", category: "Type", color: "text-orange-600 border-orange-300" },
    { name: "Commercial", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Residential", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Maintenance", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Installation", category: "Service", color: "text-red-600 border-red-300" },
    { name: "Organic", category: "Type", color: "text-green-700 border-green-400" },
    { name: "Mulching", category: "Service", color: "text-amber-600 border-amber-300" },
    { name: "Fertilization", category: "Service", color: "text-lime-600 border-lime-300" }
  ],
  
  painting: [
    { name: "Interior", category: "Location", color: "text-blue-600 border-blue-300" },
    { name: "Exterior", category: "Location", color: "text-green-600 border-green-300" },
    { name: "Commercial", category: "Type", color: "text-purple-600 border-purple-300" },
    { name: "Residential", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Cabinet", category: "Specialty", color: "text-brown-600 border-brown-300" },
    { name: "Wallpaper", category: "Service", color: "text-pink-600 border-pink-300" },
    { name: "Staining", category: "Service", color: "text-amber-600 border-amber-300" },
    { name: "Pressure Washing", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Drywall", category: "Service", color: "text-gray-600 border-gray-300" },
    { name: "Touch-up", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Spray Paint", category: "Method", color: "text-indigo-600 border-indigo-300" },
    { name: "Eco-Friendly", category: "Type", color: "text-green-700 border-green-400" },
    { name: "Lead Safe", category: "Certification", color: "text-red-600 border-red-300" },
    { name: "Decorative", category: "Specialty", color: "text-purple-700 border-purple-400" }
  ],
  
  roofing: [
    { name: "Asphalt Shingle", category: "Material", color: "text-gray-600 border-gray-300" },
    { name: "Metal Roof", category: "Material", color: "text-blue-600 border-blue-300" },
    { name: "Tile Roof", category: "Material", color: "text-orange-600 border-orange-300" },
    { name: "Flat Roof", category: "Type", color: "text-teal-600 border-teal-300" },
    { name: "Repair", category: "Service", color: "text-yellow-600 border-yellow-300" },
    { name: "Replacement", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Inspection", category: "Service", color: "text-purple-600 border-purple-300" },
    { name: "Commercial", category: "Type", color: "text-indigo-600 border-indigo-300" },
    { name: "Residential", category: "Type", color: "text-pink-600 border-pink-300" },
    { name: "Storm Damage", category: "Service", color: "text-red-700 border-red-400" },
    { name: "Gutter Work", category: "Service", color: "text-cyan-600 border-cyan-300" },
    { name: "Warranty", category: "Service", color: "text-green-700 border-green-400" },
    { name: "Insurance Claim", category: "Service", color: "text-amber-600 border-amber-300" }
  ]
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
    { name: "New Construction", description: "Build new structures", is_default: true },
    { name: "Renovation", description: "Renovate existing structures" },
    { name: "Addition", description: "Add to existing buildings" },
    { name: "Repair", description: "Fix structural issues" },
    { name: "Consultation", description: "Construction planning and advice" }
  ],
  
  plumbing: [
    { name: "Repair", description: "Fix plumbing issues", is_default: true },
    { name: "Installation", description: "Install new plumbing fixtures" },
    { name: "Drain Cleaning", description: "Clear blocked drains" },
    { name: "Leak Detection", description: "Find and fix leaks" },
    { name: "Emergency Service", description: "24/7 emergency plumbing" }
  ],
  
  electrical: [
    { name: "Repair", description: "Fix electrical issues", is_default: true },
    { name: "Installation", description: "Install electrical components" },
    { name: "Inspection", description: "Electrical safety inspection" },
    { name: "Panel Upgrade", description: "Upgrade electrical panels" },
    { name: "Emergency Service", description: "24/7 emergency electrical" }
  ],
  
  handyman: [
    { name: "General Repair", description: "Various repair tasks", is_default: true },
    { name: "Assembly", description: "Furniture and equipment assembly" },
    { name: "Maintenance", description: "Regular maintenance tasks" },
    { name: "Installation", description: "Install various items" },
    { name: "Small Projects", description: "Minor home improvement tasks" }
  ],  
  deck_builder: [
    { name: "Deck Design", description: "Design and plan new deck construction", is_default: true },
    { name: "New Installation", description: "Build new deck from scratch" },
    { name: "Deck Repair", description: "Fix damaged boards, railings, or structure" },
    { name: "Refinishing", description: "Sand, stain, and seal existing deck" },
    { name: "Railing Install", description: "Install or replace deck railings" },
    { name: "Permit Service", description: "Handle permits and inspections" },
    { name: "Deck Extension", description: "Expand existing deck area" },
    { name: "Emergency Repair", description: "Urgent deck safety repairs" }
  ],
  
  moving: [
    { name: "Local Move", description: "Move within the same city or area", is_default: true },
    { name: "Long Distance", description: "Move to another city or state" },
    { name: "Office Move", description: "Commercial or office relocation" },
    { name: "Packing Only", description: "Professional packing services" },
    { name: "Loading/Unloading", description: "Load or unload rental truck" },
    { name: "Specialty Items", description: "Move pianos, artwork, or fragile items" },
    { name: "Storage Move", description: "Move items to/from storage" },
    { name: "Emergency Move", description: "Last-minute moving services" }
  ],
  
  waterproofing: [
    { name: "Basement Waterproofing", description: "Seal and protect basement from water", is_default: true },
    { name: "Foundation Repair", description: "Fix cracks and foundation issues" },
    { name: "Sump Pump Install", description: "Install or replace sump pump system" },
    { name: "French Drain", description: "Install interior/exterior drainage" },
    { name: "Moisture Control", description: "Address humidity and moisture issues" },
    { name: "Crawl Space", description: "Waterproof crawl space areas" },
    { name: "Emergency Service", description: "Emergency water removal and drying" },
    { name: "Mold Prevention", description: "Prevent mold with waterproofing" }
  ],
  
  drain_repair: [
    { name: "Drain Cleaning", description: "Clear clogged drains", is_default: true },
    { name: "Camera Inspection", description: "Video inspection of drain lines" },
    { name: "Hydro Jetting", description: "High-pressure drain cleaning" },
    { name: "Line Repair", description: "Repair or replace drain pipes" },
    { name: "Main Line Service", description: "Service main sewer line" },
    { name: "Rooter Service", description: "Remove tree roots from drains" },
    { name: "Emergency Service", description: "24/7 emergency drain clearing" },
    { name: "Preventive Service", description: "Regular drain maintenance" }
  ],
  
  landscaping: [
    { name: "Lawn Maintenance", description: "Regular lawn care service", is_default: true },
    { name: "Landscape Design", description: "Design and planning services" },
    { name: "Tree Service", description: "Tree trimming and removal" },
    { name: "Hardscaping", description: "Patios, walkways, and retaining walls" },
    { name: "Irrigation Install", description: "Sprinkler system installation" },
    { name: "Seasonal Cleanup", description: "Spring and fall cleanup" },
    { name: "Mulching", description: "Mulch delivery and installation" },
    { name: "Sod Installation", description: "New lawn installation" },
    { name: "Garden Design", description: "Garden planning and planting" },
    { name: "Fertilization", description: "Lawn and plant fertilization" },
    { name: "Pest Control", description: "Lawn and garden pest management" },
    { name: "Snow Removal", description: "Winter snow removal services" }
  ],
  
  painting: [
    { name: "Interior Painting", description: "Paint interior walls and ceilings", is_default: true },
    { name: "Exterior Painting", description: "Paint exterior surfaces" },
    { name: "Cabinet Refinishing", description: "Refinish or paint cabinets" },
    { name: "Wallpaper Install", description: "Install or remove wallpaper" },
    { name: "Drywall Repair", description: "Patch and repair drywall" },
    { name: "Staining", description: "Wood staining services" },
    { name: "Pressure Washing", description: "Power wash surfaces" },
    { name: "Commercial Painting", description: "Large commercial projects" },
    { name: "Touch-up Work", description: "Small paint touch-ups" },
    { name: "Texture Application", description: "Apply wall or ceiling texture" },
    { name: "Color Consultation", description: "Color selection assistance" },
    { name: "Deck Staining", description: "Stain and seal decks" }
  ],
  
  roofing: [
    { name: "Roof Inspection", description: "Comprehensive roof assessment", is_default: true },
    { name: "Roof Repair", description: "Fix leaks and damage" },
    { name: "Roof Replacement", description: "Complete roof replacement" },
    { name: "Emergency Repair", description: "24/7 emergency roof repair" },
    { name: "Gutter Service", description: "Gutter installation and repair" },
    { name: "Storm Damage", description: "Storm damage assessment and repair" },
    { name: "Maintenance", description: "Preventive roof maintenance" },
    { name: "Insurance Claims", description: "Help with insurance claims" }
  ]
};

// Safe entity creation function
async function safeCreateEntity(
  tableName: string,
  data: any[],
  uniqueField: string,
  userId: string
): Promise<boolean> {
  if (!data || data.length === 0) {
    console.log(`No data to create for ${tableName}`);
    return true;
  }

  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user found");
      return false;
    }

    // Check existing records
    const { data: existingRecords, error: fetchError } = await supabase
      .from(tableName)
      .select(uniqueField)
      .eq('user_id', user.id);

    if (fetchError) {
      console.error(`Error fetching existing ${tableName}:`, fetchError);
      return false;
    }

    const existingValues = new Set(existingRecords?.map(r => r[uniqueField]) || []);
    
    // Add user_id to all records
    const dataWithUserId = data
      .filter(item => !existingValues.has(item[uniqueField]))
      .map(item => ({
        ...item,
        user_id: user.id,
        created_by: user.id
      }));

    if (dataWithUserId.length === 0) {
      console.log(`All ${tableName} already exist`);
      return true;
    }

    // Insert in batches to avoid timeout
    const BATCH_SIZE = 50;
    for (let i = 0; i < dataWithUserId.length; i += BATCH_SIZE) {
      const batch = dataWithUserId.slice(i, i + BATCH_SIZE);
      
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting ${tableName} batch ${i / BATCH_SIZE + 1}:`, insertError);
        return false;
      }
    }

    console.log(`Successfully created ${dataWithUserId.length} ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error creating ${tableName}:`, error);
    return false;
  }
}

// Helper function to get niche-specific data
export function getNicheData(businessNiche: string): { products: any[], tags: any[], jobTypes: any[] } | null {
  // Map business niche names to data keys
  const nicheKeyMap: { [key: string]: string } = {
    "Painting & Decorating": "painting",
    "Appliance Repair": "appliance_repair",
    "Garage Door Services": "garage_door",
    "Garage Door": "garage_door",
    "HVAC Services": "hvac",
    "HVAC": "hvac",
    "Plumbing Services": "plumbing",
    "Plumbing": "plumbing",
    "Electrical Services": "electrical",
    "Electrical": "electrical",
    "General Handyman": "handyman",
    "Handyman": "handyman",
    "General Contracting": "construction",
    "Construction": "construction",
    "Landscaping & Lawn Care": "landscaping",
    "Roofing Services": "roofing",
    "Deck Builder": "deck_builder",
    "Moving Services": "moving",
    "Moving": "moving",
    "Air Conditioning": "hvac",
    "Waterproofing": "waterproofing",
    "Drain Repair": "drain_repair"
  };

  const nicheKey = nicheKeyMap[businessNiche] || businessNiche.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  
  console.log(`getNicheData: businessNiche="${businessNiche}" -> nicheKey="${nicheKey}"`);
  
  const tags = nicheTags[nicheKey as keyof typeof nicheTags];
  const jobTypes = nicheJobTypes[nicheKey as keyof typeof nicheJobTypes];
  
  // Get products from our comprehensive niche products data
  const products = getProductsForNiche(businessNiche);

  if (!tags || !jobTypes || products.length === 0) {
    console.log(`No data found for niche key: ${nicheKey} (from business niche: ${businessNiche})`);
    console.log(`Available niche keys:`, {
      tags: Object.keys(nicheTags),
      jobTypes: Object.keys(nicheJobTypes),
      productCount: products.length
    });
    return null;
  }

  // Add default fields to products
  const productsWithDefaults = products.map(product => ({ 
    ...product, 
    stock_quantity: 0,
    low_stock_threshold: 5
  }));

  return {
    products: productsWithDefaults,
    tags,
    jobTypes
  };
}

// Enhanced function to load niche-specific data
export async function loadEnhancedNicheData(businessNiche: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user");
      return false;
    }

    console.log(`Loading enhanced data for niche: ${businessNiche}`);

    // First, create default data that's the same for all users
    const defaultJobStatuses = [
      { name: 'New', color: '#3B82F6', is_default: true },
      { name: 'In Progress', color: '#F59E0B', is_default: true },
      { name: 'Completed', color: '#10B981', is_default: true },
      { name: 'Cancelled', color: '#EF4444', is_default: true }
    ];

    const defaultLeadSources = [
      { name: 'Website' },
      { name: 'Phone Call' },
      { name: 'Email' },
      { name: 'Referral' },
      { name: 'Social Media' },
      { name: 'Walk In' },
      { name: 'Google Ads' },
      { name: 'Facebook Ads' },
      { name: 'Other' }
    ];

    // Create job statuses
    await safeCreateEntity('job_statuses', defaultJobStatuses, 'name', user.id);
    
    // Create default lead sources
    await safeCreateEntity('lead_sources', defaultLeadSources, 'name', user.id);
    
    // Get niche-specific data using the helper function
    const nicheData = getNicheData(businessNiche);
    if (!nicheData) {
      console.error(`No data found for niche: ${businessNiche}`);
      // Fall back to handyman data
      const fallbackData = {
        products: getProductsForNiche("General Handyman"),
        tags: nicheTags.handyman || [],
        jobTypes: nicheJobTypes.handyman || []
      };
      
      const results = await Promise.all([
        safeCreateEntity('products', fallbackData.products, 'name', user.id),
        safeCreateEntity('tags', fallbackData.tags, 'name', user.id),
        safeCreateEntity('job_types', fallbackData.jobTypes, 'name', user.id)
      ]);
      
      return results.every(result => result === true);
    }

    // Create entities in parallel for better performance
    const results = await Promise.all([
      safeCreateEntity('products', nicheData.products, 'name', user.id),
      safeCreateEntity('tags', nicheData.tags, 'name', user.id),
      safeCreateEntity('job_types', nicheData.jobTypes, 'name', user.id)
    ]);

    const allSuccessful = results.every(result => result === true);
    
    if (allSuccessful) {
      console.log(`Successfully loaded all enhanced data for ${businessNiche}`);
    } else {
      console.warn(`Some data failed to load for ${businessNiche}`);
    }
    
    return allSuccessful;
  } catch (error) {
    console.error("Error loading enhanced niche data:", error);
    return false;
  }
}

// Function to initialize niche data (wrapper for loadEnhancedNicheData)
export async function initializeNicheData(businessNiche: string): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const success = await loadEnhancedNicheData(businessNiche);
    return {
      success,
      message: success ? "Niche data initialized successfully" : "Failed to initialize niche data"
    };
  } catch (error) {
    console.error("Error initializing niche data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Main initialization function with better error handling
export async function initializeUserDataComplete(businessNiche: string): Promise<{ success: boolean; error?: string }> {
  console.log('Starting complete initialization for niche:', businessNiche);
  
  // Map business niche names to keys
  const nicheKeyMap: { [key: string]: string } = {
    "Appliance Repair": "appliance_repair",
    "Garage Door": "garage_door",
    "Garage Door Services": "garage_door",
    "HVAC": "hvac",
    "HVAC Services": "hvac",
    "Plumbing": "plumbing",
    "Plumbing Services": "plumbing",
    "Electrical": "electrical",
    "Electrical Services": "electrical",
    "Handyman": "handyman",
    "General Handyman": "handyman",
    "Construction": "construction",
    "General Contracting": "construction",
    "Deck Builder": "deck_builder",
    "Moving": "moving",
    "Moving Services": "moving",
    "Waterproofing": "waterproofing",
    "Drain Repair": "drain_repair"
  };
  
  const nicheKey = nicheKeyMap[businessNiche] || "handyman";
  console.log('Using niche key:', nicheKey);
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No authenticated user found" };
  }
  
  // Get niche-specific data
  const products = getProductsForNiche(businessNiche);
  const tags = nicheTags[nicheKey as keyof typeof nicheTags] || [];
  const jobTypes = nicheJobTypes[nicheKey as keyof typeof nicheJobTypes] || [];
  
  // Default lead sources - same for all niches
  const defaultLeadSources = [
    { name: 'Website' },
    { name: 'Phone Call' },
    { name: 'Email' },
    { name: 'Referral' },
    { name: 'Social Media' },
    { name: 'Walk In' },
    { name: 'Google Ads' },
    { name: 'Facebook Ads' },
    { name: 'Other' }
  ];
  
  // Default job statuses - same for all niches
  const defaultJobStatuses = [
    { name: 'New', color: '#3B82F6', is_default: true },
    { name: 'In Progress', color: '#F59E0B', is_default: false },
    { name: 'Completed', color: '#10B981', is_default: false },
    { name: 'Cancelled', color: '#EF4444', is_default: false },
    { name: 'On Hold', color: '#6B7280', is_default: false }
  ];
  
  console.log('Data counts:', {
    products: products.length,
    tags: tags.length,
    jobTypes: jobTypes.length,
    leadSources: defaultLeadSources.length
  });
  
  // Initialize all data in parallel for better performance
  const results = await Promise.all([
    // Initialize products
    safeCreateEntity('products', products, 'name', user.id),
    
    // Initialize tags
    tags.length > 0 ? safeCreateEntity('tags', tags, 'name', user.id) : Promise.resolve(true),
    
    // Initialize job types
    jobTypes.length > 0 ? safeCreateEntity('job_types', jobTypes, 'name', user.id) : Promise.resolve(true),
    
    // Initialize lead sources
    safeCreateEntity('lead_sources', defaultLeadSources, 'name', user.id)
  ]);
  
  const allSuccessful = results.every(result => result === true);
  
  if (allSuccessful) {
    console.log('All initialization completed successfully');
    return { success: true };
  } else {
    console.error('Some initialization steps failed');
    return { success: false, error: "Failed to initialize some data" };
  }
}

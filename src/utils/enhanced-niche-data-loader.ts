import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Comprehensive product data for each niche
const nicheProducts = {
  appliance_repair: [
    // Refrigerator Parts
    { name: "Refrigerator Compressor", category: "Parts", price: 350.00, unit: "each" },
    { name: "Refrigerator Door Seal", category: "Parts", price: 75.00, unit: "each" },
    { name: "Refrigerator Thermostat", category: "Parts", price: 45.00, unit: "each" },
    { name: "Refrigerator Water Filter", category: "Parts", price: 35.00, unit: "each" },
    { name: "Refrigerator Ice Maker", category: "Parts", price: 125.00, unit: "each" },
    // Washer Parts
    { name: "Washer Pump", category: "Parts", price: 85.00, unit: "each" },
    { name: "Washer Belt", category: "Parts", price: 25.00, unit: "each" },
    { name: "Washer Control Board", category: "Parts", price: 225.00, unit: "each" },
    { name: "Washer Door Lock", category: "Parts", price: 65.00, unit: "each" },
    { name: "Washer Agitator", category: "Parts", price: 95.00, unit: "each" },
    // Dryer Parts
    { name: "Dryer Heating Element", category: "Parts", price: 125.00, unit: "each" },
    { name: "Dryer Belt", category: "Parts", price: 20.00, unit: "each" },
    { name: "Dryer Thermal Fuse", category: "Parts", price: 15.00, unit: "each" },
    { name: "Dryer Drum Roller", category: "Parts", price: 35.00, unit: "each" },
    { name: "Dryer Vent Kit", category: "Parts", price: 45.00, unit: "each" },
    // Dishwasher Parts
    { name: "Dishwasher Pump", category: "Parts", price: 145.00, unit: "each" },
    { name: "Dishwasher Spray Arm", category: "Parts", price: 35.00, unit: "each" },
    { name: "Dishwasher Door Latch", category: "Parts", price: 55.00, unit: "each" },
    { name: "Dishwasher Control Panel", category: "Parts", price: 185.00, unit: "each" },
    { name: "Dishwasher Rack", category: "Parts", price: 75.00, unit: "each" },
    // Services
    { name: "Diagnostic Fee", category: "Service", price: 85.00, unit: "service" },
    { name: "Labor - Basic Repair", category: "Service", price: 125.00, unit: "hour" },
    { name: "Labor - Complex Repair", category: "Service", price: 175.00, unit: "hour" },
    { name: "Installation Service", category: "Service", price: 150.00, unit: "service" },
    { name: "Maintenance Service", category: "Service", price: 95.00, unit: "service" },
    { name: "Emergency Service", category: "Service", price: 225.00, unit: "service" },
    { name: "Haul Away Service", category: "Service", price: 50.00, unit: "service" }
  ],
  
  garage_door: [
    // Springs & Hardware
    { name: "Torsion Spring", category: "Parts", price: 125.00, unit: "each" },
    { name: "Extension Spring", category: "Parts", price: 85.00, unit: "pair" },
    { name: "Spring Safety Cable", category: "Parts", price: 25.00, unit: "set" },
    { name: "Garage Door Cable", category: "Parts", price: 35.00, unit: "each" },
    { name: "Cable Drum", category: "Parts", price: 45.00, unit: "each" },
    // Openers & Motors
    { name: "Chain Drive Opener", category: "Equipment", price: 325.00, unit: "each" },
    { name: "Belt Drive Opener", category: "Equipment", price: 425.00, unit: "each" },
    { name: "Direct Drive Opener", category: "Equipment", price: 525.00, unit: "each" },
    { name: "Opener Remote", category: "Parts", price: 45.00, unit: "each" },
    { name: "Keypad Entry", category: "Parts", price: 65.00, unit: "each" },
    // Tracks & Rollers
    { name: "Garage Door Track", category: "Parts", price: 85.00, unit: "section" },
    { name: "Track Bracket", category: "Parts", price: 15.00, unit: "each" },
    { name: "Nylon Roller", category: "Parts", price: 12.00, unit: "each" },
    { name: "Steel Roller", category: "Parts", price: 8.00, unit: "each" },
    { name: "Roller Hinge", category: "Parts", price: 18.00, unit: "each" },
    // Sensors & Safety
    { name: "Safety Sensor Set", category: "Parts", price: 85.00, unit: "pair" },
    { name: "Sensor Bracket", category: "Parts", price: 15.00, unit: "each" },
    { name: "Emergency Release", category: "Parts", price: 35.00, unit: "each" },
    // Services
    { name: "Spring Replacement", category: "Service", price: 275.00, unit: "service" },
    { name: "Opener Installation", category: "Service", price: 225.00, unit: "service" },
    { name: "Track Alignment", category: "Service", price: 175.00, unit: "service" },
    { name: "Annual Maintenance", category: "Service", price: 125.00, unit: "service" },
    { name: "Emergency Service", category: "Service", price: 325.00, unit: "service" }
  ],
  
  hvac: [
    // AC Units & Components
    { name: "AC Capacitor", category: "Parts", price: 125.00, unit: "each" },
    { name: "AC Contactor", category: "Parts", price: 85.00, unit: "each" },
    { name: "Blower Motor", category: "Parts", price: 325.00, unit: "each" },
    { name: "Evaporator Coil", category: "Parts", price: 825.00, unit: "each" },
    { name: "Condenser Coil", category: "Parts", price: 925.00, unit: "each" },
    // Filters & Maintenance
    { name: "Standard Air Filter", category: "Parts", price: 15.00, unit: "each" },
    { name: "HEPA Filter", category: "Parts", price: 45.00, unit: "each" },
    { name: "UV Light System", category: "Equipment", price: 425.00, unit: "each" },
    { name: "Refrigerant R410A", category: "Materials", price: 125.00, unit: "pound" },
    { name: "Thermostat - Basic", category: "Parts", price: 125.00, unit: "each" },
    { name: "Thermostat - Smart", category: "Parts", price: 325.00, unit: "each" },
    // Ductwork
    { name: "Flexible Duct", category: "Materials", price: 8.50, unit: "foot" },
    { name: "Sheet Metal Duct", category: "Materials", price: 12.50, unit: "foot" },
    { name: "Duct Insulation", category: "Materials", price: 3.50, unit: "sq ft" },
    { name: "Duct Sealant", category: "Materials", price: 25.00, unit: "gallon" },
    // Services
    { name: "AC Tune-Up", category: "Service", price: 175.00, unit: "service" },
    { name: "Duct Cleaning", category: "Service", price: 425.00, unit: "service" },
    { name: "System Installation", category: "Service", price: 2500.00, unit: "service" },
    { name: "Emergency Repair", category: "Service", price: 325.00, unit: "service" },
    { name: "Maintenance Plan", category: "Service", price: 325.00, unit: "year" }
  ],
  
  plumbing: [
    // Pipes & Fittings
    { name: "Copper Pipe 1/2\"", category: "Materials", price: 4.50, unit: "foot" },
    { name: "PVC Pipe 2\"", category: "Materials", price: 2.25, unit: "foot" },
    { name: "PEX Tubing", category: "Materials", price: 1.75, unit: "foot" },
    { name: "Pipe Fitting Set", category: "Parts", price: 35.00, unit: "set" },
    { name: "Shut-off Valve", category: "Parts", price: 25.00, unit: "each" },
    // Fixtures
    { name: "Kitchen Faucet", category: "Fixtures", price: 225.00, unit: "each" },
    { name: "Bathroom Faucet", category: "Fixtures", price: 175.00, unit: "each" },
    { name: "Toilet - Standard", category: "Fixtures", price: 325.00, unit: "each" },
    { name: "Toilet - High Efficiency", category: "Fixtures", price: 425.00, unit: "each" },
    { name: "Sink - Kitchen", category: "Fixtures", price: 275.00, unit: "each" },
    { name: "Sink - Bathroom", category: "Fixtures", price: 175.00, unit: "each" },
    // Water Heaters
    { name: "Water Heater - 40 Gal", category: "Equipment", price: 825.00, unit: "each" },
    { name: "Water Heater - Tankless", category: "Equipment", price: 1825.00, unit: "each" },
    { name: "Water Heater Element", category: "Parts", price: 45.00, unit: "each" },
    // Drain & Sewer
    { name: "Drain Snake", category: "Tools", price: 125.00, unit: "each" },
    { name: "P-Trap", category: "Parts", price: 15.00, unit: "each" },
    { name: "Wax Ring", category: "Parts", price: 8.00, unit: "each" },
    // Services
    { name: "Drain Cleaning", category: "Service", price: 225.00, unit: "service" },
    { name: "Leak Detection", category: "Service", price: 275.00, unit: "service" },
    { name: "Water Heater Install", category: "Service", price: 425.00, unit: "service" },
    { name: "Emergency Service", category: "Service", price: 325.00, unit: "service" }
  ],
  
  electrical: [
    // Panels & Breakers
    { name: "Circuit Breaker 20A", category: "Parts", price: 45.00, unit: "each" },
    { name: "Circuit Breaker 30A", category: "Parts", price: 55.00, unit: "each" },
    { name: "Main Panel 200A", category: "Equipment", price: 825.00, unit: "each" },
    { name: "Sub Panel 100A", category: "Equipment", price: 425.00, unit: "each" },
    // Wiring & Cable
    { name: "Romex 12-2 Wire", category: "Materials", price: 125.00, unit: "250ft" },
    { name: "Romex 14-2 Wire", category: "Materials", price: 95.00, unit: "250ft" },
    { name: "THHN Wire #10", category: "Materials", price: 0.85, unit: "foot" },
    { name: "Conduit 1/2\"", category: "Materials", price: 2.25, unit: "foot" },
    // Outlets & Switches
    { name: "Duplex Outlet", category: "Parts", price: 8.50, unit: "each" },
    { name: "GFCI Outlet", category: "Parts", price: 25.00, unit: "each" },
    { name: "Light Switch", category: "Parts", price: 6.50, unit: "each" },
    { name: "Dimmer Switch", category: "Parts", price: 35.00, unit: "each" },
    { name: "Smart Switch", category: "Parts", price: 55.00, unit: "each" },
    // Lighting
    { name: "Recessed Light", category: "Fixtures", price: 45.00, unit: "each" },
    { name: "Ceiling Fan", category: "Fixtures", price: 225.00, unit: "each" },
    { name: "LED Bulb Pack", category: "Parts", price: 25.00, unit: "4-pack" },
    // Services
    { name: "Panel Upgrade", category: "Service", price: 1825.00, unit: "service" },
    { name: "Outlet Installation", category: "Service", price: 125.00, unit: "each" },
    { name: "Troubleshooting", category: "Service", price: 175.00, unit: "hour" },
    { name: "Emergency Service", category: "Service", price: 325.00, unit: "service" }
  ],
  
  handyman: [
    // General Hardware
    { name: "Drywall Sheet", category: "Materials", price: 15.00, unit: "sheet" },
    { name: "Joint Compound", category: "Materials", price: 18.00, unit: "bucket" },
    { name: "Wood Stud 2x4", category: "Materials", price: 8.50, unit: "each" },
    { name: "Plywood Sheet", category: "Materials", price: 45.00, unit: "sheet" },
    { name: "Screws Assortment", category: "Materials", price: 25.00, unit: "box" },
    // Paint & Supplies
    { name: "Interior Paint", category: "Materials", price: 35.00, unit: "gallon" },
    { name: "Exterior Paint", category: "Materials", price: 45.00, unit: "gallon" },
    { name: "Primer", category: "Materials", price: 25.00, unit: "gallon" },
    { name: "Paint Roller Set", category: "Tools", price: 25.00, unit: "set" },
    { name: "Drop Cloth", category: "Materials", price: 15.00, unit: "each" },
    // Flooring
    { name: "Laminate Flooring", category: "Materials", price: 3.50, unit: "sq ft" },
    { name: "Vinyl Plank", category: "Materials", price: 4.50, unit: "sq ft" },
    { name: "Carpet Tile", category: "Materials", price: 2.50, unit: "sq ft" },
    { name: "Floor Underlayment", category: "Materials", price: 0.75, unit: "sq ft" },
    // Services
    { name: "Hourly Rate", category: "Service", price: 85.00, unit: "hour" },
    { name: "Minimum Service", category: "Service", price: 125.00, unit: "service" },
    { name: "Emergency Call", category: "Service", price: 225.00, unit: "service" },
    { name: "Project Consultation", category: "Service", price: 95.00, unit: "hour" }
  ]
};

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
    { name: "Warranty", category: "Service", color: "text-green-600 border-green-300" },
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Same Day", category: "Priority", color: "text-orange-600 border-orange-300" }
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
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
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
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
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
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
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
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
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
    { name: "Emergency", category: "Priority", color: "text-red-600 border-red-300" },
    { name: "Indoor", category: "Location", color: "text-cyan-600 border-cyan-300" },
    { name: "Outdoor", category: "Location", color: "text-green-600 border-green-300" }
  ]
};

// Enhanced job types for each niche
const nicheJobTypes = {
  appliance_repair: [
    { name: "Diagnostic", description: "Diagnose appliance issues", is_default: true },
    { name: "Repair", description: "Fix broken appliances" },
    { name: "Installation", description: "Install new appliances" },
    { name: "Maintenance", description: "Preventive maintenance service" },
    { name: "Part Replacement", description: "Replace specific parts" },
    { name: "Emergency Repair", description: "Urgent repair service" },
    { name: "Warranty Service", description: "Service under warranty" },
    { name: "Haul Away", description: "Remove old appliances" }
  ],
  
  garage_door: [
    { name: "Spring Repair", description: "Replace or repair springs", is_default: true },
    { name: "Motor Service", description: "Repair or replace opener motor" },
    { name: "Installation", description: "Install new garage door" },
    { name: "Track Repair", description: "Fix or align door tracks" },
    { name: "Sensor Service", description: "Adjust or replace safety sensors" },
    { name: "Remote Setup", description: "Program remotes and keypads" },
    { name: "Maintenance", description: "Annual maintenance service" },
    { name: "Emergency Service", description: "24/7 emergency repairs" }
  ],
  
  hvac: [
    { name: "AC Service", description: "Service air conditioning unit", is_default: true },
    { name: "Heating Service", description: "Service heating system" },
    { name: "Installation", description: "Install new HVAC system" },
    { name: "Duct Service", description: "Clean or repair ductwork" },
    { name: "Maintenance", description: "Seasonal maintenance" },
    { name: "Filter Service", description: "Replace or clean filters" },
    { name: "Thermostat", description: "Install or repair thermostat" },
    { name: "Emergency Repair", description: "Emergency HVAC service" }
  ],
  
  plumbing: [
    { name: "Leak Repair", description: "Fix water leaks", is_default: true },
    { name: "Drain Service", description: "Clear clogged drains" },
    { name: "Water Heater", description: "Service or install water heater" },
    { name: "Fixture Install", description: "Install plumbing fixtures" },
    { name: "Pipe Repair", description: "Repair or replace pipes" },
    { name: "Sewer Service", description: "Sewer line service" },
    { name: "Inspection", description: "Plumbing system inspection" },
    { name: "Emergency", description: "24/7 emergency plumbing" }
  ],
  
  electrical: [
    { name: "Troubleshooting", description: "Diagnose electrical issues", is_default: true },
    { name: "Panel Service", description: "Service or upgrade panel" },
    { name: "Wiring", description: "Install or repair wiring" },
    { name: "Outlet/Switch", description: "Install outlets or switches" },
    { name: "Lighting", description: "Install lighting fixtures" },
    { name: "Circuit Work", description: "Add or repair circuits" },
    { name: "Inspection", description: "Electrical safety inspection" },
    { name: "Emergency", description: "Emergency electrical service" }
  ],
  
  handyman: [
    { name: "General Repair", description: "Various home repairs", is_default: true },
    { name: "Assembly", description: "Furniture or equipment assembly" },
    { name: "Drywall", description: "Drywall repair or installation" },
    { name: "Painting", description: "Interior or exterior painting" },
    { name: "Carpentry", description: "Wood work and repairs" },
    { name: "Mounting", description: "TV, shelf, or picture mounting" },
    { name: "Maintenance", description: "Regular home maintenance" },
    { name: "Small Projects", description: "Minor home improvements" }
  ]
};

// Function to safely create entities with proper error handling
async function safeCreateEntity(
  tableName: string,
  data: any[],
  uniqueField: string = 'name',
  userId?: string
): Promise<boolean> {
  try {
    // Get the current user if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error(`No authenticated user for ${tableName}`);
        return false;
      }
      userId = user.id;
    }

    // Add user_id to all records
    const dataWithUserId = data.map(item => ({
      ...item,
      user_id: userId
    }));

    // First, delete any existing data for this user to ensure clean slate
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq('user_id', userId);

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error(`Error deleting existing ${tableName}:`, deleteError);
    }

    // Now insert the new data
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(dataWithUserId)
      .select();

    if (error) {
      console.error(`Error creating ${tableName}:`, error);
      // Try inserting one by one if batch fails
      let successCount = 0;
      for (const item of dataWithUserId) {
        const { error: singleError } = await supabase
          .from(tableName)
          .insert(item);
        
        if (!singleError) {
          successCount++;
        }
      }
      console.log(`Created ${successCount}/${dataWithUserId.length} ${tableName} individually`);
      return successCount > 0;
    }

    console.log(`Successfully created ${insertedData?.length || 0} ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error creating ${tableName}:`, error);
    return false;
  }
}

// Helper function to get niche-specific data
function getNicheData(businessNiche: string): { products: any[], tags: any[], jobTypes: any[] } | null {
  const tags = nicheTags[businessNiche as keyof typeof nicheTags] || nicheTags.handyman;
  const jobTypes = nicheJobTypes[businessNiche as keyof typeof nicheJobTypes] || nicheJobTypes.handyman;
  const products = nicheProducts[businessNiche as keyof typeof nicheProducts] || nicheProducts.handyman;

  if (!tags || !jobTypes || !products) {
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
      { name: 'New', color: '#3B82F6' },
      { name: 'In Progress', color: '#F59E0B' },
      { name: 'Completed', color: '#10B981' },
      { name: 'Cancelled', color: '#EF4444' },
      { name: 'On Hold', color: '#6B7280' }
    ];

    const defaultLeadSources = [
      { name: 'Website' },
      { name: 'Phone Call' },
      { name: 'Email' },
      { name: 'Referral' },
      { name: 'Social Media' },
      { name: 'Walk-in' }
    ];

    // Create default job statuses
    await safeCreateEntity('job_statuses', defaultJobStatuses, 'name', user.id);
    
    // Create default lead sources
    await safeCreateEntity('lead_sources', defaultLeadSources, 'name', user.id);

    // Get niche-specific data
    const nicheData = getNicheData(businessNiche);
    if (!nicheData) {
      console.error(`No data found for niche: ${businessNiche}`);
      return false;
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
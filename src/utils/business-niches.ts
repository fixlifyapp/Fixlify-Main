import { 
  Wrench, 
  Car, 
  Zap, 
  Droplets, 
  Lightbulb, 
  Building, 
  Home, 
  Paintbrush, 
  Trees, 
  Shield, 
  Truck, 
  Hammer,
  LucideIcon
} from "lucide-react";

export interface BusinessNiche {
  id: string;
  label: string;
  dbValue: string; // The value stored in the database
  icon: LucideIcon;
  description: string;
}

// Comprehensive list of business niches with their database mappings
export const businessNiches: BusinessNiche[] = [
  { 
    id: "hvac", 
    label: "HVAC Services", 
    dbValue: "HVAC Services",
    icon: Zap,
    description: "Heating, ventilation, and AC services"
  },
  { 
    id: "plumbing", 
    label: "Plumbing Services", 
    dbValue: "Plumbing Services",
    icon: Droplets,
    description: "Residential and commercial plumbing"
  },
  { 
    id: "electrical", 
    label: "Electrical Services", 
    dbValue: "Electrical Services",
    icon: Lightbulb,
    description: "Electrical installation and repair"
  },
  { 
    id: "appliance_repair", 
    label: "Appliance Repair", 
    dbValue: "Appliance Repair",
    icon: Wrench,
    description: "Fix and install home appliances"
  },
  { 
    id: "construction", 
    label: "General Contracting", 
    dbValue: "General Contracting",
    icon: Building,
    description: "Construction and renovation"
  },
  { 
    id: "garage_door", 
    label: "Garage Door Services", 
    dbValue: "Garage Door Services",
    icon: Car,
    description: "Repair and install garage doors"
  },
  { 
    id: "roofing", 
    label: "Roofing Services", 
    dbValue: "Roofing Services",
    icon: Home,
    description: "Roof repair and replacement"
  },
  { 
    id: "painting", 
    label: "Painting & Decorating", 
    dbValue: "Painting & Decorating",
    icon: Paintbrush,
    description: "Interior and exterior painting"
  },
  { 
    id: "landscaping", 
    label: "Landscaping & Lawn Care", 
    dbValue: "Landscaping & Lawn Care",
    icon: Trees,
    description: "Outdoor maintenance and design"
  },
  { 
    id: "handyman", 
    label: "General Handyman", 
    dbValue: "General Handyman",
    icon: Hammer,
    description: "Multi-service home maintenance"
  }
];

// Helper function to get niche by id
export const getNicheById = (id: string): BusinessNiche | undefined => {
  return businessNiches.find(niche => niche.id === id);
};

// Helper function to get niche by database value
export const getNicheByDbValue = (dbValue: string): BusinessNiche | undefined => {
  return businessNiches.find(niche => niche.dbValue === dbValue);
};

// Helper function to get database value from niche id
export const getDbValueFromId = (id: string): string => {
  const niche = getNicheById(id);
  return niche?.dbValue || "Other";
};

// Helper function to get niche id from database value
export const getIdFromDbValue = (dbValue: string): string => {
  const niche = getNicheByDbValue(dbValue);
  // If no exact match found, try to find by label (for backward compatibility)
  if (!niche) {
    const nicheByLabel = businessNiches.find(n => n.label === dbValue);
    return nicheByLabel?.id || "handyman";
  }
  return niche.id;
};

// Get all business types for dropdowns (using the labels which are stored in DB)
export const businessTypes = businessNiches.map(niche => niche.dbValue);

// Referral sources configuration
export const referralSources = [
  "Search Engine",
  "Social Media",
  "Friend/Colleague",
  "Advertisement",
  "Other"
];

// Team size options
export const teamSizeOptions = [
  "Just me",
  "1-5",
  "6-10",
  "11-20",
  "21-50",
  "50+"
]; 
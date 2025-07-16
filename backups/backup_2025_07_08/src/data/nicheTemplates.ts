// Niche-specific templates for onboarding
export interface NicheTemplate {
  products: Array<{
    name: string;
    price: number;
    category: string;
    description?: string;
  }>;
  tags: string[];
  customFields: {
    jobs?: string[];
    clients?: string[];
  };
  automations?: Array<{
    name: string;
    trigger: string;
    action: string;
  }>;
  emailTemplates?: Array<{
    name: string;
    subject: string;
    body: string;
  }>;
}

export const nicheTemplates: Record<string, NicheTemplate> = {
  "HVAC Services": {
    products: [
      { name: "AC Unit Installation", price: 3500, category: "Installation", description: "Complete AC unit installation including labor" },
      { name: "Furnace Repair", price: 450, category: "Repair", description: "Diagnostic and repair service for furnaces" },
      { name: "Annual Maintenance Plan", price: 200, category: "Maintenance", description: "Yearly HVAC system check-up and tune-up" },
      { name: "Emergency Service", price: 150, category: "Service", description: "24/7 emergency HVAC service call" }
    ],    tags: ["Residential", "Commercial", "Emergency", "Warranty", "Maintenance"],
    customFields: {
      jobs: ["Equipment Type", "Model Number", "Serial Number", "Warranty Status"],
      clients: ["Property Type", "System Age", "Service Contract", "Preferred Temperature"]
    },
    automations: [
      {
        name: "Maintenance Reminder",
        trigger: "6 months after job completion",
        action: "Send maintenance reminder email"
      },
      {
        name: "Filter Change Reminder",
        trigger: "3 months after maintenance",
        action: "Send filter change reminder"
      }
    ],
    emailTemplates: [
      {
        name: "Service Complete",
        subject: "Your HVAC Service is Complete",
        body: "Thank you for choosing us for your HVAC needs. Your service has been completed successfully."
      }
    ]
  },

  "Plumbing Services": {
    products: [
      { name: "Drain Cleaning", price: 250, category: "Service", description: "Professional drain cleaning service" },
      { name: "Water Heater Installation", price: 1800, category: "Installation", description: "New water heater supply and installation" },      { name: "Pipe Repair", price: 350, category: "Repair", description: "Emergency or scheduled pipe repair" },
      { name: "Toilet Installation", price: 450, category: "Installation", description: "New toilet installation including removal of old unit" },
      { name: "Leak Detection", price: 200, category: "Diagnostic", description: "Professional leak detection service" }
    ],
    tags: ["Emergency", "Residential", "Commercial", "24/7", "Licensed"],
    customFields: {
      jobs: ["Issue Type", "Pipe Material", "Water Pressure", "Leak Location"],
      clients: ["Building Age", "Plumbing Type", "Water Heater Age", "Last Service Date"]
    }
  },

  "Electrical Services": {
    products: [
      { name: "Electrical Panel Upgrade", price: 2500, category: "Installation", description: "200 amp panel upgrade" },
      { name: "Outlet Installation", price: 150, category: "Installation", description: "New electrical outlet installation" },
      { name: "Lighting Installation", price: 300, category: "Installation", description: "Light fixture installation" },
      { name: "Electrical Inspection", price: 200, category: "Service", description: "Complete electrical system inspection" }
    ],
    tags: ["Licensed", "Emergency", "Residential", "Commercial", "Code Compliance"],
    customFields: {
      jobs: ["Voltage", "Circuit Type", "Wire Gauge", "Permit Required"],
      clients: ["Panel Size", "Home Age", "Last Inspection", "Solar System"]
    }
  },
  "Appliance Repair": {
    products: [
      { name: "Refrigerator Repair", price: 300, category: "Repair", description: "Diagnose and repair refrigerator issues" },
      { name: "Washer/Dryer Repair", price: 250, category: "Repair", description: "Washing machine or dryer repair service" },
      { name: "Dishwasher Repair", price: 200, category: "Repair", description: "Dishwasher diagnostic and repair" },
      { name: "Appliance Installation", price: 150, category: "Installation", description: "Professional appliance installation" }
    ],
    tags: ["Same Day", "Warranty", "All Brands", "Licensed", "Insured"],
    customFields: {
      jobs: ["Appliance Type", "Brand", "Model Number", "Error Code"],
      clients: ["Appliances Owned", "Warranty Status", "Purchase Dates"]
    }
  },

  "Roofing Services": {
    products: [
      { name: "Complete Roof Replacement", price: 8000, category: "Installation", description: "Full roof replacement - asphalt shingles" },
      { name: "Roof Repair", price: 500, category: "Repair", description: "Localized roof repair service" },
      { name: "Gutter Installation", price: 1200, category: "Installation", description: "Complete gutter system installation" },
      { name: "Roof Inspection", price: 150, category: "Service", description: "Comprehensive roof inspection with report" }
    ],
    tags: ["Emergency", "Insurance Claims", "Free Estimates", "Warranty", "Storm Damage"],
    customFields: {
      jobs: ["Roof Type", "Square Footage", "Pitch", "Insurance Claim Number"],
      clients: ["Roof Age", "Last Inspection", "HOA Requirements", "Insurance Company"]
    }
  },
  // Add more niches as needed...
  
  "Other": {
    products: [],
    tags: ["General", "Service"],
    customFields: {}
  }
};

// Helper function to get template by business type
export const getNicheTemplate = (businessType: string): NicheTemplate => {
  return nicheTemplates[businessType] || nicheTemplates["Other"];
};

// Helper to generate tag colors
export const generateTagColor = (): string => {
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // yellow
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#14B8A6", // teal
    "#F97316", // orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
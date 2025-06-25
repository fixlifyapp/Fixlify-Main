import { Product } from "@/hooks/useProducts";

type NicheProducts = {
  [key: string]: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'created_by'>[];
};

export const nicheProducts: NicheProducts = {
  "Deck Builder": [
    // Materials
    { name: "Pressure Treated Lumber 2x6", description: "16ft pressure treated deck boards", category: "Materials", price: 24.99, cost: 18.50, ourPrice: 20.00, taxable: true, tags: ["lumber", "deck", "materials"] },
    { name: "Composite Decking Board", description: "16ft composite deck board - gray", category: "Materials", price: 42.99, cost: 32.00, ourPrice: 35.00, taxable: true, tags: ["composite", "deck", "materials"] },
    { name: "Deck Screws 3in Box", description: "Box of 100 coated deck screws", category: "Materials", price: 28.99, cost: 18.00, ourPrice: 22.00, taxable: true, tags: ["fasteners", "deck", "materials"] },
    { name: "Joist Hangers", description: "Heavy duty joist hangers", category: "Materials", price: 4.99, cost: 2.50, ourPrice: 3.00, taxable: true, tags: ["hardware", "deck", "materials"] },
    { name: "Post Base", description: "Adjustable post base", category: "Materials", price: 12.99, cost: 8.00, ourPrice: 9.50, taxable: true, tags: ["hardware", "deck", "materials"] },
    
    // Services
    { name: "Deck Design Consultation", description: "Professional deck design and planning", category: "Service", price: 299.00, cost: 100.00, ourPrice: 150.00, taxable: true, tags: ["consultation", "design", "service"] },
    { name: "Deck Installation", description: "Complete deck installation per sq ft", category: "Service", price: 45.00, cost: 25.00, ourPrice: 30.00, taxable: true, tags: ["installation", "labor", "service"] },
    { name: "Stair Installation", description: "Deck stair construction", category: "Service", price: 850.00, cost: 400.00, ourPrice: 500.00, taxable: true, tags: ["stairs", "installation", "service"] },
    { name: "Railing Installation", description: "Deck railing installation per linear ft", category: "Service", price: 65.00, cost: 35.00, ourPrice: 40.00, taxable: true, tags: ["railing", "installation", "service"] },
    { name: "Deck Repair", description: "Deck repair service per hour", category: "Service", price: 125.00, cost: 50.00, ourPrice: 65.00, taxable: true, tags: ["repair", "maintenance", "service"] },
    { name: "Power Washing", description: "Deck power washing service", category: "Service", price: 250.00, cost: 75.00, ourPrice: 100.00, taxable: true, tags: ["cleaning", "maintenance", "service"] },
    { name: "Deck Staining", description: "Deck staining per sq ft", category: "Service", price: 3.50, cost: 1.50, ourPrice: 2.00, taxable: true, tags: ["staining", "finishing", "service"] },
    { name: "Permit Assistance", description: "Help with deck building permits", category: "Service", price: 199.00, cost: 50.00, ourPrice: 75.00, taxable: true, tags: ["permits", "administrative", "service"] },
    
    // Specialty Items
    { name: "Built-in Bench", description: "Custom built-in deck bench", category: "Installation", price: 650.00, cost: 300.00, ourPrice: 375.00, taxable: true, tags: ["furniture", "custom", "installation"] },
    { name: "Pergola Addition", description: "Deck pergola installation", category: "Installation", price: 2500.00, cost: 1200.00, ourPrice: 1500.00, taxable: true, tags: ["pergola", "shade", "installation"] },
    { name: "Lighting Package", description: "LED deck lighting system", category: "Equipment", price: 899.00, cost: 450.00, ourPrice: 550.00, taxable: true, tags: ["lighting", "electrical", "equipment"] },
    { name: "Cable Railing System", description: "Stainless steel cable railing per ft", category: "Materials", price: 125.00, cost: 75.00, ourPrice: 85.00, taxable: true, tags: ["railing", "cable", "premium"] },
    { name: "Hidden Fastener System", description: "Hidden deck fastener kit", category: "Materials", price: 89.99, cost: 55.00, ourPrice: 65.00, taxable: true, tags: ["fasteners", "hidden", "materials"] },
    { name: "Deck Inspection", description: "Professional deck safety inspection", category: "Service", price: 199.00, cost: 50.00, ourPrice: 75.00, taxable: true, tags: ["inspection", "safety", "service"] },
    { name: "Wood Sealer Application", description: "Premium wood sealer treatment", category: "Service", price: 4.50, cost: 2.00, ourPrice: 2.50, taxable: true, tags: ["sealer", "protection", "service"] },
  ],

  "Drain Repair": [
    // Services
    { name: "Drain Cleaning", description: "Professional drain cleaning service", category: "Service", price: 189.00, cost: 60.00, ourPrice: 80.00, taxable: true, tags: ["cleaning", "drain", "service"] },
    { name: "Video Camera Inspection", description: "Drain line video inspection", category: "Service", price: 299.00, cost: 100.00, ourPrice: 125.00, taxable: true, tags: ["inspection", "camera", "diagnostic"] },
    { name: "Hydro Jetting", description: "High pressure drain cleaning", category: "Service", price: 450.00, cost: 150.00, ourPrice: 200.00, taxable: true, tags: ["hydro-jet", "cleaning", "service"] },
    { name: "Drain Line Repair", description: "Repair damaged drain pipes", category: "Service", price: 650.00, cost: 250.00, ourPrice: 325.00, taxable: true, tags: ["repair", "pipes", "service"] },
    { name: "Emergency Drain Service", description: "24/7 emergency drain service", category: "Service", price: 299.00, cost: 100.00, ourPrice: 150.00, taxable: true, tags: ["emergency", "24/7", "service"] },
    
    // Parts & Materials
    { name: "P-Trap Assembly", description: "Complete P-trap kit", category: "Parts", price: 24.99, cost: 12.00, ourPrice: 15.00, taxable: true, tags: ["p-trap", "plumbing", "parts"] },
    { name: "Drain Snake 25ft", description: "Professional grade drain snake", category: "Equipment", price: 89.99, cost: 45.00, ourPrice: 55.00, taxable: true, tags: ["snake", "tool", "equipment"] },
    { name: "Drain Cleaner Solution", description: "Professional enzyme drain cleaner", category: "Materials", price: 34.99, cost: 18.00, ourPrice: 22.00, taxable: true, tags: ["cleaner", "chemical", "materials"] },
    { name: "Floor Drain Cover", description: "Stainless steel drain cover", category: "Parts", price: 19.99, cost: 10.00, ourPrice: 12.00, taxable: true, tags: ["cover", "drain", "parts"] },
    { name: "Drain Pipe 4in PVC", description: "10ft section of 4 inch PVC pipe", category: "Materials", price: 39.99, cost: 20.00, ourPrice: 25.00, taxable: true, tags: ["pipe", "pvc", "materials"] },
    
    // Specialized Services
    { name: "Tree Root Removal", description: "Remove tree roots from drain lines", category: "Service", price: 750.00, cost: 300.00, ourPrice: 400.00, taxable: true, tags: ["roots", "removal", "service"] },
    { name: "Drain Line Location", description: "Locate underground drain lines", category: "Service", price: 199.00, cost: 75.00, ourPrice: 100.00, taxable: true, tags: ["location", "diagnostic", "service"] },
    { name: "Grease Trap Cleaning", description: "Commercial grease trap service", category: "Service", price: 350.00, cost: 125.00, ourPrice: 175.00, taxable: true, tags: ["grease-trap", "commercial", "service"] },
    { name: "Sewer Line Replacement", description: "Full sewer line replacement per ft", category: "Service", price: 125.00, cost: 60.00, ourPrice: 75.00, taxable: true, tags: ["sewer", "replacement", "service"] },
    { name: "Backflow Prevention Install", description: "Install backflow prevention device", category: "Installation", price: 899.00, cost: 400.00, ourPrice: 500.00, taxable: true, tags: ["backflow", "prevention", "installation"] },
    { name: "Drain Maintenance Plan", description: "Annual drain maintenance contract", category: "Service", price: 399.00, cost: 100.00, ourPrice: 150.00, taxable: true, tags: ["maintenance", "contract", "service"] },
    { name: "Pipe Burst Repair", description: "Emergency pipe burst repair", category: "Service", price: 850.00, cost: 350.00, ourPrice: 450.00, taxable: true, tags: ["emergency", "repair", "service"] },
    { name: "Drain Field Inspection", description: "Septic drain field inspection", category: "Service", price: 299.00, cost: 100.00, ourPrice: 125.00, taxable: true, tags: ["septic", "inspection", "service"] },
    { name: "French Drain Installation", description: "Install french drain system per ft", category: "Installation", price: 65.00, cost: 30.00, ourPrice: 38.00, taxable: true, tags: ["french-drain", "installation", "service"] },
    { name: "Pipe Descaling Service", description: "Remove scale buildup from pipes", category: "Service", price: 550.00, cost: 200.00, ourPrice: 275.00, taxable: true, tags: ["descaling", "cleaning", "service"] },
  ],

  "Electrical Services": [
    // Services
    { name: "Electrical Inspection", description: "Complete electrical system inspection", category: "Service", price: 249.00, cost: 75.00, ourPrice: 100.00, taxable: true, tags: ["inspection", "safety", "service"] },
    { name: "Outlet Installation", description: "Install new electrical outlet", category: "Installation", price: 189.00, cost: 60.00, ourPrice: 80.00, taxable: true, tags: ["outlet", "installation", "service"] },
    { name: "Circuit Breaker Replacement", description: "Replace faulty circuit breaker", category: "Service", price: 225.00, cost: 85.00, ourPrice: 110.00, taxable: true, tags: ["breaker", "repair", "service"] },
    { name: "Panel Upgrade", description: "Upgrade electrical panel to 200 amp", category: "Installation", price: 2500.00, cost: 1200.00, ourPrice: 1500.00, taxable: true, tags: ["panel", "upgrade", "installation"] },
    { name: "Emergency Electrical Service", description: "24/7 emergency electrical repair", category: "Service", price: 299.00, cost: 100.00, ourPrice: 150.00, taxable: true, tags: ["emergency", "24/7", "service"] },
    
    // Parts & Materials
    { name: "GFCI Outlet", description: "Ground fault circuit interrupter outlet", category: "Parts", price: 24.99, cost: 12.00, ourPrice: 15.00, taxable: true, tags: ["gfci", "outlet", "parts"] },
    { name: "Circuit Breaker 20A", description: "20 amp single pole breaker", category: "Parts", price: 39.99, cost: 20.00, ourPrice: 25.00, taxable: true, tags: ["breaker", "20amp", "parts"] },
    { name: "14 AWG Wire", description: "14 gauge electrical wire per 100ft", category: "Materials", price: 89.99, cost: 45.00, ourPrice: 55.00, taxable: true, tags: ["wire", "14awg", "materials"] },
    { name: "Light Switch", description: "Single pole light switch", category: "Parts", price: 12.99, cost: 5.00, ourPrice: 7.00, taxable: true, tags: ["switch", "lighting", "parts"] },
    { name: "Junction Box", description: "4x4 electrical junction box", category: "Parts", price: 8.99, cost: 3.50, ourPrice: 4.50, taxable: true, tags: ["box", "junction", "parts"] },
    
    // Specialized Services
    { name: "Whole House Surge Protection", description: "Install surge protection system", category: "Installation", price: 599.00, cost: 250.00, ourPrice: 325.00, taxable: true, tags: ["surge", "protection", "installation"] },
    { name: "EV Charger Installation", description: "Install electric vehicle charger", category: "Installation", price: 1499.00, cost: 700.00, ourPrice: 900.00, taxable: true, tags: ["ev-charger", "installation", "service"] },
    { name: "Generator Installation", description: "Install backup generator system", category: "Installation", price: 3500.00, cost: 1800.00, ourPrice: 2200.00, taxable: true, tags: ["generator", "backup", "installation"] },
    { name: "Smart Home Wiring", description: "Wire home for smart devices", category: "Installation", price: 899.00, cost: 350.00, ourPrice: 450.00, taxable: true, tags: ["smart-home", "wiring", "installation"] },
    { name: "Lighting Design Service", description: "Professional lighting design consultation", category: "Service", price: 299.00, cost: 100.00, ourPrice: 125.00, taxable: true, tags: ["design", "lighting", "consultation"] },
    { name: "Code Violation Correction", description: "Fix electrical code violations", category: "Service", price: 399.00, cost: 150.00, ourPrice: 200.00, taxable: true, tags: ["code", "compliance", "service"] },
    { name: "Ceiling Fan Installation", description: "Install ceiling fan with wiring", category: "Installation", price: 289.00, cost: 100.00, ourPrice: 130.00, taxable: true, tags: ["fan", "ceiling", "installation"] },
    { name: "Outdoor Lighting Install", description: "Install outdoor landscape lighting", category: "Installation", price: 150.00, cost: 60.00, ourPrice: 75.00, taxable: true, tags: ["outdoor", "lighting", "installation"] },
    { name: "Hot Tub Wiring", description: "Wire 240V circuit for hot tub", category: "Installation", price: 799.00, cost: 350.00, ourPrice: 450.00, taxable: true, tags: ["hot-tub", "240v", "installation"] },
    { name: "Electrical Troubleshooting", description: "Diagnose electrical problems hourly", category: "Service", price: 125.00, cost: 50.00, ourPrice: 65.00, taxable: true, tags: ["troubleshooting", "diagnostic", "service"] },
  ],

  "Moving Services": [
    // Services
    { name: "Local Moving - 2 Movers", description: "2 movers with truck for local move", category: "Service", price: 149.00, cost: 70.00, ourPrice: 85.00, taxable: true, tags: ["local", "moving", "labor"] },
    { name: "Local Moving - 3 Movers", description: "3 movers with truck for local move", category: "Service", price: 199.00, cost: 95.00, ourPrice: 115.00, taxable: true, tags: ["local", "moving", "labor"] },
    { name: "Long Distance Moving", description: "Interstate moving service per mile", category: "Service", price: 4.50, cost: 2.25, ourPrice: 2.75, taxable: true, tags: ["long-distance", "interstate", "service"] },
    { name: "Packing Service", description: "Professional packing service per hour", category: "Service", price: 65.00, cost: 25.00, ourPrice: 35.00, taxable: true, tags: ["packing", "service", "labor"] },
    { name: "Loading/Unloading Only", description: "Labor only for loading/unloading", category: "Service", price: 89.00, cost: 40.00, ourPrice: 50.00, taxable: true, tags: ["labor", "loading", "service"] },
    
    // Materials & Supplies
    { name: "Moving Box - Small", description: "Small moving box 16x12x12", category: "Materials", price: 2.99, cost: 1.20, ourPrice: 1.60, taxable: true, tags: ["box", "packing", "supplies"] },
    { name: "Moving Box - Medium", description: "Medium moving box 18x18x16", category: "Materials", price: 3.99, cost: 1.80, ourPrice: 2.20, taxable: true, tags: ["box", "packing", "supplies"] },
    { name: "Moving Box - Large", description: "Large moving box 18x18x24", category: "Materials", price: 4.99, cost: 2.20, ourPrice: 2.80, taxable: true, tags: ["box", "packing", "supplies"] },
    { name: "Wardrobe Box", description: "Wardrobe box with hanging bar", category: "Materials", price: 14.99, cost: 7.50, ourPrice: 9.00, taxable: true, tags: ["wardrobe", "box", "supplies"] },
    { name: "Bubble Wrap Roll", description: "Bubble wrap 12in x 100ft", category: "Materials", price: 24.99, cost: 12.00, ourPrice: 15.00, taxable: true, tags: ["bubble-wrap", "packing", "protection"] },
    
    // Specialized Services
    { name: "Piano Moving", description: "Specialized piano moving service", category: "Service", price: 399.00, cost: 180.00, ourPrice: 225.00, taxable: true, tags: ["piano", "specialty", "service"] },
    { name: "Safe Moving", description: "Heavy safe moving and positioning", category: "Service", price: 299.00, cost: 125.00, ourPrice: 160.00, taxable: true, tags: ["safe", "heavy", "specialty"] },
    { name: "Furniture Assembly", description: "Assemble furniture after move", category: "Service", price: 75.00, cost: 30.00, ourPrice: 40.00, taxable: true, tags: ["assembly", "furniture", "service"] },
    { name: "Storage Service", description: "Monthly storage unit rental", category: "Service", price: 149.00, cost: 75.00, ourPrice: 90.00, taxable: true, tags: ["storage", "monthly", "service"] },
    { name: "Senior Moving Special", description: "Discounted moving for seniors", category: "Service", price: 119.00, cost: 60.00, ourPrice: 70.00, taxable: true, tags: ["senior", "discount", "service"] },
    { name: "Office Moving", description: "Commercial office relocation per hour", category: "Service", price: 225.00, cost: 110.00, ourPrice: 135.00, taxable: true, tags: ["office", "commercial", "service"] },
    { name: "Packing Materials Kit", description: "Complete packing supplies bundle", category: "Materials", price: 89.99, cost: 40.00, ourPrice: 50.00, taxable: true, tags: ["kit", "bundle", "supplies"] },
    { name: "Appliance Dolly Rental", description: "Heavy duty appliance dolly rental", category: "Equipment", price: 39.99, cost: 15.00, ourPrice: 20.00, taxable: true, tags: ["dolly", "equipment", "rental"] },
    { name: "Moving Insurance", description: "Additional moving insurance coverage", category: "Service", price: 99.00, cost: 35.00, ourPrice: 45.00, taxable: true, tags: ["insurance", "protection", "service"] },
    { name: "Cleaning Service", description: "Post-move cleaning service", category: "Service", price: 199.00, cost: 80.00, ourPrice: 100.00, taxable: true, tags: ["cleaning", "post-move", "service"] },
  ],

  "Plumbing Services": [
    // Services
    { name: "Drain Cleaning", description: "Professional drain cleaning service", category: "Service", price: 189.00, cost: 60.00, ourPrice: 80.00, taxable: true, tags: ["drain", "cleaning", "service"] },
    { name: "Leak Detection", description: "Electronic leak detection service", category: "Service", price: 299.00, cost: 100.00, ourPrice: 125.00, taxable: true, tags: ["leak", "detection", "diagnostic"] },
    { name: "Water Heater Install", description: "Tank water heater installation", category: "Installation", price: 899.00, cost: 400.00, ourPrice: 500.00, taxable: true, tags: ["water-heater", "installation", "service"] },
    { name: "Toilet Installation", description: "Install new toilet complete", category: "Installation", price: 299.00, cost: 120.00, ourPrice: 150.00, taxable: true, tags: ["toilet", "installation", "service"] },
    { name: "Emergency Plumbing", description: "24/7 emergency plumbing service", category: "Service", price: 299.00, cost: 100.00, ourPrice: 150.00, taxable: true, tags: ["emergency", "24/7", "service"] },
    
    // Parts & Materials
    { name: "Kitchen Faucet", description: "Single handle kitchen faucet", category: "Fixtures", price: 189.99, cost: 95.00, ourPrice: 115.00, taxable: true, tags: ["faucet", "kitchen", "fixture"] },
    { name: "Toilet - Standard", description: "Standard efficiency toilet", category: "Fixtures", price: 249.99, cost: 125.00, ourPrice: 150.00, taxable: true, tags: ["toilet", "standard", "fixture"] },
    { name: "P-Trap Assembly", description: "Complete P-trap kit", category: "Parts", price: 24.99, cost: 12.00, ourPrice: 15.00, taxable: true, tags: ["p-trap", "drain", "parts"] },
    { name: "Shut Off Valve", description: "1/2 inch shut off valve", category: "Parts", price: 14.99, cost: 6.00, ourPrice: 8.00, taxable: true, tags: ["valve", "shutoff", "parts"] },
    { name: "Copper Pipe 1/2\"", description: "Type L copper pipe per foot", category: "Materials", price: 8.99, cost: 4.50, ourPrice: 5.50, taxable: true, tags: ["copper", "pipe", "materials"] },
    
    // Specialized Services
    { name: "Tankless Water Heater", description: "Install tankless water heater", category: "Installation", price: 2499.00, cost: 1200.00, ourPrice: 1500.00, taxable: true, tags: ["tankless", "water-heater", "installation"] },
    { name: "Sewer Line Replacement", description: "Replace main sewer line per ft", category: "Service", price: 125.00, cost: 60.00, ourPrice: 75.00, taxable: true, tags: ["sewer", "replacement", "service"] },
    { name: "Garbage Disposal Install", description: "Install garbage disposal unit", category: "Installation", price: 299.00, cost: 120.00, ourPrice: 150.00, taxable: true, tags: ["disposal", "kitchen", "installation"] },
    { name: "Water Softener Install", description: "Install water softener system", category: "Installation", price: 1799.00, cost: 850.00, ourPrice: 1050.00, taxable: true, tags: ["softener", "water", "installation"] },
    { name: "Pipe Insulation", description: "Insulate pipes for winter", category: "Service", price: 12.00, cost: 5.00, ourPrice: 6.50, taxable: true, tags: ["insulation", "winterize", "service"] },
    { name: "Backflow Testing", description: "Annual backflow prevention test", category: "Service", price: 149.00, cost: 50.00, ourPrice: 65.00, taxable: true, tags: ["backflow", "testing", "service"] },
    { name: "Shower Valve Replacement", description: "Replace shower mixing valve", category: "Service", price: 399.00, cost: 160.00, ourPrice: 200.00, taxable: true, tags: ["shower", "valve", "repair"] },
    { name: "Water Line Installation", description: "Install new water line per ft", category: "Installation", price: 45.00, cost: 20.00, ourPrice: 25.00, taxable: true, tags: ["water-line", "installation", "service"] },
    { name: "Hydro Jetting", description: "High pressure drain cleaning", category: "Service", price: 450.00, cost: 150.00, ourPrice: 200.00, taxable: true, tags: ["hydro-jet", "drain", "service"] },
    { name: "Gas Line Installation", description: "Install gas line for appliances", category: "Installation", price: 599.00, cost: 250.00, ourPrice: 325.00, taxable: true, tags: ["gas-line", "installation", "service"] },
  ],

  "Waterproofing": [
    // Services
    { name: "Foundation Waterproofing", description: "Exterior foundation waterproofing per ft", category: "Service", price: 125.00, cost: 55.00, ourPrice: 70.00, taxable: true, tags: ["foundation", "exterior", "waterproofing"] },
    { name: "Basement Inspection", description: "Complete basement moisture inspection", category: "Service", price: 299.00, cost: 100.00, ourPrice: 125.00, taxable: true, tags: ["inspection", "basement", "diagnostic"] },
    { name: "Sump Pump Installation", description: "Install sump pump system complete", category: "Installation", price: 1499.00, cost: 650.00, ourPrice: 825.00, taxable: true, tags: ["sump-pump", "installation", "drainage"] },
    { name: "French Drain System", description: "Interior french drain per linear ft", category: "Installation", price: 85.00, cost: 40.00, ourPrice: 50.00, taxable: true, tags: ["french-drain", "interior", "drainage"] },
    { name: "Crack Injection Repair", description: "Polyurethane crack injection", category: "Service", price: 399.00, cost: 150.00, ourPrice: 200.00, taxable: true, tags: ["crack", "injection", "repair"] },
    
    // Materials & Products
    { name: "Waterproofing Membrane", description: "Rubberized asphalt membrane per sq ft", category: "Materials", price: 4.99, cost: 2.50, ourPrice: 3.00, taxable: true, tags: ["membrane", "materials", "waterproofing"] },
    { name: "Drainage Board", description: "Dimpled drainage board per sq ft", category: "Materials", price: 2.99, cost: 1.50, ourPrice: 1.80, taxable: true, tags: ["drainage", "board", "materials"] },
    { name: "Hydraulic Cement", description: "50lb bag quick-set hydraulic cement", category: "Materials", price: 24.99, cost: 12.00, ourPrice: 15.00, taxable: true, tags: ["cement", "hydraulic", "materials"] },
    { name: "Sealant - Polyurethane", description: "Commercial grade polyurethane sealant", category: "Materials", price: 14.99, cost: 7.00, ourPrice: 9.00, taxable: true, tags: ["sealant", "polyurethane", "materials"] },
    { name: "Vapor Barrier", description: "20 mil vapor barrier per sq ft", category: "Materials", price: 0.89, cost: 0.40, ourPrice: 0.50, taxable: true, tags: ["vapor-barrier", "materials", "moisture"] },
    
    // Specialized Services
    { name: "Crawl Space Encapsulation", description: "Complete crawl space encapsulation", category: "Service", price: 4500.00, cost: 2000.00, ourPrice: 2600.00, taxable: true, tags: ["crawl-space", "encapsulation", "service"] },
    { name: "Exterior Drainage System", description: "Install exterior drainage system", category: "Installation", price: 150.00, cost: 70.00, ourPrice: 85.00, taxable: true, tags: ["drainage", "exterior", "installation"] },
    { name: "Mold Remediation", description: "Professional mold removal per sq ft", category: "Service", price: 15.00, cost: 7.00, ourPrice: 9.00, taxable: true, tags: ["mold", "remediation", "service"] },
    { name: "Window Well Installation", description: "Install window well with drainage", category: "Installation", price: 799.00, cost: 350.00, ourPrice: 450.00, taxable: true, tags: ["window-well", "installation", "drainage"] },
    { name: "Dehumidifier System", description: "Commercial grade dehumidifier install", category: "Installation", price: 1999.00, cost: 950.00, ourPrice: 1200.00, taxable: true, tags: ["dehumidifier", "moisture", "installation"] },
    { name: "Grading & Landscaping", description: "Regrade for water management", category: "Service", price: 75.00, cost: 35.00, ourPrice: 45.00, taxable: true, tags: ["grading", "landscaping", "drainage"] },
    { name: "Gutter & Downspout", description: "Install gutters with downspouts per ft", category: "Installation", price: 12.00, cost: 6.00, ourPrice: 7.50, taxable: true, tags: ["gutter", "downspout", "installation"] },
    { name: "Waterproofing Paint", description: "Apply waterproof coating per sq ft", category: "Service", price: 3.50, cost: 1.50, ourPrice: 2.00, taxable: true, tags: ["paint", "coating", "service"] },
    { name: "Foundation Repair", description: "Structural foundation repair", category: "Service", price: 3500.00, cost: 1600.00, ourPrice: 2000.00, taxable: true, tags: ["foundation", "structural", "repair"] },
    { name: "Emergency Water Extraction", description: "24/7 water removal service", category: "Service", price: 599.00, cost: 250.00, ourPrice: 325.00, taxable: true, tags: ["emergency", "water", "extraction"] },
  ]
};

// Helper function to get products for a specific niche
export function getProductsForNiche(niche: string): Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'created_by'>[] {
  return nicheProducts[niche] || [];
}

// Helper function to get all available niches
export function getAvailableNiches(): string[] {
  return Object.keys(nicheProducts);
}
